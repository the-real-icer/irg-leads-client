import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import MainLayout from '../../components/layout/MainLayout';
import IrgApi from '../../assets/irgApi';

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatLongDate = (dateStr) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatNumber = (n) => {
    if (n == null) return 'N/A';
    return Number(n).toLocaleString();
};

// ── Column config for property table ─────────────────────────────
const COLUMNS = [
    { key: 'image_url', label: '' },
    { key: 'mls_number', label: 'MLS #' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'price', label: 'Price' },
    { key: 'days_on_market', label: 'DOM' },
    { key: 'on_market_date', label: 'On Market' },
    { key: 'modification_timestamp', label: 'Last Modified' },
    { key: 'reason', label: 'Reason' },
    { key: 'copy', label: '' },
];

const DATE_KEYS = new Set(['on_market_date', 'modification_timestamp']);
const NON_SORT_KEYS = new Set(['image_url', 'copy']);

const REASON_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'not_returned', label: 'Not Returned' },
    { key: 'failed', label: 'Failed Update' },
];

// ── Main component ───────────────────────────────────────────────
const DiscrepancyReports = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const isAdmin = agent?.role === 'admin';

    // List view state
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Detail view state
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    // Table state
    const [sortConfig, setSortConfig] = useState({
        key: 'days_on_market',
        direction: 'desc',
    });
    const [reasonFilter, setReasonFilter] = useState('all');
    const [copiedId, setCopiedId] = useState(null);

    // ── Redirect non-admin ──────────────────────────────────────
    useEffect(() => {
        if (!isLoggedIn) {
            router.replace('/');
        } else if (agent && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [isLoggedIn, agent, isAdmin, router]);

    // ── Fetch report list ───────────────────────────────────────
    useEffect(() => {
        if (!isLoggedIn || !isAdmin) return;

        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await IrgApi.get('/discrepancy-reports', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                setReports(res.data?.reports || []);
            } catch (err) {
                setError(
                    err.response?.data?.message
                    || 'Failed to load discrepancy reports',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [isLoggedIn, isAdmin]);

    // ── Fetch single report detail ──────────────────────────────
    const openReport = useCallback(async (filename) => {
        setDetailLoading(true);
        setDetailError('');
        try {
            const res = await IrgApi.get(
                `/discrepancy-reports/${encodeURIComponent(filename)}`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } },
            );
            setSelectedReport({
                filename,
                ...res.data?.report,
            });
        } catch (err) {
            setDetailError(
                err.response?.data?.message
                || 'Failed to load report',
            );
        } finally {
            setDetailLoading(false);
        }
    }, [isLoggedIn]);

    // ── Group reports by date ───────────────────────────────────
    const groupedReports = useMemo(() => {
        const groups = {};
        reports.forEach((r) => {
            if (!groups[r.date]) groups[r.date] = [];
            groups[r.date].push(r);
        });
        return Object.entries(groups).sort(
            ([a], [b]) => b.localeCompare(a),
        );
    }, [reports]);

    // ── Sort & filter discrepancies in detail view ──────────────
    const filteredDiscrepancies = useMemo(() => {
        if (!selectedReport?.discrepancies) return [];
        let items = [...selectedReport.discrepancies];

        if (reasonFilter === 'not_returned') {
            items = items.filter(
                (d) => d.reason === 'Not returned by MLS API',
            );
        } else if (reasonFilter === 'failed') {
            items = items.filter(
                (d) => d.reason === 'Update failed during sync',
            );
        }

        const { key: sortKey, direction } = sortConfig;
        items.sort((a, b) => {
            let aVal;
            let bVal;

            if (DATE_KEYS.has(sortKey)) {
                aVal = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
                bVal = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
            } else if (typeof a[sortKey] === 'number' || typeof b[sortKey] === 'number') {
                aVal = a[sortKey] ?? 0;
                bVal = b[sortKey] ?? 0;
            } else {
                aVal = a[sortKey];
                bVal = b[sortKey];
            }

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const cmp = String(aVal).localeCompare(String(bVal));
            return direction === 'asc' ? cmp : -cmp;
        });

        return items;
    }, [selectedReport, sortConfig, reasonFilter]);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'desc'
                ? 'asc' : 'desc',
        }));
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'asc' ? ' \u25B2' : ' \u25BC';
    };

    // ── Guard: don't render until auth resolved ─────────────────
    if (!isLoggedIn || !agent || !isAdmin) {
        return (
            <MainLayout title="Discrepancy Reports">
                <div className="flex items-center justify-center h-[400px]">
                    <i className="pi pi-spin pi-spinner text-[24px] text-foreground-muted" />
                </div>
            </MainLayout>
        );
    }

    // ── Detail view ─────────────────────────────────────────────
    if (selectedReport) {
        return (
            <MainLayout title="Discrepancy Reports">
                <div className="p-[24px] md:p-[32px] max-w-[1400px] mx-auto">
                    <button
                        onClick={() => {
                            setSelectedReport(null);
                            setReasonFilter('all');
                        }}
                        className={[
                            'mb-[24px] text-[14px] font-medium text-primary',
                            'hover:text-primary-hover transition-colors cursor-pointer',
                        ].join(' ')}
                    >
                        &#8592; Back to Reports
                    </button>

                    <h1 className="text-[24px] md:text-[28px] font-bold text-foreground mb-[8px]">
                        {selectedReport.county} — {selectedReport.status}
                    </h1>
                    <p className="text-[14px] text-foreground-muted mb-[24px]">
                        Generated {formatDate(selectedReport.generatedAt)}
                    </p>

                    {/* Metadata cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[32px]">
                        <div className={[
                            'bg-surface border border-border',
                            'rounded-[12px] p-[16px] text-center',
                        ].join(' ')}>
                            <span className={[
                                'block text-[12px] font-semibold uppercase',
                                'tracking-wider text-foreground-muted mb-[4px]',
                            ].join(' ')}>
                                MLS API Count
                            </span>
                            <strong className="text-[20px] font-bold text-foreground">
                                {formatNumber(selectedReport.mlsApiCount)}
                            </strong>
                        </div>
                        <div className={[
                            'bg-surface border border-border',
                            'rounded-[12px] p-[16px] text-center',
                        ].join(' ')}>
                            <span className={[
                                'block text-[12px] font-semibold uppercase',
                                'tracking-wider text-foreground-muted mb-[4px]',
                            ].join(' ')}>
                                DB Count
                            </span>
                            <strong className="text-[20px] font-bold text-foreground">
                                {formatNumber(selectedReport.dbCount)}
                            </strong>
                        </div>
                        <div className={[
                            'bg-surface border border-border',
                            'rounded-[12px] p-[16px] text-center',
                        ].join(' ')}>
                            <span className={[
                                'block text-[12px] font-semibold uppercase',
                                'tracking-wider text-foreground-muted mb-[4px]',
                            ].join(' ')}>
                                Discrepancies
                            </span>
                            <strong className={[
                                'text-[20px] font-bold',
                                selectedReport.discrepancyCount > 0
                                    ? 'text-warning' : 'text-success',
                            ].join(' ')}>
                                {formatNumber(selectedReport.discrepancyCount)}
                            </strong>
                        </div>
                        <div className={[
                            'bg-surface border border-border',
                            'rounded-[12px] p-[16px] text-center',
                        ].join(' ')}>
                            <span className={[
                                'block text-[12px] font-semibold uppercase',
                                'tracking-wider text-foreground-muted mb-[4px]',
                            ].join(' ')}>
                                Count Match
                            </span>
                            <strong className={[
                                'text-[20px] font-bold',
                                selectedReport.countMatch
                                    ? 'text-success' : 'text-danger',
                            ].join(' ')}>
                                {selectedReport.countMatch ? '\u2713 Yes' : '\u2717 No'}
                            </strong>
                        </div>
                    </div>

                    {/* Reason filter buttons */}
                    <div className="flex gap-[8px] mb-[20px]">
                        {REASON_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setReasonFilter(f.key)}
                                className={[
                                    'px-[14px] py-[6px] rounded-full text-[13px] font-semibold',
                                    'transition-colors cursor-pointer',
                                    reasonFilter === f.key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-surface border border-border text-foreground-muted hover:text-foreground',
                                ].join(' ')}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Property table */}
                    {filteredDiscrepancies.length > 0 ? (
                        <div className="overflow-x-auto rounded-[12px] border border-border">
                            <table className="w-full border-collapse text-[14px]">
                                <thead>
                                    <tr className="border-b-2 border-border bg-surface">
                                        {COLUMNS.map((col) => {
                                            const sortable = !NON_SORT_KEYS.has(col.key);
                                            return (
                                                <th
                                                    key={col.key}
                                                    onClick={sortable
                                                        ? () => handleSort(col.key) : undefined}
                                                    className={[
                                                        'px-[12px] py-[10px] text-left',
                                                        'text-foreground font-semibold',
                                                        'select-none whitespace-nowrap',
                                                        sortable
                                                            ? 'cursor-pointer hover:text-primary' : '',
                                                    ].join(' ')}
                                                >
                                                    {col.label}
                                                    {sortable && getSortIndicator(col.key)}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDiscrepancies.map((d, i) => (
                                        <tr
                                            key={d.mls_number || i}
                                            onClick={() => {
                                                if (d.property_url) {
                                                    window.open(
                                                        `/property/${d.property_url}`,
                                                        '_blank',
                                                        'noopener,noreferrer',
                                                    );
                                                }
                                            }}
                                            onAuxClick={(e) => {
                                                if (e.button === 1 && d.property_url) {
                                                    window.open(
                                                        `/property/${d.property_url}`,
                                                        '_blank',
                                                        'noopener,noreferrer',
                                                    );
                                                }
                                            }}
                                            className={[
                                                'border-b border-border',
                                                'hover:bg-accent transition-colors',
                                                d.property_url ? 'cursor-pointer' : '',
                                            ].join(' ')}
                                        >
                                            <td className="px-[12px] py-[8px]">
                                                {d.image_url ? (
                                                    <img
                                                        src={d.image_url}
                                                        alt={d.address}
                                                        className={[
                                                            'w-[80px] h-[55px]',
                                                            'object-cover rounded-[4px]',
                                                        ].join(' ')}
                                                    />
                                                ) : (
                                                    <div className={[
                                                        'w-[80px] h-[55px]',
                                                        'bg-muted rounded-[4px]',
                                                    ].join(' ')} />
                                                )}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px] font-medium',
                                                'text-foreground whitespace-nowrap',
                                            ].join(' ')}>
                                                {d.mls_number}
                                            </td>
                                            <td className="px-[12px] py-[10px] text-foreground">
                                                {d.address}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'text-foreground whitespace-nowrap',
                                            ].join(' ')}>
                                                {d.city}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'text-foreground whitespace-nowrap',
                                            ].join(' ')}>
                                                {d.price}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'text-foreground text-center',
                                            ].join(' ')}>
                                                {d.days_on_market ?? 'N/A'}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'text-foreground whitespace-nowrap',
                                            ].join(' ')}>
                                                {formatDate(d.on_market_date)}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'text-foreground whitespace-nowrap',
                                            ].join(' ')}>
                                                {formatDate(d.modification_timestamp)}
                                            </td>
                                            <td className={[
                                                'px-[12px] py-[10px]',
                                                'font-medium whitespace-nowrap',
                                                d.reason === 'Update failed during sync'
                                                    ? 'text-danger' : 'text-warning',
                                            ].join(' ')}>
                                                {d.reason}
                                            </td>
                                            <td className="px-[8px] py-[10px]">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(d.mls_number);
                                                        setCopiedId(d.mls_number);
                                                        setTimeout(() => setCopiedId(null), 1500);
                                                    }}
                                                    className={[
                                                        'border rounded-md px-[8px] py-[4px]',
                                                        'text-[11px] font-medium transition-colors',
                                                        'cursor-pointer whitespace-nowrap',
                                                        copiedId === d.mls_number
                                                            ? 'border-success text-success'
                                                            : [
                                                                'border-border text-foreground-muted',
                                                                'hover:text-foreground hover:bg-accent',
                                                            ].join(' '),
                                                    ].join(' ')}
                                                >
                                                    {copiedId === d.mls_number
                                                        ? '\u2713 Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-[15px] text-foreground-muted py-[40px]">
                            No discrepancies found for this report.
                        </p>
                    )}
                </div>
            </MainLayout>
        );
    }

    // ── List view ───────────────────────────────────────────────
    return (
        <MainLayout title="Discrepancy Reports">
            <div className="p-[24px] md:p-[32px] max-w-[1200px] mx-auto">
                <h1 className="text-[24px] md:text-[28px] font-bold text-foreground mb-[4px]">
                    MLS Discrepancy Reports
                </h1>
                <p className="text-[14px] font-medium text-foreground-muted mb-[32px]">
                    Properties in database not returned by MLS overnight sync
                </p>

                {loading && (
                    <div className="flex items-center justify-center py-[60px]">
                        <i className="pi pi-spin pi-spinner text-[24px] text-foreground-muted" />
                    </div>
                )}

                {error && (
                    <div className={[
                        'bg-danger/10 border border-danger/30 rounded-[12px]',
                        'p-[16px] text-[14px] text-danger mb-[24px]',
                    ].join(' ')}>
                        {error}
                    </div>
                )}

                {!loading && !error && groupedReports.length === 0 && (
                    <p className="text-center text-[15px] text-foreground-muted py-[60px]">
                        No discrepancy reports found.
                    </p>
                )}

                {detailLoading && (
                    <div className="flex items-center justify-center py-[40px]">
                        <i className="pi pi-spin pi-spinner text-[24px] text-foreground-muted" />
                    </div>
                )}

                {detailError && (
                    <div className={[
                        'bg-danger/10 border border-danger/30 rounded-[12px]',
                        'p-[16px] text-[14px] text-danger mb-[24px]',
                    ].join(' ')}>
                        {detailError}
                    </div>
                )}

                {!loading && !error && groupedReports.map(([date, dateReports]) => (
                    <div key={date} className="mb-[32px]">
                        <h2 className="text-[18px] font-bold text-foreground mb-[12px]">
                            {formatLongDate(date)}
                        </h2>
                        <div className="flex flex-col gap-[8px]">
                            {dateReports.map((r) => (
                                <div
                                    key={r.filename}
                                    className={[
                                        'bg-surface border border-border rounded-[12px]',
                                        'p-[16px] md:p-[20px]',
                                        'flex flex-wrap items-center gap-[12px] md:gap-[20px]',
                                        'hover:shadow-card transition-shadow',
                                    ].join(' ')}
                                >
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="text-[15px] font-semibold text-foreground">
                                            {r.countyDisplay} — {r.statusDisplay}
                                        </p>
                                        <p className="text-[13px] text-foreground-muted mt-[2px]">
                                            MLS: {formatNumber(r.mlsApiCount)} · DB: {formatNumber(r.dbCount)}
                                        </p>
                                    </div>
                                    <div>
                                        {r.discrepancyCount === 0 ? (
                                            <span className={[
                                                'inline-block px-[10px] py-[4px] rounded-full',
                                                'text-[12px] font-semibold',
                                                'bg-success/10 text-success',
                                            ].join(' ')}>
                                                &#10003; Clean
                                            </span>
                                        ) : (
                                            <span className={[
                                                'inline-block px-[10px] py-[4px] rounded-full',
                                                'text-[12px] font-semibold',
                                                'bg-warning/10 text-warning',
                                            ].join(' ')}>
                                                {r.discrepancyCount} discrepancies
                                            </span>
                                        )}
                                    </div>
                                    {!r.countMatch && (
                                        <span className={[
                                            'inline-block px-[10px] py-[4px] rounded-full',
                                            'text-[12px] font-semibold',
                                            'bg-danger/10 text-danger',
                                        ].join(' ')}>
                                            Count mismatch
                                        </span>
                                    )}
                                    <button
                                        onClick={() => openReport(r.filename)}
                                        disabled={detailLoading}
                                        className={[
                                            'px-[16px] py-[8px] rounded-full text-[13px] font-semibold',
                                            'bg-primary text-primary-foreground',
                                            'hover:bg-primary-hover transition-colors cursor-pointer',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                        ].join(' ')}
                                    >
                                        View Report
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
};

export default DiscrepancyReports;
