import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    enableQmaSubscription,
    getQmaAnalysis,
    getQmaSubscription,
    listQmaAnalyses,
    manualTriggerQma,
    sendQmaEmail,
    updateQmaSubscription,
} from '../../services/quarterlyMarketAnalysisApi';
import {
    buildQmaAddressFromParts,
    buildDefaultQmaState,
    buildQmaSubjectAddressPayload,
    formatQmaConfidence,
    formatQmaCurrency,
    formatQmaDate,
    formatQmaDateTime,
    formatQmaNumber,
    formatQmaStatus,
    getQmaAnalysisComps,
    getQmaAnalysisStatus,
    getQmaAnalysisSummary,
    getQmaDataWarnings,
    getQmaDisclaimer,
    getQmaDocMetadataRows,
    getQmaEmailStatus,
    getQmaGeneratedAt,
    getQmaQuarterLabel,
    getQmaRecordId,
    getQmaSentAt,
    hasQmaAddress,
    isQmaAnalysisGenerated,
    isQmaEmailSent,
    mergeQmaHistory,
    normalizeQmaAddress,
    normalizeQmaApiError,
    normalizeQmaSubscriptionPayload,
} from '../../utils/quarterlyMarketAnalysisFormatters';

const cardClassName =
    'my-[32px] rounded-[16px] border border-border bg-surface p-[24px] text-foreground shadow-sm '
    + 'md:p-[32px]';
const iconBadgeClassName =
    'flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] '
    + 'bg-primary/10 text-primary';
const primaryButtonClassName =
    'inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[10px] bg-primary '
    + 'px-[14px] py-[9px] text-[14px] font-semibold text-primary-foreground transition-colors '
    + 'hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 '
    + 'focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60';
const outlineButtonClassName =
    'inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[10px] border border-border '
    + 'bg-surface px-[14px] py-[9px] text-[14px] font-semibold text-foreground transition-colors '
    + 'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 '
    + 'focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60';
const dangerButtonClassName =
    'inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[10px] border border-danger/30 '
    + 'bg-danger/10 px-[14px] py-[9px] text-[14px] font-semibold text-danger transition-colors '
    + 'hover:bg-danger/15 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 '
    + 'focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60';
const subtleButtonClassName =
    'inline-flex min-h-[36px] items-center justify-center gap-[7px] rounded-[9px] border border-border '
    + 'bg-muted px-[12px] py-[8px] text-[13px] font-semibold text-foreground transition-colors '
    + 'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed '
    + 'disabled:opacity-60';
const inputClassName =
    'min-h-[40px] w-full rounded-[8px] border border-border bg-surface px-[11px] py-[8px] '
    + 'text-[14px] text-foreground outline-none transition-colors placeholder:text-foreground-muted '
    + 'focus:border-ring focus:ring-2 focus:ring-ring';
const labelClassName =
    'mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-foreground-muted';
const panelClassName = 'rounded-[12px] border border-border bg-muted p-[14px]';
const modalShellClassName =
    'fixed inset-0 z-modal flex items-center justify-center p-[16px] min-[900px]:p-[32px]';
const modalPanelClassName =
    'relative z-modal flex max-h-[calc(100vh-32px)] w-full max-w-[960px] flex-col overflow-hidden '
    + 'rounded-[16px] border border-border bg-surface-elevated p-[20px] text-foreground shadow-modal '
    + 'min-[900px]:max-h-[calc(100vh-64px)] min-[900px]:p-[28px]';
const modalBodyClassName = 'min-h-0 flex-1 overflow-y-auto px-[2px] pb-[2px] pt-[18px]';
const iconOnlyButtonClassName =
    'rounded-[9px] p-[8px] text-foreground-muted transition-colors hover:bg-accent '
    + 'hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const compMetaClassName =
    'flex flex-wrap gap-x-[14px] gap-y-[4px] text-[13px] text-foreground-muted';
const compRationaleClassName =
    'm-0 mt-[10px] break-words text-[13px] leading-[1.5] text-foreground-muted';
const summaryTextClassName =
    'm-0 mt-[8px] whitespace-pre-line break-words text-[14px] leading-[1.6] '
    + 'text-foreground-muted';
const compHeaderClassName =
    'mb-[8px] flex flex-col gap-[8px] min-[640px]:flex-row min-[640px]:items-start '
    + 'min-[640px]:justify-between';
const compAddressClassName = 'mt-[2px] break-words text-[14px] font-bold text-foreground';
const compPriceClassName =
    'break-words text-[14px] font-bold text-primary min-[640px]:shrink-0 min-[640px]:text-right';
const compactEmptyPanelClassName =
    'm-0 mt-[8px] rounded-[12px] border border-border bg-muted p-[14px] text-[14px] '
    + 'text-foreground-muted';
const warningListClassName =
    'm-0 mt-[8px] space-y-[6px] pl-[18px] text-[14px] leading-[1.5] text-foreground-muted';
const mutedEmptyStateClassName =
    'rounded-[12px] border border-border bg-muted p-[18px] text-center text-[14px] '
    + 'text-foreground-muted';
const metadataRowsClassName =
    'flex flex-wrap gap-x-[16px] gap-y-[6px] break-words text-[12px] '
    + 'text-foreground-muted';
const detailsButtonClassName =
    'whitespace-nowrap rounded-[8px] px-[9px] py-[6px] text-[13px] font-semibold text-primary '
    + 'transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring';
const responsiveHeaderClassName =
    'flex flex-col gap-[14px] min-[900px]:flex-row min-[900px]:items-start '
    + 'min-[900px]:justify-between';
const responsivePanelHeaderClassName =
    'mb-[14px] flex flex-col gap-[8px] min-[900px]:flex-row min-[900px]:items-start '
    + 'min-[900px]:justify-between';
const responsiveActionRowClassName =
    'flex flex-col gap-[10px] min-[900px]:flex-row min-[900px]:items-center '
    + 'min-[900px]:justify-between';
const addressGridClassName = 'grid gap-[12px] min-[900px]:grid-cols-12';
const tableHeaderCellClassName = 'whitespace-nowrap px-[12px] py-[10px] font-semibold';
const tableHeaderCellRightClassName = `${tableHeaderCellClassName} text-right`;
const tableCellClassName = 'whitespace-nowrap px-[12px] py-[11px]';
const tableQuarterCellClassName = `${tableCellClassName} font-semibold`;
const tableMutedCellClassName = `${tableCellClassName} text-foreground-muted`;
const tableCellRightClassName = `${tableCellClassName} text-right`;
const addressPreviewPlaceholder = 'Enter a complete subject address.';

const toneClassNames = {
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/35 bg-warning/10 text-warning',
    danger: 'border-danger/30 bg-danger/10 text-danger',
    primary: 'border-primary/30 bg-primary/10 text-primary',
    muted: 'border-border bg-muted text-foreground-muted',
};

const getSubscriptionStatus = (qmaState) => {
    if (!qmaState?.enabled) {
        return { label: 'Not enabled', tone: 'muted' };
    }

    if (qmaState.active) {
        return { label: 'Active', tone: 'success' };
    }

    return { label: 'Disabled', tone: 'warning' };
};

const getAnalysisTone = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (['generated', 'complete', 'completed', 'ready', 'success', 'succeeded'].includes(normalized)) {
        return 'success';
    }
    if (['failed', 'error', 'rejected'].includes(normalized)) return 'danger';
    if (['running', 'pending', 'queued', 'generating'].includes(normalized)) return 'warning';
    return 'muted';
};

const getEmailTone = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (['sent', 'delivered', 'emailed'].includes(normalized)) return 'success';
    if (['failed', 'bounced', 'dropped', 'error'].includes(normalized)) return 'danger';
    if (['pending', 'queued', 'sending'].includes(normalized)) return 'warning';
    return 'muted';
};

const getEmailBlocker = ({ hasEmail, globallyUnsubscribed }) => {
    if (!hasEmail) {
        return 'This lead does not have an email address. Add an email before enabling or sending QMA emails.';
    }

    if (globallyUnsubscribed) {
        return 'This lead is globally unsubscribed. QMA enable and send actions are disabled.';
    }

    return '';
};

const getAddressSource = (addressForm, addressDirty) => {
    if (addressDirty || addressForm?.source === 'manual_override') return 'manual_override';
    return 'agent_confirmed';
};

const getDisplayAnalyses = (qmaState) => {
    const seen = new Set();
    const combined = [
        qmaState?.latestAnalysis,
        ...(Array.isArray(qmaState?.history) ? qmaState.history : []),
    ].filter(Boolean);

    return combined.filter((analysis, index) => {
        const key = getQmaRecordId(analysis) || `${getQmaQuarterLabel(analysis)}-${index}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const StatusPill = ({ label, tone = 'muted' }) => (
    <span
        className={`inline-flex items-center rounded-full border px-[9px] py-[3px] text-[12px] font-semibold ${
            toneClassNames[tone] || toneClassNames.muted
        }`}
    >
        {label}
    </span>
);

const StatusMetric = ({ label, value, tone = 'muted' }) => (
    <div className="rounded-[12px] border border-border bg-muted p-[12px]">
        <div className="mb-[6px] text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            {label}
        </div>
        <div className="flex min-h-[24px] items-center">
            <StatusPill label={value} tone={tone} />
        </div>
    </div>
);

const DateMetric = ({ label, value }) => (
    <div className="rounded-[12px] border border-border bg-muted p-[12px]">
        <div className="mb-[6px] text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            {label}
        </div>
        <div className="text-[14px] font-semibold text-foreground">{value}</div>
    </div>
);

const InlineAlert = ({ children, tone = 'warning' }) => {
    const icon = tone === 'danger' ? 'pi-times-circle' : 'pi-exclamation-triangle';

    return (
        <div
            className={`rounded-[12px] border px-[14px] py-[12px] text-[14px] leading-[1.45] ${
                toneClassNames[tone] || toneClassNames.warning
            }`}
            role="status"
        >
            <div className="flex items-start gap-[10px]">
                <i className={`pi ${icon} mt-[2px] text-[14px]`} aria-hidden="true" />
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
};

const AnalysisDetailsModal = ({ analysis, detailsError, loading, onClose }) => {
    if (!analysis) return null;

    const summary = getQmaAnalysisSummary(analysis);
    const comps = getQmaAnalysisComps(analysis);
    const warnings = getQmaDataWarnings(analysis);
    const disclaimer = getQmaDisclaimer(analysis);
    const metadataRows = getQmaDocMetadataRows(analysis);

    return (
        <div className={modalShellClassName}>
            <button
                type="button"
                className="absolute inset-0 bg-foreground/35"
                aria-label="Close Quarterly Market Analysis details"
                onClick={onClose}
            />
            <section
                className={modalPanelClassName}
                role="dialog"
                aria-modal="true"
                aria-labelledby="qma-analysis-details-title"
            >
                <div className="flex shrink-0 items-start justify-between gap-[16px] border-b border-border pb-[16px]">
                    <div>
                        <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-foreground-muted">
                            {getQmaQuarterLabel(analysis)}
                        </p>
                        <h3
                            id="qma-analysis-details-title"
                            className="m-0 mt-[4px] text-[20px] font-bold text-foreground"
                        >
                            Analysis Details
                        </h3>
                    </div>
                    <button
                        type="button"
                        className={iconOnlyButtonClassName}
                        aria-label="Close details"
                        onClick={onClose}
                    >
                        <i className="pi pi-times text-[13px]" aria-hidden="true" />
                    </button>
                </div>

                <div className={modalBodyClassName}>
                    {loading && (
                        <InlineAlert tone="primary">
                            Loading the full analysis details...
                        </InlineAlert>
                    )}

                    {detailsError && (
                        <div className="mt-[12px]">
                            <InlineAlert tone="danger">{detailsError}</InlineAlert>
                        </div>
                    )}

                    <div className="mt-[18px] grid gap-[12px] min-[900px]:grid-cols-3">
                        <StatusMetric
                            label="Analysis status"
                            value={formatQmaStatus(getQmaAnalysisStatus(analysis), 'No analysis')}
                            tone={getAnalysisTone(getQmaAnalysisStatus(analysis))}
                        />
                        <StatusMetric
                            label="Email status"
                            value={formatQmaStatus(getQmaEmailStatus(analysis), 'Not sent')}
                            tone={getEmailTone(getQmaEmailStatus(analysis))}
                        />
                        <DateMetric label="Generated" value={formatQmaDateTime(getQmaGeneratedAt(analysis))} />
                    </div>

                    <section className="mt-[20px]">
                        <h4 className="m-0 text-[15px] font-bold text-foreground">Summary</h4>
                        <p className={summaryTextClassName}>
                            {summary || 'No summary is available for this analysis.'}
                        </p>
                    </section>

                    <section className="mt-[22px]">
                        <h4 className="m-0 text-[15px] font-bold text-foreground">Comparable Sales</h4>
                        {comps.length > 0 ? (
                            <div className="mt-[10px] grid gap-[12px] min-[900px]:grid-cols-2">
                                {comps.map((comp) => (
                                    <div
                                        key={comp.id}
                                        className="min-w-0 rounded-[12px] border border-border bg-muted p-[14px]"
                                    >
                                        <div className={compHeaderClassName}>
                                            <div className="min-w-0">
                                                <div className={labelClassName}>
                                                    {comp.label}
                                                </div>
                                                <div className={compAddressClassName}>{comp.address}</div>
                                            </div>
                                            <div className={compPriceClassName}>
                                                {formatQmaCurrency(comp.price)}
                                            </div>
                                        </div>
                                        <div className={compMetaClassName}>
                                            <span>Sold {formatQmaDate(comp.soldAt)}</span>
                                            <span>{formatQmaNumber(comp.beds)} beds</span>
                                            <span>{formatQmaNumber(comp.baths)} baths</span>
                                            <span>{formatQmaNumber(comp.sqft, ' sqft')}</span>
                                            <span>{formatQmaNumber(comp.distance, ' mi')}</span>
                                        </div>
                                        {comp.rationale && (
                                            <p className={compRationaleClassName}>
                                                {comp.rationale}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={compactEmptyPanelClassName}>
                                No comparable sales are available for this analysis.
                            </p>
                        )}
                    </section>

                    {warnings.length > 0 && (
                        <section className="mt-[22px]">
                            <h4 className="m-0 text-[15px] font-bold text-foreground">Data Warnings</h4>
                            <ul className={`${warningListClassName} break-words`}>
                                {warnings.map((warning) => (
                                    <li key={warning}>{warning}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {disclaimer && (
                        <section className="mt-[22px]">
                            <h4 className="m-0 text-[15px] font-bold text-foreground">Disclaimer</h4>
                            <p className="m-0 mt-[8px] break-words text-[13px] leading-[1.55] text-foreground-muted">
                                {disclaimer}
                            </p>
                        </section>
                    )}

                    {metadataRows.length > 0 && (
                        <section className="mt-[22px] border-t border-border pt-[14px]">
                            <div className={metadataRowsClassName}>
                                {metadataRows.map((row) => (
                                    <span key={row.label}>
                                        <span className="font-semibold">{row.label}:</span> {row.value}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </div>
    );
};

const QuarterlyMarketAnalysisCard = ({ lead, token, isAdmin = false }) => {
    const leadId = lead?._id || lead?.id;
    const [qmaState, setQmaState] = useState(() => buildDefaultQmaState(lead));
    const [addressForm, setAddressForm] = useState(() => normalizeQmaAddress(null, lead));
    const [addressDirty, setAddressDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [detailsError, setDetailsError] = useState('');
    const [loadingDetailsId, setLoadingDetailsId] = useState('');

    const loadQmaState = useCallback(async ({ quiet = false } = {}) => {
        if (!leadId || !token) return;

        if (!quiet) setLoading(true);
        setError('');

        try {
            const payload = await getQmaSubscription(leadId, token);
            let nextState = normalizeQmaSubscriptionPayload(payload, lead);

            if (nextState.subscriptionId) {
                try {
                    const historyPayload = await listQmaAnalyses(
                        nextState.subscriptionId,
                        { page: 1, limit: 5 },
                        token,
                    );
                    nextState = mergeQmaHistory(nextState, historyPayload);
                } catch {
                    nextState = { ...nextState };
                }
            }

            setQmaState(nextState);
            setAddressForm(nextState.subjectAddress);
            setAddressDirty(false);
        } catch (apiError) {
            if (apiError?.response?.status === 404) {
                const defaultState = buildDefaultQmaState(lead);
                setQmaState(defaultState);
                setAddressForm(defaultState.subjectAddress);
                setAddressDirty(false);
                return;
            }

            setError(normalizeQmaApiError(apiError, 'Quarterly Market Analysis state is unavailable.').message);
        } finally {
            if (!quiet) setLoading(false);
        }
    }, [lead, leadId, token]);

    useEffect(() => {
        const defaultState = buildDefaultQmaState(lead);
        setQmaState(defaultState);
        setAddressForm(defaultState.subjectAddress);
        setAddressDirty(false);
        setNotice('');
        setError('');

        if (leadId && token) {
            loadQmaState();
        }
    }, [lead, leadId, loadQmaState, token]);

    const subscriptionStatus = getSubscriptionStatus(qmaState);
    const latestAnalysis = qmaState.latestAnalysis;
    const latestAnalysisStatus = getQmaAnalysisStatus(latestAnalysis);
    const latestEmailStatus = getQmaEmailStatus(latestAnalysis);
    const analyses = useMemo(() => getDisplayAnalyses(qmaState), [qmaState]);
    const hasLeadEmail = qmaState.leadHasEmail === true;
    const globallyUnsubscribed = qmaState.leadGloballyUnsubscribed === true;
    const emailBlocker = getEmailBlocker({ hasEmail: hasLeadEmail, globallyUnsubscribed });
    const addressPreview = buildQmaAddressFromParts(addressForm);
    const hasAddressPreview = Boolean(addressPreview);
    const addressMissing = !hasQmaAddress(addressForm);
    const hasSubscription = Boolean(qmaState.subscriptionId);
    const actionInFlight = Boolean(action);
    const latestAnalysisId = getQmaRecordId(latestAnalysis);
    const showSendTestEmail =
        isAdmin
        && latestAnalysis
        && isQmaAnalysisGenerated(latestAnalysis)
        && !isQmaEmailSent(latestAnalysis);

    const handleAddressChange = (field, value) => {
        setAddressDirty(true);
        setNotice('');
        setAddressForm((current) => {
            const nextAddress = {
                ...current,
                [field]: value,
                source: 'manual_override',
            };

            return {
                ...nextAddress,
                full: buildQmaAddressFromParts(nextAddress),
            };
        });
    };

    const buildCurrentSubjectAddress = () => (
        buildQmaSubjectAddressPayload(
            addressForm,
            getAddressSource(addressForm, addressDirty),
        )
    );

    const handleSaveAddress = async () => {
        if (addressMissing) {
            setError('Confirm a property address before saving.');
            return;
        }

        setError('');
        setNotice('');

        if (!hasSubscription) {
            setNotice('This address will be used when the QMA subscription is enabled.');
            return;
        }

        setAction('save-address');
        try {
            await updateQmaSubscription(
                qmaState.subscriptionId,
                { subjectAddress: buildCurrentSubjectAddress() },
                token,
            );
            setNotice('QMA subject address saved.');
            await loadQmaState({ quiet: true });
        } catch (apiError) {
            setError(normalizeQmaApiError(apiError, 'Unable to save the QMA address.').message);
        } finally {
            setAction('');
        }
    };

    const handleEnable = async () => {
        if (emailBlocker) {
            setError(emailBlocker);
            return;
        }

        if (addressMissing) {
            setError('Confirm a property address before enabling QMA.');
            return;
        }

        setAction('enable');
        setError('');
        setNotice('');

        try {
            if (hasSubscription) {
                await updateQmaSubscription(
                    qmaState.subscriptionId,
                    { active: true, subjectAddress: buildCurrentSubjectAddress() },
                    token,
                );
            } else {
                await enableQmaSubscription(
                    leadId,
                    { subjectAddress: buildCurrentSubjectAddress() },
                    token,
                );
            }

            setNotice('Quarterly Market Analysis is enabled for this lead.');
            await loadQmaState({ quiet: true });
        } catch (apiError) {
            setError(normalizeQmaApiError(apiError, 'Unable to enable Quarterly Market Analysis.').message);
        } finally {
            setAction('');
        }
    };

    const handleDisable = async () => {
        if (!qmaState.subscriptionId) return;

        setAction('disable');
        setError('');
        setNotice('');

        try {
            await updateQmaSubscription(qmaState.subscriptionId, { active: false }, token);
            setNotice('Quarterly Market Analysis is disabled for this lead.');
            await loadQmaState({ quiet: true });
        } catch (apiError) {
            setError(normalizeQmaApiError(apiError, 'Unable to disable Quarterly Market Analysis.').message);
        } finally {
            setAction('');
        }
    };

    const handleGenerateTestAnalysis = async () => {
        if (!qmaState.subscriptionId) return;

        if (addressMissing) {
            setError('Confirm a complete subject address before generating a test analysis.');
            return;
        }

        setAction('generate');
        setError('');
        setNotice('');

        try {
            if (addressDirty) {
                await updateQmaSubscription(
                    qmaState.subscriptionId,
                    { subjectAddress: buildCurrentSubjectAddress() },
                    token,
                );
            }
            await manualTriggerQma(qmaState.subscriptionId, {}, token);
            setNotice('Manual test analysis request completed.');
            await loadQmaState({ quiet: true });
        } catch (apiError) {
            setError(normalizeQmaApiError(apiError, 'Unable to generate the test analysis.').message);
        } finally {
            setAction('');
        }
    };

    const handleSendTestEmail = async () => {
        if (emailBlocker) {
            setError(emailBlocker);
            return;
        }

        if (!latestAnalysisId) {
            setError('Generate an analysis before sending a QMA email.');
            return;
        }

        setAction('send-email');
        setError('');
        setNotice('');

        try {
            await sendQmaEmail(latestAnalysisId, {}, token);
            setNotice('Manual test email request completed.');
            await loadQmaState({ quiet: true });
        } catch (apiError) {
            const normalizedError = normalizeQmaApiError(apiError, 'Unable to send the test email.');
            if (normalizedError.kind === 'already-sent') {
                setNotice(normalizedError.message);
            } else {
                setError(normalizedError.message);
            }
            await loadQmaState({ quiet: true });
        } finally {
            setAction('');
        }
    };

    const handleViewDetails = async (analysis) => {
        const analysisId = getQmaRecordId(analysis);
        setSelectedAnalysis(analysis);
        setDetailsError('');

        if (!analysisId || !token) return;

        setLoadingDetailsId(analysisId);
        try {
            const payload = await getQmaAnalysis(analysisId, token);
            setSelectedAnalysis(payload?.analysis || payload?.record || payload);
        } catch (apiError) {
            setDetailsError(normalizeQmaApiError(apiError, 'Unable to load analysis details.').message);
        } finally {
            setLoadingDetailsId('');
        }
    };

    return (
        <section
            className={cardClassName}
            style={{ fontFamily: 'Lato, var(--font-inter), Inter, system-ui, sans-serif' }}
            aria-labelledby="qma-card-title"
        >
            <div className="flex flex-col gap-[18px]">
                <div className={responsiveHeaderClassName}>
                    <div className="flex min-w-0 gap-[12px]">
                        <div className={iconBadgeClassName}>
                            <i className="pi pi-chart-line text-[17px]" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-[8px]">
                                <h3
                                    id="qma-card-title"
                                    className="m-0 text-[20px] font-bold text-foreground"
                                >
                                    Quarterly Market Analysis
                                </h3>
                                <StatusPill label={subscriptionStatus.label} tone={subscriptionStatus.tone} />
                            </div>
                            <p className="m-0 mt-[6px] max-w-[780px] text-[14px] leading-[1.5] text-foreground-muted">
                                Automatically send this client a polished quarterly market update based on their
                                property address.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={outlineButtonClassName}
                        onClick={() => loadQmaState()}
                        disabled={loading || actionInFlight || !token}
                    >
                        <i
                            className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-refresh'} text-[13px]`}
                            aria-hidden="true"
                        />
                        Refresh
                    </button>
                </div>

                {emailBlocker && <InlineAlert tone="warning">{emailBlocker}</InlineAlert>}
                {addressMissing && (
                    <InlineAlert tone="warning">
                        Confirm a property address before enabling Quarterly Market Analysis.
                    </InlineAlert>
                )}
                {error && <InlineAlert tone="danger">{error}</InlineAlert>}
                {notice && <InlineAlert tone="primary">{notice}</InlineAlert>}

                <div className="grid gap-[12px] min-[900px]:grid-cols-3">
                    <StatusMetric
                        label="Subscription"
                        value={subscriptionStatus.label}
                        tone={subscriptionStatus.tone}
                    />
                    <StatusMetric
                        label="Latest analysis status"
                        value={formatQmaStatus(latestAnalysisStatus, 'No analysis')}
                        tone={getAnalysisTone(latestAnalysisStatus)}
                    />
                    <StatusMetric
                        label="Latest email status"
                        value={formatQmaStatus(latestEmailStatus, 'Not sent')}
                        tone={getEmailTone(latestEmailStatus)}
                    />
                    <DateMetric
                        label="Next scheduled date"
                        value={formatQmaDateTime(qmaState.nextScheduledAt, 'Not scheduled')}
                    />
                    <DateMetric
                        label="Last generated date"
                        value={formatQmaDateTime(getQmaGeneratedAt(latestAnalysis), 'Not generated')}
                    />
                    <DateMetric
                        label="Last sent date"
                        value={formatQmaDateTime(getQmaSentAt(latestAnalysis), 'Not sent')}
                    />
                </div>

                <div className={panelClassName}>
                    <div className={responsivePanelHeaderClassName}>
                        <div>
                            <h4 className="m-0 text-[15px] font-bold text-foreground">Subject Address</h4>
                            <p className="m-0 mt-[4px] text-[13px] leading-[1.45] text-foreground-muted">
                                Confirm the property address used to generate each quarterly analysis.
                            </p>
                        </div>
                        <button
                            type="button"
                            className={subtleButtonClassName}
                            onClick={handleSaveAddress}
                            disabled={actionInFlight || addressMissing || !token}
                        >
                            <i
                                className={`pi ${
                                    action === 'save-address' ? 'pi-spin pi-spinner' : 'pi-save'
                                } text-[12px]`}
                                aria-hidden="true"
                            />
                            {hasSubscription ? 'Save Address' : 'Use Address'}
                        </button>
                    </div>

                    <div className={addressGridClassName}>
                        <div className="min-w-0 min-[900px]:col-span-5">
                            <label className={labelClassName} htmlFor={`qma-street-${leadId}`}>
                                Street
                            </label>
                            <input
                                id={`qma-street-${leadId}`}
                                className={inputClassName}
                                value={addressForm.street || ''}
                                onChange={(event) => handleAddressChange('street', event.target.value)}
                                placeholder="Street address"
                            />
                        </div>
                        <div className="min-w-0 min-[900px]:col-span-3">
                            <label className={labelClassName} htmlFor={`qma-city-${leadId}`}>
                                City
                            </label>
                            <input
                                id={`qma-city-${leadId}`}
                                className={inputClassName}
                                value={addressForm.city || ''}
                                onChange={(event) => handleAddressChange('city', event.target.value)}
                                placeholder="City"
                            />
                        </div>
                        <div className="min-w-0 min-[900px]:col-span-2">
                            <label className={labelClassName} htmlFor={`qma-state-${leadId}`}>
                                State
                            </label>
                            <input
                                id={`qma-state-${leadId}`}
                                className={inputClassName}
                                value={addressForm.state || ''}
                                onChange={(event) => handleAddressChange('state', event.target.value)}
                                placeholder="CA"
                                maxLength={24}
                            />
                        </div>
                        <div className="min-w-0 min-[900px]:col-span-2">
                            <label className={labelClassName} htmlFor={`qma-zip-${leadId}`}>
                                Zip
                            </label>
                            <input
                                id={`qma-zip-${leadId}`}
                                className={inputClassName}
                                value={addressForm.zip || ''}
                                onChange={(event) => handleAddressChange('zip', event.target.value)}
                                placeholder="92101"
                            />
                        </div>
                    </div>

                    <div className="mt-[12px] rounded-[10px] border border-border bg-surface p-[12px]">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                            Full address preview
                        </div>
                        <div
                            className={`mt-[4px] break-words text-[14px] font-semibold ${
                                hasAddressPreview ? 'text-foreground' : 'text-foreground-muted'
                            }`}
                        >
                            {addressPreview || addressPreviewPlaceholder}
                        </div>
                    </div>
                </div>

                <div className={responsiveActionRowClassName}>
                    <div className="flex flex-wrap gap-[8px]">
                        {qmaState.active ? (
                            <button
                                type="button"
                                className={dangerButtonClassName}
                                onClick={handleDisable}
                                disabled={actionInFlight || !qmaState.subscriptionId || !token}
                            >
                                <i
                                    className={`pi ${
                                        action === 'disable' ? 'pi-spin pi-spinner' : 'pi-ban'
                                    } text-[13px]`}
                                    aria-hidden="true"
                                />
                                Disable
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={primaryButtonClassName}
                                onClick={handleEnable}
                                disabled={actionInFlight || Boolean(emailBlocker) || addressMissing || !token}
                            >
                                <i
                                    className={`pi ${
                                        action === 'enable' ? 'pi-spin pi-spinner' : 'pi-check'
                                    } text-[13px]`}
                                    aria-hidden="true"
                                />
                                {hasSubscription ? 'Re-enable' : 'Enable'}
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-[8px]">
                            {qmaState.active && (
                                <button
                                    type="button"
                                    className={outlineButtonClassName}
                                    onClick={handleGenerateTestAnalysis}
                                    disabled={actionInFlight || !qmaState.subscriptionId || !token}
                                >
                                    <i
                                        className={`pi ${
                                            action === 'generate' ? 'pi-spin pi-spinner' : 'pi-cog'
                                        } text-[13px]`}
                                        aria-hidden="true"
                                    />
                                    Generate test analysis
                                </button>
                            )}
                            {showSendTestEmail && (
                                <button
                                    type="button"
                                    className={outlineButtonClassName}
                                    onClick={handleSendTestEmail}
                                    disabled={actionInFlight || Boolean(emailBlocker) || !latestAnalysisId || !token}
                                >
                                    <i
                                        className={`pi ${
                                            action === 'send-email' ? 'pi-spin pi-spinner' : 'pi-send'
                                        } text-[13px]`}
                                        aria-hidden="true"
                                    />
                                    Send test email
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-[10px] flex items-center justify-between gap-[12px]">
                        <h4 className="m-0 text-[15px] font-bold text-foreground">Recent Analyses</h4>
                        {loading && (
                            <span className="text-[13px] text-foreground-muted">
                                <i className="pi pi-spin pi-spinner mr-[6px]" aria-hidden="true" />
                                Loading
                            </span>
                        )}
                    </div>

                    {analyses.length > 0 ? (
                        <div className="max-w-full overflow-x-auto rounded-[12px] border border-border">
                            <table className="w-full min-w-[720px] border-collapse bg-surface text-left text-[13px]">
                                <thead className="bg-muted text-[11px] uppercase tracking-wide text-foreground-muted">
                                    <tr>
                                        <th className={tableHeaderCellClassName}>Quarter</th>
                                        <th className={tableHeaderCellClassName}>Analysis Status</th>
                                        <th className={tableHeaderCellClassName}>Generated</th>
                                        <th className={tableHeaderCellClassName}>Email Status</th>
                                        <th className={tableHeaderCellClassName}>Sent</th>
                                        <th className={tableHeaderCellClassName}>Confidence</th>
                                        <th className={tableHeaderCellRightClassName}>Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {analyses.map((analysis, index) => {
                                        const analysisId = getQmaRecordId(analysis) || String(index);
                                        const rowAnalysisStatus = getQmaAnalysisStatus(analysis);
                                        const rowEmailStatus = getQmaEmailStatus(analysis);

                                        return (
                                            <tr key={analysisId} className="text-foreground">
                                                <td className={tableQuarterCellClassName}>
                                                    {getQmaQuarterLabel(analysis)}
                                                </td>
                                                <td className={tableCellClassName}>
                                                    <StatusPill
                                                        label={formatQmaStatus(rowAnalysisStatus, 'No analysis')}
                                                        tone={getAnalysisTone(rowAnalysisStatus)}
                                                    />
                                                </td>
                                                <td className={tableMutedCellClassName}>
                                                    {formatQmaDateTime(getQmaGeneratedAt(analysis))}
                                                </td>
                                                <td className={tableCellClassName}>
                                                    <StatusPill
                                                        label={formatQmaStatus(rowEmailStatus, 'Not sent')}
                                                        tone={getEmailTone(rowEmailStatus)}
                                                    />
                                                </td>
                                                <td className={tableMutedCellClassName}>
                                                    {formatQmaDateTime(getQmaSentAt(analysis))}
                                                </td>
                                                <td className={tableMutedCellClassName}>
                                                    {formatQmaConfidence(analysis)}
                                                </td>
                                                <td className={tableCellRightClassName}>
                                                    <button
                                                        type="button"
                                                        className={detailsButtonClassName}
                                                        onClick={() => handleViewDetails(analysis)}
                                                        disabled={loadingDetailsId === analysisId}
                                                    >
                                                        {loadingDetailsId === analysisId
                                                            ? 'Loading...'
                                                            : 'View details'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={mutedEmptyStateClassName}>
                            No QMA analyses have been generated yet.
                        </div>
                    )}
                </div>
            </div>

            <AnalysisDetailsModal
                analysis={selectedAnalysis}
                detailsError={detailsError}
                loading={Boolean(loadingDetailsId)}
                onClose={() => {
                    setSelectedAnalysis(null);
                    setDetailsError('');
                }}
            />
        </section>
    );
};

export default QuarterlyMarketAnalysisCard;
