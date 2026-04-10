import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import getLeadDisplayName from '../../utils/getLeadDisplayName';
import formatLastVisit from '../../utils/dashboard/formatLastVisit';
import getStatusColor from '../../utils/dashboard/getStatusColor';
import hasUpcomingReminder from '../../utils/dashboard/hasUpcomingReminder';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});

const RecentLeadsCard = ({ leads }) => {
    const router = useRouter();

    return (
        <Card title="Recent Leads" style={{ height: '100%' }}>
            <ScrollPanel style={{ width: '100%', height: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {leads.length > 0 ? (
                        leads.map((lead) => (
                            <button
                                key={lead._id}
                                type="button"
                                style={{
                                    padding: '1rem',
                                    background: 'hsl(var(--surface))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => router.push(`/lead/${lead._id}`)}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: 'hsl(var(--foreground))',
                                                marginBottom: '0.25rem',
                                            }}
                                        >
                                            {getLeadDisplayName(lead)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'hsl(var(--foreground-muted))',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Avg Price:{' '}
                                            {lead.average_price_point
                                                ? `$${parseInt(
                                                      lead.average_price_point,
                                                      10
                                                  ).toLocaleString()}`
                                                : 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    background: getStatusColor(
                                                        lead.backend_profile?.lead_category
                                                    ).bg,
                                                    color: getStatusColor(
                                                        lead.backend_profile?.lead_category
                                                    ).text,
                                                }}
                                            >
                                                {lead.backend_profile?.lead_category || 'New'}
                                            </span>
                                            {hasUpcomingReminder(lead) && (
                                                <span
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: 'hsl(var(--warning) / 0.15)',
                                                        color: 'hsl(var(--warning))',
                                                        border: '1px solid hsl(var(--warning) / 0.4)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                    }}
                                                >
                                                    <i className="pi pi-clock" style={{ fontSize: '0.65rem' }}></i>
                                                    Follow Up Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'hsl(var(--primary))',
                                                fontWeight: '600',
                                            }}
                                        >
                                            {formatLastVisit(lead.last_visit)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'hsl(var(--foreground-muted))',
                                            }}
                                        >
                                            {lead.viewed_homes?.length || 0}{' '}
                                            {lead.viewed_homes?.length === 1
                                                ? 'home'
                                                : 'homes'}{' '}
                                            viewed
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'hsl(var(--foreground-muted))',
                            }}
                        >
                            No recent leads to display
                        </div>
                    )}
                </div>
            </ScrollPanel>
        </Card>
    );
};

export default RecentLeadsCard;
