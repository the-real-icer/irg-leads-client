import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import getLeadDisplayName from '../../utils/getLeadDisplayName';
import formatLastVisit from '../../utils/dashboard/formatLastVisit';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const ActiveLeadsCard = ({ sessions, loading, allLeads }) => {
    const router = useRouter();

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <Card title="Leads Active on Site" style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                    ) : sessions.length > 0 ? (
                        sessions.map((session) => (
                            <button
                                key={session.lead_id}
                                type="button"
                                style={{
                                    padding: '0.875rem 1rem',
                                    background: 'hsl(var(--surface))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => router.push(`/lead/${session.lead_id}`)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {session.is_live && (
                                        <span
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: 'hsl(var(--success))',
                                                display: 'inline-block',
                                                boxShadow: '0 0 6px hsl(var(--success) / 0.5)',
                                            }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                            {session.lead_name || getLeadDisplayName(allLeads?.find((l) => l._id === session.lead_id))}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))', marginTop: '0.125rem' }}>
                                            {session.current_page_title || session.current_page || 'Unknown page'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8125rem', color: session.is_live ? 'hsl(var(--success))' : 'hsl(var(--foreground-muted))', fontWeight: '500' }}>
                                        {session.is_live ? 'Live now' : formatLastVisit(session.last_seen)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginTop: '0.125rem' }}>
                                        {session.total_pages_viewed} {session.total_pages_viewed === 1 ? 'page' : 'pages'} viewed
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
                            <i
                                className="pi pi-eye"
                                style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}
                            ></i>
                            <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                                No leads have been active in the past 30 minutes
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ActiveLeadsCard;
