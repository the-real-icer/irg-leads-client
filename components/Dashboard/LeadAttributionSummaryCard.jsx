import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const formatCount = (value) => (Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '0');

const formatPercent = (value) => {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate === 0) return '0%';

    return `${(rate * 100).toFixed(1)}%`;
};

const getSafeValue = (value) => {
    if (typeof value !== 'string') return 'Unknown';

    const trimmed = value.trim();
    if (!trimmed) return 'Unknown';

    return trimmed.length > 56 ? `${trimmed.slice(0, 53)}...` : trimmed;
};

const metricItems = (totals = {}) => [
    { label: 'Attributed Leads', value: formatCount(totals.attributedLeadCount) },
    { label: 'Unattributed Leads', value: formatCount(totals.unattributedLeadCount) },
    { label: 'Attribution Rate', value: formatPercent(totals.attributionRate) },
];

const mutedText = {
    color: 'hsl(var(--muted-foreground))',
};

const centeredStateStyle = {
    ...mutedText,
    padding: '1.5rem',
    textAlign: 'center',
};

const metricCardStyle = {
    background: 'hsl(var(--surface))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    padding: '18px',
};

const metricValueStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '1.25rem',
    fontWeight: '700',
};

const metricLabelStyle = {
    ...mutedText,
    fontSize: '0.8rem',
    marginTop: '0.35rem',
};

const sectionTitleStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
};

const bucketRowStyle = {
    alignItems: 'center',
    background: 'hsl(var(--surface))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'space-between',
    minWidth: 0,
    padding: '0.65rem 0.75rem',
};

const bucketValueStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.86rem',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const bucketCountStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.86rem',
    fontWeight: '700',
};

const renderBucketList = (title, items = []) => (
    <div style={{ minWidth: 0 }}>
        <div style={sectionTitleStyle}>{title}</div>
        {items.length === 0 ? (
            <div style={{ ...centeredStateStyle, padding: '1rem' }}>
                No data yet.
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((item, index) => (
                    <div key={`${item.value}-${index}`} style={bucketRowStyle}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={bucketValueStyle} title={item.value}>
                                {getSafeValue(item.value)}
                            </div>
                            <div style={{ ...mutedText, fontSize: '0.72rem', marginTop: '0.15rem' }}>
                                {formatPercent(item.percentage)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={bucketCountStyle}>{formatCount(item.leadCount)}</div>
                            <div style={{ ...mutedText, fontSize: '0.72rem' }}>Leads</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const LeadAttributionSummaryCard = ({ data, loading, error }) => {
    const totals = data?.totals || {};
    const byUtmSource = Array.isArray(data?.byUtmSource) ? data.byUtmSource : [];
    const byUtmCampaign = Array.isArray(data?.byUtmCampaign) ? data.byUtmCampaign : [];
    const byUtmMedium = Array.isArray(data?.byUtmMedium) ? data.byUtmMedium : [];
    const isEmpty = !loading && !error && (!data || Number(totals.leadCount || 0) === 0);

    return (
        <Card title="Website Attribution" style={{ marginBottom: '1.5rem' }}>
            <div style={{ ...mutedText, fontSize: '0.8rem', marginBottom: '1rem' }}>
                Last 12 months
            </div>

            {loading ? (
                <div style={centeredStateStyle}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.25rem' }}></i>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                        Loading attribution report...
                    </div>
                </div>
            ) : error ? (
                <div style={centeredStateStyle}>
                    Attribution report could not be loaded.
                </div>
            ) : isEmpty ? (
                <div style={centeredStateStyle}>
                    No lead attribution data for this period.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="production-grid">
                        {metricItems(totals).map((item) => (
                            <div key={item.label} style={metricCardStyle}>
                                <div style={metricValueStyle}>{item.value}</div>
                                <div style={metricLabelStyle}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            borderTop: '1px solid hsl(var(--border))',
                            display: 'grid',
                            gap: '1rem',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            paddingTop: '1rem',
                        }}
                    >
                        {renderBucketList('Top UTM Sources', byUtmSource)}
                        {renderBucketList('Top UTM Campaigns', byUtmCampaign)}
                        {renderBucketList('Top UTM Mediums', byUtmMedium)}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default LeadAttributionSummaryCard;
