import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const formatCount = (value) => (Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '0');

const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount === 0) return '$0';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatPercent = (value) => {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate === 0) return '0%';

    return `${(rate * 100).toFixed(1)}%`;
};

const getSafeSourceName = (source) => {
    if (typeof source !== 'string') return 'Unknown';

    const trimmed = source.trim();
    if (!trimmed) return 'Unknown';

    return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
};

const metricItems = (totals = {}) => [
    { label: 'Leads', value: formatCount(totals.leadCount) },
    { label: 'Transaction Leads', value: formatCount(totals.transactionLeadCount) },
    { label: 'Conversion', value: formatPercent(totals.conversionRate) },
    { label: 'Closed Conversion', value: formatPercent(totals.closedConversionRate) },
    { label: 'Closed Volume', value: formatCurrency(totals.closedVolume) },
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

const sourceRowStyle = {
    alignItems: 'center',
    background: 'hsl(var(--surface))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    justifyContent: 'space-between',
    padding: '0.75rem 0.875rem',
};

const sourceNameStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const sourceValueStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    fontWeight: '700',
};

const sourceLabelStyle = {
    ...mutedText,
    fontSize: '0.72rem',
};

const sectionTitleStyle = {
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
};

const LeadSourceConversionCard = ({ data, loading, error }) => {
    const totals = data?.totals || {};
    const sources = Array.isArray(data?.bySource) ? data.bySource.slice(0, 5) : [];
    const isEmpty = !loading && !error && (!data || Number(totals.leadCount || 0) === 0);

    return (
        <Card title="Lead Source Conversion" style={{ marginBottom: '1.5rem' }}>
            <div style={{ ...mutedText, fontSize: '0.8rem', marginBottom: '1rem' }}>
                Last 12 months
            </div>

            {loading ? (
                <div style={centeredStateStyle}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.25rem' }}></i>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading lead source report...</div>
                </div>
            ) : error ? (
                <div style={centeredStateStyle}>
                    Lead source report could not be loaded.
                </div>
            ) : isEmpty ? (
                <div style={centeredStateStyle}>
                    No lead source data for this period.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="production-grid">
                        {metricItems(totals).map((item) => (
                            <div key={item.label} style={metricCardStyle}>
                                <div style={metricValueStyle}>
                                    {item.value}
                                </div>
                                <div style={metricLabelStyle}>
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                        <div style={sectionTitleStyle}>
                            Top Sources
                        </div>
                        {sources.length === 0 ? (
                            <div style={{ ...centeredStateStyle, padding: '1rem' }}>
                                No lead source data for this period.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {sources.map((source, index) => (
                                    <div
                                        key={`${getSafeSourceName(source.source)}-${index}`}
                                        style={sourceRowStyle}
                                    >
                                        <div style={{ minWidth: '140px', flex: '1 1 180px' }}>
                                            <div style={sourceNameStyle}>
                                                {getSafeSourceName(source.source)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={sourceValueStyle}>
                                                {formatCount(source.leadCount)}
                                            </div>
                                            <div style={sourceLabelStyle}>
                                                Leads
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={sourceValueStyle}>
                                                {formatPercent(source.conversionRate)}
                                            </div>
                                            <div style={sourceLabelStyle}>
                                                Conv.
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={sourceValueStyle}>
                                                {formatCurrency(source.closedVolume)}
                                            </div>
                                            <div style={sourceLabelStyle}>
                                                Closed
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default LeadSourceConversionCard;
