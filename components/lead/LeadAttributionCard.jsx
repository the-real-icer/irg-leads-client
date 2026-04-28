import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const SUMMARY_FIELDS = [
    { key: 'utm_source', label: 'UTM Source' },
    { key: 'utm_medium', label: 'UTM Medium' },
    { key: 'utm_campaign', label: 'UTM Campaign' },
    { key: 'utm_term', label: 'UTM Term' },
    { key: 'utm_content', label: 'UTM Content' },
    { key: 'first_landing_page', label: 'First Landing Page' },
    { key: 'current_page', label: 'Conversion Page' },
    { key: 'referrer', label: 'Referrer' },
];

const ADMIN_FIELDS = [
    { key: 'gclid', label: 'Google Click ID' },
    { key: 'gbraid', label: 'GBRAID' },
    { key: 'wbraid', label: 'WBRAID' },
    { key: 'session_id', label: 'Session ID' },
];

const getTextValue = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const getDisplayRows = (attribution, fields) => (
    fields
        .map((field) => ({
            ...field,
            value: getTextValue(attribution?.[field.key]),
        }))
        .filter((field) => field.value)
);

const valueStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
};

const labelStyle = {
    color: 'hsl(var(--foreground-muted))',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
};

const rowStyle = {
    backgroundColor: 'hsl(var(--muted))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    minWidth: 0,
    padding: '0.75rem',
};

const renderRows = (rows) => (
    <div
        style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem',
        }}
    >
        {rows.map((row) => (
            <div key={row.key} style={rowStyle}>
                <div style={labelStyle}>{row.label}</div>
                <div style={valueStyle} title={row.value}>
                    {row.value}
                </div>
            </div>
        ))}
    </div>
);

const LeadAttributionCard = ({ lead, isAdmin = false }) => {
    const attribution = lead?.backend_profile?.attribution;
    const summaryRows = getDisplayRows(attribution, SUMMARY_FIELDS);
    const adminRows = isAdmin ? getDisplayRows(attribution, ADMIN_FIELDS) : [];
    const hasAttribution = summaryRows.length > 0 || adminRows.length > 0;

    return (
        <div className="lead-attribution-card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i
                        className="pi pi-chart-line"
                        style={{ color: 'hsl(var(--primary))', fontSize: '1.1rem' }}
                    />
                    <h3
                        style={{
                            color: 'hsl(var(--foreground))',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            margin: 0,
                        }}
                    >
                        Website Attribution
                    </h3>
                </div>

                {!hasAttribution ? (
                    <div
                        style={{
                            backgroundColor: 'hsl(var(--muted))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground-muted))',
                            marginTop: '1rem',
                            padding: '1.25rem',
                            textAlign: 'center',
                        }}
                    >
                        <i
                            className="pi pi-info-circle"
                            style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.55 }}
                        />
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>
                            No website attribution has been recorded for this lead.
                        </p>
                    </div>
                ) : (
                    <>
                        {summaryRows.length > 0 && renderRows(summaryRows)}

                        {adminRows.length > 0 && (
                            <details style={{ marginTop: '1rem' }}>
                                <summary
                                    style={{
                                        color: 'hsl(var(--foreground-muted))',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    Admin attribution details
                                </summary>
                                {renderRows(adminRows)}
                            </details>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default LeadAttributionCard;
