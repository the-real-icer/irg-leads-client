import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { confirmDialog } from 'primereact/confirmdialog';

import MainLayout from '../../components/layout/MainLayout';
import PropertySearch from '../../components/ScheduleShowings/PropertySearch';
import TourList from '../../components/ScheduleShowings/TourList';
import TourMap from '../../components/ScheduleShowings/TourMap';
import TourHeader from '../../components/ScheduleShowings/TourHeader';
import SavedToursList from '../../components/ScheduleShowings/SavedToursList';
import StopEditDialog from '../../components/ScheduleShowings/StopEditDialog';
import PrintDocumentShell from '../../components/Print/PrintDocumentShell';
import PrintableTourPacket from '../../components/Print/PrintableTourPacket';
import {
    buildTourSnapshot,
    hasUsableMlsNumber,
    hasValidCoords,
    isAlreadyInTour,
    normalizeMlsNumber,
    stopForPrint,
    stopFromSuggestResult,
} from '../../components/ScheduleShowings/tourHelpers';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

import styles from './index.module.css';

// PrimeReact ConfirmDialog is a portal component — dynamic-imported with
// ssr: false so Next.js doesn't try to render it on the server. The
// imperative `confirmDialog(...)` function is safe to import statically;
// it just enqueues dialog events that this mounted instance consumes.
const ConfirmDialog = dynamic(
    () => import('primereact/confirmdialog').then((mod) => mod.ConfirmDialog),
    { ssr: false },
);

// How long the transient 'saved' state lingers before fading back to 'clean'.
const SAVED_FLASH_MS = 2000;

const EMPTY_SNAPSHOT = buildTourSnapshot({
    name: '', client: null, scheduledDate: null, stops: [],
});

const toValidIsoString = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const needsDiscardConfirm = (state) => ['dirty', 'saving', 'error'].includes(state);

const ScheduleShowings = () => {
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // Tour editor state
    const [tourId, setTourId] = useState(null);
    const [name, setName] = useState('');
    const [stops, setStops] = useState([]);
    const [client, setClient] = useState(null);
    const [scheduledDate, setScheduledDate] = useState(null);

    // Save state
    const [saveState, setSaveState] = useState('clean');
    const [lastSavedAt, setLastSavedAt] = useState(null);

    // Saved-tours sidebar state
    const [savedTours, setSavedTours] = useState([]);
    const [loadingTours, setLoadingTours] = useState(false);
    const [loadingActiveTour, setLoadingActiveTour] = useState(false);

    // Per-stop edit dialog. When non-null, the dialog is open for that
    // stop; null when closed.
    const [editingStop, setEditingStop] = useState(null);
    const [printGeneratedAt, setPrintGeneratedAt] = useState(() => new Date());

    // Print packet: the editor's `stops` are slim (map/list state). For the
    // printed packet we hydrate full property detail per stop (high-res hero +
    // all photos + listing details) into `printStops`. `preparingPrint` drives
    // the brief "Preparing packet…" indicator while detail fetches resolve.
    const [printStops, setPrintStops] = useState(null);
    const [preparingPrint, setPreparingPrint] = useState(false);

    // Guard against stale tour loads when the user clicks another tour
    // while a load is in flight.
    const loadingTourIdRef = useRef(null);
    const activeLoadTokenRef = useRef(0);
    const printCleanupRef = useRef(null);
    // mls_number -> full property detail. Cached so reprinting (or editing a
    // note/time) rebuilds the packet without refetching unchanged properties.
    const printDetailCacheRef = useRef(new Map());
    // Set true after a hydration so the print effect fires once the hydrated
    // packet has rendered.
    const pendingPrintRef = useRef(false);

    // Snapshot of the last-saved tour for dirty comparison.
    const lastSavedSnapshotRef = useRef(EMPTY_SNAPSHOT);
    const failedSaveSnapshotRef = useRef(null);

    const isNewTour = tourId === null;
    const canSave = Boolean(name.trim())
        && stops.length > 0
        && saveState !== 'saving'
        && !loadingActiveTour;
    const hasUnsavedPrintState = ['dirty', 'saving', 'error'].includes(saveState);

    const authHeaders = {
        Authorization: `Bearer ${isLoggedIn}`,
    };

    // --- Dirty tracking --------------------------------------------------
    // Compare current editor state against the last-saved snapshot.
    // A failed save keeps Retry available for the exact failed payload,
    // but any subsequent edit should return the indicator to dirty.
    useEffect(() => {
        if (saveState === 'saving' || saveState === 'saved') {
            return;
        }
        const currentSnapshot = buildTourSnapshot({ name, client, scheduledDate, stops });
        if (saveState === 'error' && currentSnapshot === failedSaveSnapshotRef.current) {
            return;
        }
        const matches = currentSnapshot === lastSavedSnapshotRef.current;
        if (matches && saveState !== 'clean') {
            setSaveState('clean');
        } else if (!matches && saveState !== 'dirty') {
            setSaveState('dirty');
        }
    }, [name, client, scheduledDate, stops, saveState]);

    // 'saved' auto-fades to 'clean' after SAVED_FLASH_MS so the indicator
    // becomes the quieter "Saved · Xs ago" form.
    useEffect(() => {
        if (saveState !== 'saved') return undefined;
        const timer = setTimeout(() => setSaveState('clean'), SAVED_FLASH_MS);
        return () => clearTimeout(timer);
    }, [saveState]);

    // --- Saved tours list -----------------------------------------------
    const fetchSavedTours = useCallback(async () => {
        setLoadingTours(true);
        try {
            const res = await IrgApi.get('/tours', { headers: authHeaders });
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            setSavedTours(list);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to load saved tours', err);
        } finally {
            setLoadingTours(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchSavedTours();
    }, [isLoggedIn, fetchSavedTours]);

    useEffect(() => () => {
        if (printCleanupRef.current) {
            printCleanupRef.current();
        }
    }, []);

    // --- Editor handlers ------------------------------------------------
    const handleAdd = useCallback((stop) => {
        if (loadingActiveTour) return;
        if (!hasUsableMlsNumber(stop?.mls_number)) {
            showToast('warn', 'That property is missing an MLS number and cannot be added.', 'Not Added');
            return;
        }
        const normalizedStop = {
            ...stop,
            mls_number: normalizeMlsNumber(stop.mls_number),
        };
        setStops((prev) => {
            if (isAlreadyInTour(prev, normalizedStop.mls_number)) return prev;
            return [...prev, normalizedStop];
        });
    }, [loadingActiveTour]);

    const handleRemove = useCallback((mlsNumber) => {
        if (loadingActiveTour) return;
        setStops((prev) => prev.filter((s) => s.mls_number !== mlsNumber));
    }, [loadingActiveTour]);

    const handleReorder = useCallback((nextStops) => {
        if (loadingActiveTour) return;
        setStops(nextStops);
    }, [loadingActiveTour]);

    // Open the per-stop edit dialog for a given stop
    const handleEditStop = useCallback((stop) => {
        if (loadingActiveTour) return;
        setEditingStop(stop);
    }, [loadingActiveTour]);

    // Merge dialog updates back into the stops array by mls_number.
    // Touches setStops → dirty-tracking effect flips saveState to 'dirty'
    // so the header's Save button lights up. No separate persistence call.
    const handleStopUpdate = useCallback((updates) => {
        if (loadingActiveTour) return;
        setEditingStop((current) => {
            if (!current) return null;
            setStops((prev) => prev.map((s) => (
                s.mls_number === current.mls_number
                    ? { ...s, ...updates }
                    : s
            )));
            return null;
        });
    }, [loadingActiveTour]);

    const handleStopEditCancel = useCallback(() => {
        setEditingStop(null);
    }, []);

    // --- Save -----------------------------------------------------------
    // Wrap EVERYTHING (including body construction) in try/catch so no
    // exception path can escape. Guarantees saveState transitions out of
    // 'saving' — either to 'saved' (happy) or 'error' (any failure).
    const handleSave = useCallback(async () => {
        if (!canSave) return;
        const saveSnapshot = buildTourSnapshot({ name, client, scheduledDate, stops });

        try {
            setSaveState('saving');

            const body = {
                name: name.trim(),
                client: client?._id || null,
                scheduled_date: toValidIsoString(scheduledDate),
                stops: stops.map((s, index) => ({
                    mls_number: s.mls_number,
                    order: index,
                    status: s.status || 'pending',
                    note: s.note || '',
                    scheduled_time: s.scheduled_time || null,
                })),
            };

            let saved;
            if (tourId === null) {
                const res = await IrgApi.post('/tours', body, { headers: authHeaders });
                saved = res?.data?.data;
            } else {
                const res = await IrgApi.patch(`/tours/${tourId}`, body, { headers: authHeaders });
                saved = res?.data?.data;
            }

            if (saved?._id) {
                setTourId(saved._id);
            }

            // Reset the dirty-tracking snapshot based on what we just sent.
            failedSaveSnapshotRef.current = null;
            lastSavedSnapshotRef.current = saveSnapshot;
            setLastSavedAt(new Date());
            setSaveState('saved');

            // Refresh the sidebar so the new/updated tour appears immediately.
            fetchSavedTours();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[schedule-showings] save failed', err);
            failedSaveSnapshotRef.current = saveSnapshot;
            setSaveState('error');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSave, name, client, scheduledDate, stops, tourId, isLoggedIn, fetchSavedTours]);

    // --- Load an existing tour ------------------------------------------
    // Split into a pure-effect `doLoad` function that performs the fetch
    // and state updates, and a thin outer handler that gates it on
    // whether we need a discard-changes confirm first.
    const doLoadTour = useCallback(async (id) => {
        const loadToken = activeLoadTokenRef.current + 1;
        activeLoadTokenRef.current = loadToken;
        loadingTourIdRef.current = id;
        setLoadingActiveTour(true);
        setEditingStop(null);
        const isCurrentLoad = () => (
            activeLoadTokenRef.current === loadToken && loadingTourIdRef.current === id
        );

        try {
            const res = await IrgApi.get(`/tours/${id}`, { headers: authHeaders });
            if (!isCurrentLoad()) return; // stale

            const tour = res?.data?.data;
            if (!tour) throw new Error('Tour not found');

            const orderedStops = Array.isArray(tour.stops)
                ? [...tour.stops].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                : [];
            const seenMlsNumbers = new Set();
            let invalidSavedStops = 0;
            let duplicateSavedStops = 0;
            const loadableStops = [];

            orderedStops.forEach((stop) => {
                const normalizedMlsNumber = normalizeMlsNumber(stop?.mls_number);
                if (!normalizedMlsNumber) {
                    invalidSavedStops += 1;
                    return;
                }
                if (seenMlsNumbers.has(normalizedMlsNumber)) {
                    duplicateSavedStops += 1;
                    return;
                }
                seenMlsNumbers.add(normalizedMlsNumber);
                loadableStops.push({ ...stop, mls_number: normalizedMlsNumber });
            });

            // Fetch each stop's MLS property in parallel. Some may fail
            // (property removed from MLS since the tour was saved); we
            // keep a non-map fallback stop so legacy tours do not lose data.
            const fetches = loadableStops.map((s) =>
                IrgApi.get(`/mlsproperties/mls-number/${encodeURIComponent(s.mls_number)}`, {
                    headers: authHeaders,
                })
                    .then((r) => ({ ok: true, raw: r?.data?.data?.result, stop: s }))
                    .catch(() => ({ ok: false, stop: s })),
            );
            const results = await Promise.all(fetches);

            if (!isCurrentLoad()) return; // stale

            const rebuilt = [];
            let missing = 0;
            let invalidCoords = 0;
            results.forEach((r) => {
                if (!r.ok || !r.raw) {
                    missing += 1;
                    rebuilt.push({
                        mls_number: r.stop.mls_number,
                        address: `MLS #${r.stop.mls_number}`,
                        city: '',
                        state: '',
                        zip_code: '',
                        price: '',
                        coordinates: null,
                        mapUnavailable: true,
                        status: r.stop.status || 'pending',
                        note: r.stop.note || '',
                        scheduled_time: r.stop.scheduled_time || null,
                    });
                    return;
                }
                const stop = stopFromSuggestResult(r.raw);
                if (!hasUsableMlsNumber(stop?.mls_number)) {
                    invalidSavedStops += 1;
                    return;
                }
                if (!hasValidCoords(stop)) {
                    invalidCoords += 1;
                }
                // Carry forward per-stop note / scheduled_time from the saved tour.
                rebuilt.push({
                    ...stop,
                    mapUnavailable: !hasValidCoords(stop),
                    status: r.stop.status || 'pending',
                    note: r.stop.note || '',
                    scheduled_time: r.stop.scheduled_time || null,
                });
            });

            const warningParts = [];
            if (missing > 0) {
                warningParts.push(`${missing} saved stop${missing === 1 ? '' : 's'} could not be refreshed from MLS`);
            }
            if (invalidCoords > 0) {
                warningParts.push(`${invalidCoords} stop${invalidCoords === 1 ? ' has' : 's have'} no map coordinates`);
            }
            if (invalidSavedStops > 0) {
                const suffix = invalidSavedStops === 1 ? ' was' : 's were';
                warningParts.push(
                    `${invalidSavedStops} saved stop${suffix} missing an MLS number and omitted`,
                );
            }
            if (duplicateSavedStops > 0) {
                const suffix = duplicateSavedStops === 1 ? ' was' : 's were';
                warningParts.push(`${duplicateSavedStops} duplicate saved stop${suffix} omitted`);
            }
            if (warningParts.length > 0) {
                showToast('warn', warningParts.join('. '), 'Tour Loaded With Warnings');
            }

            const nextName = tour.name || '';
            const nextClient = tour.client && typeof tour.client === 'object' && tour.client._id
                ? {
                    _id: tour.client._id,
                    first_name: tour.client.first_name || '',
                    last_name: tour.client.last_name || '',
                    email: tour.client.email || '',
                    phone_number: tour.client.phone_number || '',
                }
                : null;
            const nextScheduled = tour.scheduled_date ? new Date(tour.scheduled_date) : null;

            setTourId(tour._id);
            setName(nextName);
            setClient(nextClient);
            setScheduledDate(nextScheduled);
            setStops(rebuilt);
            setLastSavedAt(tour.updatedAt ? new Date(tour.updatedAt) : new Date());

            // Reset dirty snapshot to match freshly loaded state so
            // saveState settles back to 'clean' on the next tick.
            lastSavedSnapshotRef.current = buildTourSnapshot({
                name: nextName,
                client: nextClient,
                scheduledDate: nextScheduled,
                stops: rebuilt,
            });
            failedSaveSnapshotRef.current = null;
            setSaveState('clean');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Tour load failed', err);
            showToast('error', 'Could not load that tour. Please try again.', 'Load Failed');
        } finally {
            if (isCurrentLoad()) {
                loadingTourIdRef.current = null;
                setLoadingActiveTour(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const handleLoadTour = useCallback((id) => {
        if (!id || loadingActiveTour) return;
        if (needsDiscardConfirm(saveState)) {
            confirmDialog({
                message: 'Unsaved changes will be lost. Load the selected tour?',
                header: 'Discard changes?',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Discard and load',
                rejectLabel: 'Keep editing',
                acceptClassName: 'p-button-danger',
                accept: () => { doLoadTour(id); },
            });
        } else {
            doLoadTour(id);
        }
    }, [saveState, loadingActiveTour, doLoadTour]);

    // --- New tour -------------------------------------------------------
    const resetEditor = useCallback(() => {
        activeLoadTokenRef.current += 1;
        loadingTourIdRef.current = null;
        setLoadingActiveTour(false);
        setTourId(null);
        setName('');
        setStops([]);
        setClient(null);
        setScheduledDate(null);
        setLastSavedAt(null);
        lastSavedSnapshotRef.current = EMPTY_SNAPSHOT;
        failedSaveSnapshotRef.current = null;
        setSaveState('clean');
    }, []);

    const handleNewTour = useCallback(() => {
        if (loadingActiveTour) return;
        if (needsDiscardConfirm(saveState)) {
            confirmDialog({
                message: 'Unsaved changes will be lost. Start a new tour?',
                header: 'Discard changes?',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Discard',
                rejectLabel: 'Keep editing',
                acceptClassName: 'p-button-danger',
                accept: resetEditor,
            });
        } else {
            resetEditor();
        }
    }, [saveState, loadingActiveTour, resetEditor]);

    // --- Delete a saved tour --------------------------------------------
    // Page owns the confirm so PrimeReact's themed dialog (portaled to
    // <ConfirmDialog /> rendered below) is used consistently — no more
    // window.confirm. SavedToursList calls onDelete(id, name); we show
    // the confirm and perform the actual API call on accept.
    const handleDeleteTour = useCallback((id, tourName) => {
        if (loadingActiveTour) return;
        const displayName = tourName && tourName.trim() ? tourName : 'Untitled tour';
        confirmDialog({
            message: `Delete "${displayName}"?`,
            header: 'Delete tour?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Delete',
            rejectLabel: 'Cancel',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await IrgApi.delete(`/tours/${id}`, { headers: authHeaders });
                    // If the currently loaded tour was deleted, detach
                    // its mongo _id so the next save creates a new
                    // record. Keep the editor contents so the agent
                    // doesn't lose in-progress work.
                    if (id === tourId) {
                        setTourId(null);
                        setLastSavedAt(null);
                        lastSavedSnapshotRef.current = EMPTY_SNAPSHOT;
                        setSaveState('dirty');
                    }
                    fetchSavedTours();
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('[schedule-showings] delete failed', err);
                    showToast('error', 'Could not delete that tour. Please try again.', 'Delete Failed');
                }
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId, isLoggedIn, loadingActiveTour, fetchSavedTours]);

    // Open the browser print dialog for the (already-rendered) packet. The
    // packet is mounted in a body-level portal; this class lets print CSS hide
    // the CRM shell without affecting the on-screen layout before/after print.
    const triggerBrowserPrint = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (printCleanupRef.current) return;
        const body = window.document.body;
        const cleanup = () => {
            body.classList.remove('printing-tour-packet');
            window.removeEventListener('afterprint', cleanup);
            printCleanupRef.current = null;
        };
        printCleanupRef.current = cleanup;
        body.classList.add('printing-tour-packet');
        window.addEventListener('afterprint', cleanup);
        window.requestAnimationFrame(() => {
            window.print();
        });
    }, []);

    // Fire the print dialog once the hydrated packet has rendered. Using an
    // effect (rather than printing inline) guarantees React has committed the
    // full-detail `printStops` into the portal before window.print() runs.
    useEffect(() => {
        if (pendingPrintRef.current && Array.isArray(printStops)) {
            pendingPrintRef.current = false;
            triggerBrowserPrint();
        }
    }, [printStops, triggerBrowserPrint]);

    const handlePrintTour = useCallback(async () => {
        if (loadingActiveTour || stops.length === 0 || typeof window === 'undefined') return;
        if (printCleanupRef.current || preparingPrint) return;
        setPrintGeneratedAt(new Date());

        // Hydrate full property detail per stop (high-res hero + all photos +
        // listing details). Detail is cached per mls_number, so reprinting or
        // editing a note/time rebuilds the packet without refetching. Only
        // properties not already cached trigger a network call.
        const cache = printDetailCacheRef.current;
        const needsFetch = stops.some((s) => {
            const mls = normalizeMlsNumber(s.mls_number);
            return mls && !cache.has(mls);
        });

        if (needsFetch) {
            setPreparingPrint(true);
            showToast('info', 'Preparing packet…', 'Print');
        }

        try {
            const hydrated = await Promise.all(stops.map(async (s) => {
                const mls = normalizeMlsNumber(s.mls_number);
                if (!mls) return s; // no MLS number → keep the slim stop as-is
                if (!cache.has(mls)) {
                    try {
                        const res = await IrgApi.get(
                            `/mlsproperties/mls-number/${encodeURIComponent(mls)}`,
                            { headers: authHeaders },
                        );
                        const raw = res?.data?.data?.result || null;
                        if (raw) cache.set(mls, raw);
                    } catch {
                        // Resilient: a property removed from MLS since the tour
                        // was saved falls back to the slim stop below.
                    }
                }
                const detail = cache.get(mls);
                return detail ? stopForPrint(detail, s) : s;
            }));

            pendingPrintRef.current = true;
            setPrintStops(hydrated); // print effect fires after this renders
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[schedule-showings] print hydration failed', err);
            pendingPrintRef.current = false;
            showToast('error', 'Could not prepare the packet. Please try again.', 'Print Failed');
        } finally {
            setPreparingPrint(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingActiveTour, stops, preparingPrint, isLoggedIn, triggerBrowserPrint]);

    // --- Render ---------------------------------------------------------
    return (
        <MainLayout title="Schedule Showings">
            {/* Singleton PrimeReact dialog — consumes imperative
                confirmDialog(...) events from handlers above. Themed
                automatically for light/dark mode. */}
            <ConfirmDialog />
            <StopEditDialog
                stop={editingStop}
                onSave={handleStopUpdate}
                onCancel={handleStopEditCancel}
                disabled={loadingActiveTour}
            />
            <div className="p-[24px] flex flex-col gap-[24px] w-full">
                <TourHeader
                    name={name}
                    onNameChange={setName}
                    client={client}
                    onClientChange={setClient}
                    scheduledDate={scheduledDate}
                    onScheduledDateChange={setScheduledDate}
                    saveState={saveState}
                    isNewTour={isNewTour}
                    canSave={canSave}
                    lastSavedAt={lastSavedAt}
                    onSave={handleSave}
                    onNewTour={handleNewTour}
                    onPrintTour={handlePrintTour}
                    canPrint={stops.length > 0 && !loadingActiveTour && !preparingPrint}
                    hasUnsavedPrintState={hasUnsavedPrintState}
                    disabled={loadingActiveTour}
                />

                <div className={styles.tourGrid}>
                    <div className="flex flex-col gap-[16px] min-w-0">
                        <PropertySearch
                            stops={stops}
                            onAdd={handleAdd}
                            disabled={loadingActiveTour}
                        />
                        <TourList
                            stops={stops}
                            onRemove={handleRemove}
                            onReorder={handleReorder}
                            onEditStop={handleEditStop}
                            disabled={loadingActiveTour}
                        />
                        <SavedToursList
                            tours={savedTours}
                            activeTourId={tourId}
                            loading={loadingTours}
                            loadingActiveTour={loadingActiveTour}
                            onLoad={handleLoadTour}
                            onDelete={handleDeleteTour}
                        />
                    </div>

                    <div className="min-w-0">
                        <TourMap stops={stops} />
                    </div>
                </div>
            </div>
            <PrintDocumentShell>
                <PrintableTourPacket
                    name={name}
                    client={client}
                    agent={agent}
                    scheduledDate={scheduledDate}
                    stops={printStops || stops}
                    generatedAt={printGeneratedAt}
                    hasUnsavedChanges={hasUnsavedPrintState}
                />
            </PrintDocumentShell>
        </MainLayout>
    );
};

export default ScheduleShowings;
