import PropTypes from 'prop-types';

const EVENT_LABELS = {
    'transaction.created': 'Transaction created',
    'transaction.updated': 'Transaction updated',
    'transaction.deleted': 'Transaction deleted',
    'transaction.status.changed': 'Status changed',
};

const CHANGE_LABELS = {
    status: 'Status',
    salesPrice: 'Sale Price',
    acceptanceDate: 'Acceptance Date',
    anticipatedClosingDate: 'Expected Close',
    actualClosingDate: 'Actual Close',
    escrowLength: 'Escrow Length',
    lead: 'Buyer Lead',
    sellerLead: 'Seller Lead',
    agent: 'Agent',
    doubleEnded: 'Representation',
    property: 'Property',
    property_not_listed: 'Off-MLS',
    financing: 'Financing',
    buyersAgentCommissionPct: 'Agent Commission %',
    referralFee: 'Referral Fee',
    referral_fee_percentage: 'Referral Fee %',
    client_credits_total: 'Client Credits',
    inspectionContingencyDate: 'Inspection Due',
    appraisalContingencyDate: 'Appraisal Due',
    loanContingencyDate: 'Loan Due',
    propertySaleContingencyDate: 'Property Sale Due',
};

const METADATA_LABELS = {
    status: 'Status',
    salesPrice: 'Sale Price',
    propertyNotListed: 'Property Type',
    representation: 'Representation',
    actualClosingDate: 'Actual Close',
};

const METADATA_BY_TYPE = {
    'transaction.created': ['status', 'salesPrice', 'propertyNotListed', 'representation'],
    'transaction.updated': ['status', 'salesPrice', 'propertyNotListed', 'representation'],
    'transaction.deleted': ['status', 'salesPrice', 'propertyNotListed', 'representation'],
    'transaction.status.changed': ['status', 'actualClosingDate'],
};

const CURRENCY_FIELDS = new Set(['salesPrice', 'client_credits_total']);
const DATE_FIELDS = new Set([
    'acceptanceDate',
    'anticipatedClosingDate',
    'actualClosingDate',
    'inspectionContingencyDate',
    'appraisalContingencyDate',
    'loanContingencyDate',
    'propertySaleContingencyDate',
]);
const REFERENCE_ID_FIELDS = new Set(['lead', 'sellerLead', 'agent', 'property']);
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const titleCaseEventType = (type) => {
    if (!type || typeof type !== 'string') return 'Activity';

    return type
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getEventLabel = (type) => EVENT_LABELS[type] || titleCaseEventType(type);

const formatTimestamp = (occurredAt) => {
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return 'Recent';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatCurrency = (value) => {
    const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(amount)) return null;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const isDisplayablePrimitive = (value) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return false;
    if (typeof value === 'object') return false;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed !== '' && trimmed.toLowerCase() !== 'none' && trimmed.length <= 80;
    }

    return ['boolean', 'number'].includes(typeof value);
};

const formatHistoryValue = (value, key) => {
    if (!isDisplayablePrimitive(value)) return null;
    if (REFERENCE_ID_FIELDS.has(key)) return null;

    if (key === 'doubleEnded') return value ? 'Dual' : 'Single';
    if (key === 'property_not_listed' || key === 'propertyNotListed') return value ? 'Off-MLS' : 'MLS';
    if (key === 'financing' && typeof value === 'boolean') return value ? 'Financed' : 'Cash';
    if (CURRENCY_FIELDS.has(key)) return formatCurrency(value);
    if (DATE_FIELDS.has(key)) return formatDate(value);

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return String(value);
    if (OBJECT_ID_PATTERN.test(value.trim())) return null;

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return formatDate(value);
    }

    return value.trim();
};

const getDisplayMetadata = (activity) => {
    const metadata = activity?.metadata || {};
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];

    const keys = METADATA_BY_TYPE[activity?.type] || [];

    return keys
        .map((key) => {
            const value = formatHistoryValue(metadata[key], key);
            if (!value) return null;

            return {
                key,
                label: METADATA_LABELS[key],
                value,
            };
        })
        .filter(Boolean);
};

const getDisplayChanges = (activity) => {
    if (!Array.isArray(activity?.changes)) return [];

    return activity.changes
        .map((change) => {
            const label = CHANGE_LABELS[change?.path];
            if (!label) return null;

            const before = formatHistoryValue(change.before, change.path);
            const after = formatHistoryValue(change.after, change.path);
            if (before === null || after === null) return null;

            return {
                key: change.path,
                label,
                before,
                after,
            };
        })
        .filter(Boolean);
};

const getActivityKey = (activity, index) => activity?._id || `${activity?.type || 'activity'}-${index}`;

const StateMessage = ({ icon, message, spin = false }) => (
    <div
        style={{
            textAlign: 'center',
            padding: '1.5rem',
            color: 'hsl(var(--foreground-muted))',
            backgroundColor: spin ? 'transparent' : 'hsl(var(--muted))',
            borderRadius: '8px',
            marginTop: '1rem',
        }}
    >
        <i
            className={`${icon}${spin ? ' pi-spin' : ''}`}
            style={{
                fontSize: '1.5rem',
                display: 'block',
                marginBottom: '0.75rem',
                opacity: spin ? 1 : 0.6,
            }}
        />
        <p style={{ fontSize: '0.9rem', margin: 0 }}>{message}</p>
    </div>
);

StateMessage.propTypes = {
    icon: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    spin: PropTypes.bool,
};

const TransactionHistoryCard = ({ history = [], loading = false, error = '' }) => {
    const events = Array.isArray(history) ? history.slice(0, 25) : [];

    return (
        <div className="txn-new__card">
            <h2 className="txn-new__card-title">Transaction History</h2>

            {loading ? (
                <StateMessage
                    icon="pi pi-spinner"
                    message="Loading transaction history..."
                    spin
                />
            ) : error ? (
                <StateMessage
                    icon="pi pi-info-circle"
                    message="Transaction history could not be loaded."
                />
            ) : events.length > 0 ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                        }}
                    >
                        {events.map((activity, index) => {
                            const label = getEventLabel(activity?.type);
                            const metadata = getDisplayMetadata(activity);
                            const changes = getDisplayChanges(activity);

                            return (
                                <div
                                    key={getActivityKey(activity, index)}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderLeft: '3px solid hsl(var(--primary) / 0.35)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                                            <i
                                                className="pi pi-history"
                                                style={{
                                                    color: 'hsl(var(--primary) / 0.75)',
                                                    fontSize: '1rem',
                                                    marginTop: '0.15rem',
                                                }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        alignItems: 'baseline',
                                                        gap: '0.4rem',
                                                        marginBottom: '0.35rem',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: '700',
                                                            fontSize: '0.95rem',
                                                            color: 'hsl(var(--foreground))',
                                                        }}
                                                    >
                                                        {label}
                                                    </span>
                                                    {isDisplayablePrimitive(activity?.actor?.name) && (
                                                        <span
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: 'hsl(var(--foreground-muted))',
                                                            }}
                                                        >
                                                            by {activity.actor.name.trim()}
                                                        </span>
                                                    )}
                                                </div>

                                                {metadata.length > 0 && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '0.65rem',
                                                            marginBottom: changes.length > 0 ? '0.5rem' : 0,
                                                        }}
                                                    >
                                                        {metadata.map((item) => (
                                                            <span
                                                                key={item.key}
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    color: 'hsl(var(--foreground-muted))',
                                                                }}
                                                            >
                                                                <strong>{item.label}:</strong> {item.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {changes.length > 0 && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.25rem',
                                                            fontSize: '0.82rem',
                                                            color: 'hsl(var(--foreground-muted))',
                                                        }}
                                                    >
                                                        {changes.map((change) => (
                                                            <div key={change.key}>
                                                                <strong>{change.label}:</strong>{' '}
                                                                {change.before} &rarr; {change.after}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: 'hsl(var(--foreground-muted))',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {formatTimestamp(activity?.occurredAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {Array.isArray(history) && history.length > 25 && (
                        <p
                            style={{
                                fontSize: '0.82rem',
                                color: 'hsl(var(--foreground-muted))',
                                margin: '0.75rem 0 0',
                            }}
                        >
                            Showing latest 25 history events.
                        </p>
                    )}
                </>
            ) : (
                <StateMessage icon="pi pi-history" message="No transaction history yet." />
            )}
        </div>
    );
};

TransactionHistoryCard.propTypes = {
    history: PropTypes.arrayOf(PropTypes.shape({})),
    loading: PropTypes.bool,
    error: PropTypes.string,
};

export default TransactionHistoryCard;
