import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const getEventIcon = (eventType) => {
    switch (eventType) {
        case 'open': return 'pi pi-eye';
        case 'click': return 'pi pi-external-link';
        case 'delivered': return 'pi pi-check';
        case 'bounce': return 'pi pi-exclamation-triangle';
        case 'dropped': return 'pi pi-times-circle';
        case 'spamreport': return 'pi pi-ban';
        case 'unsubscribe': return 'pi pi-minus-circle';
        default: return 'pi pi-envelope';
    }
};

const getEventColor = (eventType) => {
    switch (eventType) {
        case 'open': return '#22c55e';
        case 'click': return '#3b82f6';
        case 'delivered': return '#6b7280';
        case 'bounce': return '#ef4444';
        case 'dropped': return '#ef4444';
        case 'spamreport': return '#f97316';
        case 'unsubscribe': return '#f97316';
        default: return '#6b7280';
    }
};

const getEmailTypeBadge = (emailType) => {
    switch (emailType) {
        case 'drip': return { label: 'Drip', bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' };
        case 'saved_search': return { label: 'Saved Search', bg: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' };
        case 'e_alert': return { label: 'E-Alert', bg: '#fef3c7', color: '#d97706', border: '#fcd34d' };
        default: return { label: 'Email', bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
};

const EmailEngagementCard = ({
    engagement,
    emailEvents,
    loadingEmailEvents,
}) => (
    <div className="lead-email-engagement" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Card>
            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'hsl(var(--foreground))',
                marginBottom: '1rem',
                margin: 0,
            }}>
                Email Engagement
            </h3>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                marginTop: '1rem',
                marginBottom: '1.5rem',
            }}>
                {[
                    {
                        label: 'Total Opens',
                        value: engagement?.total_opens || 0,
                        icon: 'pi pi-eye',
                        color: '#22c55e',
                    },
                    {
                        label: 'Total Clicks',
                        value: engagement?.total_clicks || 0,
                        icon: 'pi pi-external-link',
                        color: '#3b82f6',
                    },
                    {
                        label: 'Delivered',
                        value: engagement?.total_emails_delivered || 0,
                        icon: 'pi pi-check',
                        color: '#6b7280',
                    },
                    {
                        label: 'Bounces',
                        value: engagement?.total_bounces || 0,
                        icon: 'pi pi-exclamation-triangle',
                        color: '#ef4444',
                    },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--muted))',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        <i className={stat.icon} style={{ fontSize: '1.25rem', color: stat.color, display: 'block', marginBottom: '0.5rem' }}></i>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {engagement?.last_email_opened_at && (
                <p style={{ fontSize: '0.85rem', color: '#22c55e', marginBottom: '1rem' }}>
                    <i className="pi pi-eye" style={{ marginRight: '0.3rem' }}></i>
                    Last opened: {new Date(engagement.last_email_opened_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
            )}

            {/* Recent Events */}
            <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'hsl(var(--foreground))',
                marginBottom: '0.75rem',
            }}>
                Recent Events
            </h4>

            {loadingEmailEvents ? (
                <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem' }}>Loading events...</p>
            ) : emailEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {emailEvents.map((evt) => {
                        const badge = getEmailTypeBadge(evt.email_type);
                        return (
                            <div key={evt.sg_event_id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.75rem',
                                backgroundColor: 'hsl(var(--muted))',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                            }}>
                                <i className={getEventIcon(evt.event)} style={{ color: getEventColor(evt.event), fontSize: '0.9rem', width: '18px', textAlign: 'center' }}></i>
                                <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))', textTransform: 'capitalize', minWidth: '65px' }}>
                                    {evt.event}
                                </span>
                                <span style={{
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    border: `1px solid ${badge.border}`,
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                }}>
                                    {badge.label}
                                </span>
                                <span style={{ marginLeft: 'auto', color: 'hsl(var(--foreground-muted))', fontSize: '0.8rem' }}>
                                    {new Date(evt.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: 'hsl(var(--foreground-muted))',
                    backgroundColor: 'hsl(var(--muted))',
                    borderRadius: '8px',
                }}>
                    <i className="pi pi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', opacity: 0.5 }}></i>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>No email events recorded yet</p>
                </div>
            )}
        </Card>
    </div>
);

export default EmailEngagementCard;
