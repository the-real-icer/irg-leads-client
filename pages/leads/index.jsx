import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWindowSize } from 'react-use';

// Redux
import { useSelector } from 'react-redux';

// Third Party Components
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import getLeadDisplayName, { getLeadInitials } from '../../utils/getLeadDisplayName';

const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
};

const KNOWN_STATUSES = ['watch', 'qualify', 'hot', 'nurture', 'new', 'closed', 'trash', 'archive', 'pending'];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SORT_COLUMNS = [
    { label: 'Name / Email', field: 'name',     flex: '1.5', sortable: true  },
    { label: 'Phone',        field: null,        flex: '1',   sortable: false },
    { label: 'Status',       field: 'status',    flex: '0.8', sortable: true  },
    { label: 'Type',         field: 'type',      flex: '0.8', sortable: true  },
    { label: 'Source',       field: 'source',    flex: '1',   sortable: true  },
    { label: 'Avg Price',    field: 'avgPrice',  flex: '0.8', sortable: true  },
    { label: 'Last Visit',   field: 'lastVisit', flex: '0.7', sortable: true, textAlign: 'right' },
];

// --------------- Subcomponents ---------------

const PaginationButton = ({ onClick, disabled, active, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius)',
            border: active
                ? '1px solid hsl(var(--primary))'
                : '1px solid hsl(var(--border))',
            background: active
                ? 'hsl(var(--primary))'
                : 'transparent',
            color: active
                ? '#ffffff'
                : disabled
                    ? 'hsl(var(--muted-foreground))'
                    : 'hsl(var(--foreground))',
            fontSize: '13px',
            fontWeight: active ? '700' : '400',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1,
            transition: 'all 0.1s ease'
        }}
    >
        {children}
    </button>
);

const LeadsPagination = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderTop: '1px solid hsl(var(--border))'
        }}>
            <span style={{
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))'
            }}>
                {totalItems === 0
                    ? 'No leads found'
                    : `Showing ${startItem}\u2013${endItem} of ${totalItems} leads`
                }
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Per page selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        Per page
                    </span>
                    <select
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        style={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            color: 'hsl(var(--foreground))',
                            fontSize: '12px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Page buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <PaginationButton
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="First page"
                    >
                        &laquo;
                    </PaginationButton>

                    <PaginationButton
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous page"
                    >
                        &lsaquo;
                    </PaginationButton>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                        )
                        .reduce((acc, page, idx, arr) => {
                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                acc.push('...');
                            }
                            acc.push(page);
                            return acc;
                        }, [])
                        .map((page, idx) =>
                            page === '...' ? (
                                <span
                                    key={`ellipsis-${idx}`}
                                    style={{
                                        padding: '0 4px',
                                        color: 'hsl(var(--muted-foreground))',
                                        fontSize: '12px'
                                    }}
                                >
                                    ...
                                </span>
                            ) : (
                                <PaginationButton
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    active={page === currentPage}
                                >
                                    {page}
                                </PaginationButton>
                            )
                        )
                    }

                    <PaginationButton
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        title="Next page"
                    >
                        &rsaquo;
                    </PaginationButton>

                    <PaginationButton
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        title="Last page"
                    >
                        &raquo;
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
};

const LeadCard = ({ lead, onClick, isMobile, isTablet }) => {
    const displayName = getLeadDisplayName(lead);
    const initials = getLeadInitials(lead);
    const phone = formatPhoneNumber(lead.phone_number);
    const email = lead.email || '\u2014';
    const status = lead.backend_profile?.lead_category || '\u2014';
    const type = lead.backend_profile?.lead_type || '\u2014';
    const source = lead.backend_profile?.lead_source || '\u2014';

    const avgPrice = (() => {
        const homes = lead.viewed_homes || [];
        if (!homes.length) return 'N/A';
        const prices = homes
            .map(h => h.property_viewed?.list_price || h.property_viewed?.price_raw || 0)
            .filter(p => p > 0);
        if (!prices.length) return 'N/A';
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        if (avg >= 1_000_000) return `$${(avg / 1_000_000).toFixed(1)}M`;
        if (avg >= 1_000) return `$${Math.round(avg / 1_000)}K`;
        return `$${Math.round(avg).toLocaleString()}`;
    })();

    const lastVisit = (() => {
        if (!lead.last_visit) return 'Never';
        const date = new Date(lead.last_visit);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    })();

    const statusKey = status?.toLowerCase();
    const isKnownStatus = KNOWN_STATUSES.includes(statusKey);
    const statusStyle = isKnownStatus ? {
        background: `hsl(var(--status-${statusKey}) / 0.15)`,
        color: `hsl(var(--status-${statusKey}))`,
        border: `1px solid hsl(var(--status-${statusKey}) / 0.3)`
    } : {
        background: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
        border: '1px solid hsl(var(--border))'
    };

    if (isMobile) {
        return (
            <div
                onClick={onClick}
                style={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%'
                }}
            >
                {/* Row 1: Avatar + Name + Status + Chevron */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'hsl(var(--primary) / 0.15)',
                        border: '1px solid hsl(var(--primary) / 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'hsl(var(--primary))',
                        flexShrink: 0
                    }}>
                        {initials}
                    </div>

                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'hsl(var(--foreground))',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        minWidth: 0
                    }}>
                        {displayName}
                    </div>

                    <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                        ...statusStyle
                    }}>
                        {status}
                    </span>

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                            color: 'hsl(var(--muted-foreground))',
                            flexShrink: 0,
                            opacity: 0.5
                        }}
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>

                {/* Row 2: Email + Last Visit */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '50px',
                    gap: '12px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: 'hsl(var(--muted-foreground))',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: 1
                    }}>
                        {email}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: lastVisit === 'Never'
                            ? 'hsl(var(--muted-foreground))'
                            : 'hsl(var(--foreground))',
                        flexShrink: 0
                    }}>
                        {lastVisit}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '100%'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'hsl(var(--border))';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Avatar */}
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'hsl(var(--primary) / 0.15)',
                border: '1px solid hsl(var(--primary) / 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '700',
                color: 'hsl(var(--primary))',
                flexShrink: 0
            }}>
                {initials}
            </div>

            {/* Name + Email */}
            <div style={{ minWidth: 0, flex: '1.5' }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'hsl(var(--foreground))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {displayName}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px'
                }}>
                    {email}
                </div>
            </div>

            {/* Phone */}
            <div style={{ flex: '1', minWidth: 0 }}>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    Phone
                </div>
                <div style={{
                    fontSize: '14px',
                    color: phone ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
                }}>
                    {phone || '\u2014'}
                </div>
            </div>

            {/* Status */}
            <div style={{ flex: '0.8', minWidth: 0 }}>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    Status
                </div>
                <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    ...statusStyle
                }}>
                    {status}
                </span>
            </div>

            {/* Type */}
            <div style={{ flex: '0.8', minWidth: 0 }}>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    Type
                </div>
                <div style={{
                    fontSize: '14px',
                    color: type !== '\u2014' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
                }}>
                    {type}
                </div>
            </div>

            {/* Source */}
            <div style={{ flex: '1', minWidth: 0 }}>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    Source
                </div>
                <div style={{
                    fontSize: '14px',
                    color: source !== '\u2014' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {source}
                </div>
            </div>

            {/* Avg Price */}
            {!isTablet && (
                <div style={{ flex: '0.8', minWidth: 0 }}>
                    <div style={{
                        fontSize: '12px',
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: '600'
                    }}>
                        Avg Price
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: avgPrice !== 'N/A'
                            ? 'hsl(var(--foreground))'
                            : 'hsl(var(--muted-foreground))'
                    }}>
                        {avgPrice}
                    </div>
                </div>
            )}

            {/* Last Visit */}
            <div style={{ flex: '0.7', minWidth: 0, textAlign: 'right' }}>
                <div style={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    Last Visit
                </div>
                <div style={{
                    fontSize: '14px',
                    color: lastVisit === 'Never'
                        ? 'hsl(var(--muted-foreground))'
                        : 'hsl(var(--foreground))'
                }}>
                    {lastVisit}
                </div>
            </div>

            {/* Chevron */}
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                    color: 'hsl(var(--muted-foreground))',
                    flexShrink: 0,
                    opacity: 0.5
                }}
            >
                <path d="M9 18l6-6-6-6" />
            </svg>
        </div>
    );
};

// --------------- Main Component ---------------

const Leads = () => {
    // __________________Redux State______________________\\
    const {
        leads: allLeads,
        loading: leadsLoading,
        error: leadsError,
    } = useSelector((state) => state.allLeadsPage);

    const router = useRouter();
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width <= 1200;

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Sort state — default: Last Visit descending (most recent first)
    const [sortField, setSortField] = useState('lastVisit');
    const [sortDirection, setSortDirection] = useState('desc');

    // Ensure allLeads is an array
    const leadsArray = Array.isArray(allLeads) ? allLeads : [];

    // Get unique values for dropdowns — memoized to avoid recalc on every render
    const statusValues = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_category)
                .filter((status) => status)
        ),
    ].sort(), [leadsArray]);

    const types = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_type)
                .filter((type) => type)
        ),
    ].sort(), [leadsArray]);

    const sources = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_source)
                .filter((source) => source)
        ),
    ].sort(), [leadsArray]);

    // Filter + sort leads — memoized
    const leads = useMemo(() => {
        const filtered = leadsArray.filter((lead) => {
            if (globalFilterValue) {
                const searchLower = globalFilterValue.toLowerCase();
                const matchesGlobal =
                    lead.first_name?.toLowerCase().includes(searchLower) ||
                    lead.last_name?.toLowerCase().includes(searchLower) ||
                    lead.email?.toLowerCase().includes(searchLower) ||
                    lead.phone_number?.toLowerCase().includes(searchLower);

                if (!matchesGlobal) return false;
            }

            if (selectedStatus && lead.backend_profile?.lead_category !== selectedStatus) {
                return false;
            }

            if (selectedType && lead.backend_profile?.lead_type !== selectedType) {
                return false;
            }

            if (selectedSource && lead.backend_profile?.lead_source !== selectedSource) {
                return false;
            }

            return true;
        });

        // Sort
        return [...filtered].sort((a, b) => {
            let aVal, bVal;

            switch (sortField) {
                case 'name': {
                    aVal = getLeadDisplayName(a).toLowerCase();
                    bVal = getLeadDisplayName(b).toLowerCase();
                    break;
                }
                case 'status': {
                    aVal = (a.backend_profile?.lead_category || '').toLowerCase();
                    bVal = (b.backend_profile?.lead_category || '').toLowerCase();
                    break;
                }
                case 'type': {
                    aVal = (a.backend_profile?.lead_type || '').toLowerCase();
                    bVal = (b.backend_profile?.lead_type || '').toLowerCase();
                    break;
                }
                case 'source': {
                    aVal = (a.backend_profile?.lead_source || '').toLowerCase();
                    bVal = (b.backend_profile?.lead_source || '').toLowerCase();
                    break;
                }
                case 'avgPrice': {
                    const getAvg = (lead) => {
                        const homes = lead.viewed_homes || [];
                        const prices = homes
                            .map(h => h.property_viewed?.list_price || h.property_viewed?.price_raw || 0)
                            .filter(p => p > 0);
                        if (!prices.length) return 0;
                        return prices.reduce((sum, p) => sum + p, 0) / prices.length;
                    };
                    aVal = getAvg(a);
                    bVal = getAvg(b);
                    break;
                }
                case 'lastVisit': {
                    aVal = a.last_visit ? new Date(a.last_visit).getTime() : 0;
                    bVal = b.last_visit ? new Date(b.last_visit).getTime() : 0;
                    break;
                }
                default:
                    return 0;
            }

            // Nulls/empty sort to bottom
            if (!aVal && aVal !== 0) return 1;
            if (!bVal && bVal !== 0) return -1;

            // String comparison
            if (typeof aVal === 'string') {
                const cmp = aVal.localeCompare(bVal);
                return sortDirection === 'asc' ? cmp : -cmp;
            }

            // Numeric comparison
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [leadsArray, globalFilterValue, selectedStatus, selectedType, selectedSource, sortField, sortDirection]);

    // Paginated leads derived from filtered leads
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return leads.slice(start, start + pageSize);
    }, [leads, currentPage, pageSize]);

    const totalPages = Math.ceil(leads.length / pageSize);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [globalFilterValue, selectedStatus, selectedType, selectedSource]);

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const clearFilters = () => {
        setGlobalFilterValue('');
        setSelectedStatus(null);
        setSelectedType(null);
        setSelectedSource(null);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'lastVisit' ? 'desc' : 'asc');
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return (
                <svg width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ opacity: 0.3 }}>
                    <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ color: 'hsl(var(--primary))' }}>
                <path d="M7 15l5-5 5 5" />
            </svg>
        ) : (
            <svg width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ color: 'hsl(var(--primary))' }}>
                <path d="M7 9l5 5 5-5" />
            </svg>
        );
    };

    // Template for status dropdown items (option is the string value)
    const statusItemTemplate = (option) => {
        if (!option) return null;
        return (
            <span className={`customer-badge status-${option}`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
        );
    };

    // Template for selected status value in dropdown
    const statusValueTemplate = (option) => {
        if (!option) return <span>Status</span>;
        return (
            <span className={`customer-badge status-${option}`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
        );
    };

    const renderHeader = () => {
        const hasActiveFilters = selectedStatus || selectedType || selectedSource || globalFilterValue;

        return (
            <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                {/* Title and Search Row */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'center',
                        marginBottom: '1.25rem',
                        gap: isMobile ? '12px' : '0'
                    }}
                >
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '1.5rem' : '1.75rem',
                        fontWeight: '600',
                        color: 'hsl(var(--foreground))',
                        paddingLeft: '6px'
                    }}>
                        Leads
                    </h2>
                    <span className="p-input-icon-left" style={{ marginTop: isMobile ? 0 : '4px' }}>
                        <i className="pi pi-search" style={{ color: 'hsl(var(--foreground-muted))' }} />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search leads..."
                            style={{
                                width: isMobile ? '100%' : '320px',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem 0.75rem 2.5rem'
                            }}
                        />
                    </span>
                </div>

                {/* Filters Row */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: isMobile ? '10px' : '1rem',
                        padding: isMobile ? '12px' : '1rem 1.25rem',
                        backgroundColor: 'hsl(var(--muted))',
                        borderRadius: '10px',
                        border: '1px solid hsl(var(--border))'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'hsl(var(--foreground-muted))',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        minWidth: '60px'
                    }}>
                        <i className="pi pi-filter" style={{ fontSize: '0.9rem' }}></i>
                        <span>Filters</span>
                        {hasActiveFilters && isMobile && (
                            <Button
                                icon="pi pi-times"
                                rounded
                                text
                                severity="secondary"
                                onClick={clearFilters}
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                    marginLeft: 'auto'
                                }}
                            />
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: isMobile ? 'stretch' : 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '8px' : '0.75rem',
                        flex: 1
                    }}>
                        <Dropdown
                            value={selectedStatus}
                            options={statusValues}
                            onChange={(e) => setSelectedStatus(e.value)}
                            placeholder="Status"
                            showClear
                            itemTemplate={statusItemTemplate}
                            valueTemplate={statusValueTemplate}
                            style={{ minWidth: isMobile ? undefined : '160px', width: isMobile ? '100%' : undefined }}
                            className="filter-dropdown"
                        />
                        <Dropdown
                            value={selectedType}
                            options={types}
                            onChange={(e) => setSelectedType(e.value)}
                            placeholder="Type"
                            showClear
                            style={{ minWidth: isMobile ? undefined : '160px', width: isMobile ? '100%' : undefined }}
                            className="filter-dropdown"
                        />
                        <Dropdown
                            value={selectedSource}
                            options={sources}
                            onChange={(e) => setSelectedSource(e.value)}
                            placeholder="Source"
                            showClear
                            style={{ minWidth: isMobile ? undefined : '160px', width: isMobile ? '100%' : undefined }}
                            className="filter-dropdown"
                        />
                    </div>

                    {hasActiveFilters && !isMobile && (
                        <Button
                            icon="pi pi-times"
                            rounded
                            text
                            severity="secondary"
                            onClick={clearFilters}
                            tooltip="Clear all filters"
                            tooltipOptions={{ position: 'bottom' }}
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                marginLeft: 'auto'
                            }}
                        />
                    )}
                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <MainLayout>
            <div className="card">
                {header}

                {/* Loading state */}
                {leadsLoading && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '60px 0',
                        gap: '12px',
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: '14px'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid hsl(var(--muted))',
                            borderTopColor: 'hsl(var(--primary))',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite'
                        }} />
                        Loading leads...
                    </div>
                )}

                {/* Error state */}
                {leadsError && !leadsLoading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 0',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        <p style={{ color: 'hsl(var(--destructive))', marginBottom: '8px' }}>
                            {leadsError}
                        </p>
                        <p style={{ fontSize: '12px' }}>
                            Leads will retry automatically in 2 minutes
                        </p>
                    </div>
                )}

                {/* Column headers row — sortable (hidden on mobile) */}
                {!leadsLoading && !leadsError && leads.length > 0 && !isMobile && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 20px 8px 76px',
                        gap: '16px',
                        marginBottom: '4px'
                    }}>
                        {SORT_COLUMNS.filter(col => !(isTablet && col.field === 'avgPrice')).map(col => (
                            <div
                                key={col.label}
                                onClick={col.sortable ? () => handleSort(col.field) : undefined}
                                style={{
                                    flex: col.flex,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: sortField === col.field
                                        ? 'hsl(var(--foreground))'
                                        : 'hsl(var(--muted-foreground))',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    justifyContent: col.textAlign === 'right'
                                        ? 'flex-end' : 'flex-start',
                                    cursor: col.sortable ? 'pointer' : 'default',
                                    userSelect: 'none',
                                    transition: 'color 0.15s ease'
                                }}
                                onMouseEnter={e => {
                                    if (col.sortable) {
                                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (col.sortable && sortField !== col.field) {
                                        e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                                    }
                                }}
                            >
                                {col.label}
                                {col.sortable && <SortIcon field={col.field} />}
                            </div>
                        ))}
                        <div style={{ width: '16px', flexShrink: 0 }} />
                    </div>
                )}

                {/* Cards list */}
                {!leadsLoading && !leadsError && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {paginatedLeads.map(lead => (
                            <LeadCard
                                key={lead._id}
                                lead={lead}
                                onClick={() => router.push(`/lead/${lead._id}`)}
                                isMobile={isMobile}
                                isTablet={isTablet}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!leadsLoading && !leadsError && leads.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 0',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>&#128100;</div>
                        <p style={{
                            fontWeight: '600',
                            color: 'hsl(var(--foreground))',
                            marginBottom: '4px'
                        }}>
                            No leads found
                        </p>
                        <p style={{ fontSize: '12px' }}>
                            {globalFilterValue || selectedStatus || selectedType || selectedSource
                                ? 'Try adjusting your filters'
                                : 'Add your first lead to get started'
                            }
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {!leadsLoading && leads.length > 0 && (
                    <LeadsPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={leads.length}
                        pageSize={pageSize}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Leads;
