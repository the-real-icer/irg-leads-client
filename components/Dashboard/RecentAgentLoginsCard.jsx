import dynamic from 'next/dynamic';
import formatAgentLastLogin from '../../utils/formatAgentLastLogin';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const RecentAgentLoginsCard = ({ logins, loading }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <Card title="Recent Agent Logins" style={{ width: '100%' }}>
            {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.25rem' }}></i>
                </div>
            ) : logins.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                    No recent logins to display
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {logins.map((agent) => {
                        const lastLogin = formatAgentLastLogin(agent.last_successful_login_at);

                        return (
                            <div
                                key={agent._id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.875rem 1rem',
                                    background: 'hsl(var(--surface))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                        {agent.name}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))', marginTop: '0.125rem' }}>
                                        {agent.title || (agent.role === 'admin' ? 'Admin' : 'Agent')}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                        {lastLogin.primary}
                                    </div>
                                    {lastLogin.secondary && (
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginTop: '0.125rem' }}>
                                            {lastLogin.secondary}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    </div>
);

export default RecentAgentLoginsCard;
