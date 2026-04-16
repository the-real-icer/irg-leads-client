import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import MainLayout from '../../components/layout/MainLayout';
import PropertySearch from '../../components/ScheduleShowings/PropertySearch';
import TourList from '../../components/ScheduleShowings/TourList';
import TourMap from '../../components/ScheduleShowings/TourMap';
import TourHeader from '../../components/ScheduleShowings/TourHeader';
import SavedToursList from '../../components/ScheduleShowings/SavedToursList';
import {
    buildTourSnapshot,
    isAlreadyInTour,
    stopFromSuggestResult,
} from '../../components/ScheduleShowings/tourHelpers';
import IrgApi from '../../assets/irgApi';

import styles from './index.module.css';

// How long the transient 'saved' state lingers before fading back to 'clean'.
const SAVED_FLASH_MS = 2000;

const EMPTY_SNAPSHOT = buildTourSnapshot({
    name: '', client: null, scheduledDate: null, stops: [],
});

const ScheduleShowings = () => {
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

    // Guard against stale tour loads when the user clicks another tour
    // while a load is in flight.
    const loadingTourIdRef = useRef(null);

    // Snapshot of the last-saved tour for dirty comparison.
    const lastSavedSnapshotRef = useRef(EMPTY_SNAPSHOT);

    const isNewTour = tourId === null;
    const canSave = Boolean(name.trim()) && stops.length > 0 && saveState !== 'saving';

    const authHeaders = {
        Authorization: `Bearer ${isLoggedIn}`,
    };

    // --- Dirty tracking --------------------------------------------------
    // Compare current editor state against the last-saved snapshot.
    // Flip saveState between 'clean' and 'dirty' based on the diff,
    // unless we're mid-save or in the transient 'saved'/'error' states
    // (those transition themselves).
    useEffect(() => {
        if (saveState === 'saving' || saveState === 'saved' || saveState === 'error') {
            return;
        }
        const currentSnapshot = buildTourSnapshot({ name, client, scheduledDate, stops });
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

    // --- Editor handlers ------------------------------------------------
    const handleAdd = useCallback((stop) => {
        setStops((prev) => {
            if (isAlreadyInTour(prev, stop.mls_number)) return prev;
            return [...prev, stop];
        });
    }, []);

    const handleRemove = useCallback((mlsNumber) => {
        setStops((prev) => prev.filter((s) => s.mls_number !== mlsNumber));
    }, []);

    // --- Save -----------------------------------------------------------
    const handleSave = useCallback(async () => {
        if (!canSave) return;
        setSaveState('saving');

        const body = {
            name: name.trim(),
            client: client?._id || null,
            scheduled_date: scheduledDate ? scheduledDate.toISOString() : null,
            stops: stops.map((s, index) => ({
                mls_number: s.mls_number,
                order: index,
                note: s.note || '',
                scheduled_time: s.scheduled_time || null,
            })),
        };

        try {
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
            // Using the current state is equivalent because the POST body
            // was built from it.
            lastSavedSnapshotRef.current = buildTourSnapshot({
                name, client, scheduledDate, stops,
            });
            setLastSavedAt(new Date());
            setSaveState('saved');

            // Refresh the sidebar so the new/updated tour appears immediately.
            fetchSavedTours();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Tour save failed', err);
            setSaveState('error');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSave, name, client, scheduledDate, stops, tourId, isLoggedIn, fetchSavedTours]);

    // --- Load an existing tour ------------------------------------------
    const handleLoadTour = useCallback(async (id) => {
        if (!id) return;

        // If the user is abandoning unsaved edits, confirm first.
        if (saveState === 'dirty' || saveState === 'saving') {
            // eslint-disable-next-line no-alert
            const ok = window.confirm('Unsaved changes will be lost. Load the selected tour?');
            if (!ok) return;
        }

        loadingTourIdRef.current = id;

        try {
            const res = await IrgApi.get(`/tours/${id}`, { headers: authHeaders });
            if (loadingTourIdRef.current !== id) return; // stale

            const tour = res?.data?.data;
            if (!tour) throw new Error('Tour not found');

            const orderedStops = Array.isArray(tour.stops)
                ? [...tour.stops].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                : [];

            // Fetch each stop's MLS property in parallel. Some may fail
            // (property removed from MLS since the tour was saved); we
            // silently drop those and show a notice.
            const fetches = orderedStops.map((s) =>
                IrgApi.get(`/mlsproperties/mls-number/${encodeURIComponent(s.mls_number)}`, {
                    headers: authHeaders,
                })
                    .then((r) => ({ ok: true, raw: r?.data?.data?.result, stop: s }))
                    .catch(() => ({ ok: false, stop: s })),
            );
            const results = await Promise.all(fetches);

            if (loadingTourIdRef.current !== id) return; // stale

            const rebuilt = [];
            let missing = 0;
            results.forEach((r) => {
                if (!r.ok || !r.raw) {
                    missing += 1;
                    return;
                }
                const stop = stopFromSuggestResult(r.raw);
                // Carry forward per-stop note / scheduled_time from the saved tour.
                rebuilt.push({
                    ...stop,
                    note: r.stop.note || '',
                    scheduled_time: r.stop.scheduled_time || null,
                });
            });

            if (missing > 0) {
                // eslint-disable-next-line no-alert
                window.alert(
                    `${missing} propert${missing === 1 ? 'y' : 'ies'} from this tour `
                    + 'could not be loaded (possibly removed from MLS). '
                    + 'The rest have been loaded.',
                );
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
            setSaveState('clean');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Tour load failed', err);
            // eslint-disable-next-line no-alert
            window.alert('Could not load that tour. Please try again.');
        } finally {
            if (loadingTourIdRef.current === id) {
                loadingTourIdRef.current = null;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, saveState]);

    // --- New tour -------------------------------------------------------
    const handleNewTour = useCallback(() => {
        if (saveState === 'dirty' || saveState === 'saving') {
            // eslint-disable-next-line no-alert
            const ok = window.confirm('Unsaved changes will be lost. Start a new tour?');
            if (!ok) return;
        }
        setTourId(null);
        setName('');
        setStops([]);
        setClient(null);
        setScheduledDate(null);
        setLastSavedAt(null);
        lastSavedSnapshotRef.current = EMPTY_SNAPSHOT;
        setSaveState('clean');
    }, [saveState]);

    // --- Delete a saved tour --------------------------------------------
    const handleDeleteTour = useCallback(async (id) => {
        try {
            await IrgApi.delete(`/tours/${id}`, { headers: authHeaders });
            // If the currently loaded tour was deleted, detach it from
            // its mongo _id so the next save creates a new record. Keep
            // the editor contents — user may want to re-save under a
            // fresh record rather than lose their work.
            if (id === tourId) {
                setTourId(null);
                setLastSavedAt(null);
                lastSavedSnapshotRef.current = EMPTY_SNAPSHOT;
                setSaveState('dirty');
            }
            fetchSavedTours();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Tour delete failed', err);
            // eslint-disable-next-line no-alert
            window.alert('Could not delete that tour. Please try again.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId, isLoggedIn, fetchSavedTours]);

    // --- Render ---------------------------------------------------------
    return (
        <MainLayout title="Schedule Showings">
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
                />

                <div className={styles.tourGrid}>
                    <div className="flex flex-col gap-[16px] min-w-0">
                        <PropertySearch stops={stops} onAdd={handleAdd} />
                        <TourList stops={stops} onRemove={handleRemove} />
                        <SavedToursList
                            tours={savedTours}
                            activeTourId={tourId}
                            loading={loadingTours}
                            onLoad={handleLoadTour}
                            onDelete={handleDeleteTour}
                        />
                    </div>

                    <div className="min-w-0">
                        <TourMap stops={stops} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ScheduleShowings;
