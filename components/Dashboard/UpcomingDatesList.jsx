import { useRouter } from 'next/router';
import getDateUrgency from '../../utils/dashboard/getDateUrgency';

const UpcomingDatesList = ({ title = 'Upcoming Important Dates', dates, loading, showAgentName }) => {
    const router = useRouter();

    return (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid hsl(var(--border))' }}>
            <div
                style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'hsl(var(--foreground))',
                    marginBottom: '0.5rem',
                }}
            >
                {title}
            </div>
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.625rem 0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px' }}>
                            <div style={{ width: '50%', height: '0.75rem', borderRadius: '4px', background: 'hsl(var(--border))' }} />
                            <div style={{ width: '70%', height: '0.625rem', borderRadius: '4px', background: 'hsl(var(--border))' }} />
                        </div>
                    ))}
                </div>
            ) : dates.length === 0 ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                    <i className="pi pi-calendar" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }} />
                    <span style={{ fontSize: '0.85rem' }}>No upcoming dates</span>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dates.map((entry, idx) => {
                        const urgency = getDateUrgency(entry.date);
                        return (
                            <div
                                key={`${entry.transactionId}-${entry.dateType}-${idx}`}
                                style={{
                                    padding: '0.625rem 0.75rem',
                                    background: urgency.bg,
                                    borderRadius: '6px',
                                    border: `1px solid ${urgency.border}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: urgency.textColor }}>
                                        {entry.dateType}
                                        {urgency.badge && (
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                background: urgency.badgeBg,
                                                color: urgency.badgeColor,
                                            }}>
                                                {urgency.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: urgency.dateColor, whiteSpace: 'nowrap' }}>
                                        {urgency.label}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                                    onClick={() => router.push(`/transactions/edit/${entry.transactionId}`)}
                                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                                >
                                    {entry.address}
                                </button>
                                {showAgentName && entry.agentName && (
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.1rem' }}>
                                        {entry.agentName}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UpcomingDatesList;
