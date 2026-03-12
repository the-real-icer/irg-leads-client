// React & NextJS
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import DashboardHotsheet from '../components/Dashboard/DashboardHotsheet';
import IrgApi from '../assets/irgApi';
import formatAgentLastLogin from '../utils/formatAgentLastLogin';
import getLeadDisplayName from '../utils/getLeadDisplayName';

const ProductionCard = ({ icon, value, label, format }) => {
    const displayValue = () => {
        const n = value || 0;
        if (format === 'currency') {
            if (n === 0) return '$0';
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
            return `$${n.toLocaleString()}`;
        }
        return n.toLocaleString();
    };

    return (
        <div
            className="production-card"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
        >
            <div style={{ fontSize: '22px', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'hsl(var(--foreground))', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    {displayValue()}
                </div>
                <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '5px', lineHeight: 1.3 }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    // __________________Redux State______________________\\
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const currentAgent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const isAdmin = currentAgent?.role === 'admin';

    const router = useRouter();

    // __________________Local State______________________\\
    const [activeLeads, setActiveLeads] = useState([]);
    const [activeLeadsLoading, setActiveLeadsLoading] = useState(true);
    const [txMetrics, setTxMetrics] = useState(null);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState(false);
    const [upcomingDates, setUpcomingDates] = useState([]);
    const [upcomingDatesLoading, setUpcomingDatesLoading] = useState(true);
    const [recentAgentLogins, setRecentAgentLogins] = useState([]);
    const [recentAgentLoginsLoading, setRecentAgentLoginsLoading] = useState(true);

    // Sort leads by last visit date (most recent first)
    const sortedLeads = [...allLeads].sort((a, b) => {
        const dateA = a.last_visit ? new Date(a.last_visit) : new Date(0);
        const dateB = b.last_visit ? new Date(b.last_visit) : new Date(0);
        return dateB - dateA;
    });

    // Get top 4 most recent leads
    const recentLeads = sortedLeads.slice(0, 4);

    // Fetch active leads on site
    const fetchActiveLeads = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await IrgApi.get('/tracking/recent-lead-activity', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setActiveLeads(res.data.data);
            }
        } catch {
            // Silently fail — widget is non-critical
        } finally {
            setActiveLeadsLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch transaction metrics
    const fetchTxMetrics = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await IrgApi.get('/transactions/dashboard-stats', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setTxMetrics(res.data.data);
            }
        } catch {
            setTxError(true);
        } finally {
            setTxLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch upcoming transaction dates
    const fetchUpcomingDates = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await IrgApi.get('/transactions/upcoming-dates', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setUpcomingDates(res.data.data);
            }
        } catch {
            // Silently fail — widget is non-critical
        } finally {
            setUpcomingDatesLoading(false);
        }
    }, [isLoggedIn]);

    const fetchRecentAgentLogins = useCallback(async () => {
        if (!isLoggedIn || !isAdmin) {
            setRecentAgentLogins([]);
            setRecentAgentLoginsLoading(false);
            return;
        }

        try {
            const res = await IrgApi.get('/agents/recent-logins', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setRecentAgentLogins(res.data.data);
            }
        } catch {
            setRecentAgentLogins([]);
        } finally {
            setRecentAgentLoginsLoading(false);
        }
    }, [isAdmin, isLoggedIn]);

    // Fetch on mount + refresh active leads every 60 seconds
    useEffect(() => {
        fetchActiveLeads();
        fetchTxMetrics();
        fetchUpcomingDates();
        fetchRecentAgentLogins();
        const interval = setInterval(fetchActiveLeads, 60000);
        return () => clearInterval(interval);
    }, [fetchActiveLeads, fetchTxMetrics, fetchUpcomingDates, fetchRecentAgentLogins]);

    return (
        <MainLayout>
            <div className="dashboard-page" style={{ padding: '1.5rem' }}>
                {/* Top Section - Two Boxes Side by Side */}
                <div className="grid-cols-1 md:grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Top Left - My Production */}
                    <Card title="My Production" style={{ height: '100%' }}>
                        {txLoading ? (
                            <div className="production-grid">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'hsl(var(--muted))', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ width: '60%', height: '22px', borderRadius: '4px', background: 'hsl(var(--muted))', marginBottom: '8px' }} />
                                            <div style={{ width: '80%', height: '13px', borderRadius: '4px', background: 'hsl(var(--muted))' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : txError ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--foreground-muted))' }}>
                                <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', color: 'hsl(var(--danger))' }}></i>
                                <p style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Failed to load transaction data</p>
                                <button
                                    onClick={() => { setTxError(false); setTxLoading(true); fetchTxMetrics(); }}
                                    style={{ padding: '0.4rem 1.25rem', borderRadius: '6px', border: '1px solid hsl(var(--primary))', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="production-grid">
                                    <ProductionCard icon="🏠" value={txMetrics?.closedCountYTD ?? 0} label="YTD Closed Transactions" format="number" />
                                    <ProductionCard icon="💰" value={txMetrics?.closedVolumeYTD} label="YTD Closed Volume" format="currency" />
                                    <ProductionCard icon="📋" value={txMetrics?.currentTransactions ?? 0} label="Transactions In Escrow" format="number" />
                                    <ProductionCard icon="📊" value={txMetrics?.escrowVolume} label="Volume In Escrow" format="currency" />
                                    <ProductionCard icon="✅" value={txMetrics?.earnedCommissionsYTD} label="Commissions Earned YTD" format="currency" />
                                    <ProductionCard icon="⏳" value={txMetrics?.pendingCommissions} label="Commissions In Escrow" format="currency" />
                                </div>

                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid hsl(var(--border))' }}>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'hsl(var(--foreground))',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        Upcoming Important Dates
                                    </div>
                                    {upcomingDatesLoading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.625rem 0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px' }}>
                                                    <div style={{ width: '50%', height: '0.75rem', borderRadius: '4px', background: 'hsl(var(--border))' }} />
                                                    <div style={{ width: '70%', height: '0.625rem', borderRadius: '4px', background: 'hsl(var(--border))' }} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : upcomingDates.length === 0 ? (
                                        <div style={{ padding: '1.25rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                            <i className="pi pi-calendar" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }} />
                                            <span style={{ fontSize: '0.85rem' }}>No upcoming dates</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {upcomingDates.map((entry, idx) => {
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
                                                            style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', marginTop: '0.2rem', cursor: 'pointer' }}
                                                            onClick={() => router.push(`/transactions/edit/${entry.transactionId}`)}
                                                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                                                        >
                                                            {entry.address}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Top Right - Recent Leads */}
                    <Card title="Recent Leads" style={{ height: '100%' }}>
                        <ScrollPanel style={{ width: '100%', height: '500px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {recentLeads.length > 0 ? (
                                    recentLeads.map((lead) => (
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
                </div>

                {isAdmin && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Card title="Recent Agent Logins" style={{ width: '100%' }}>
                            {recentAgentLoginsLoading ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.25rem' }}></i>
                                </div>
                            ) : recentAgentLogins.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                    No recent logins to display
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {recentAgentLogins.map((agent) => {
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
                )}

                {/* Middle Section - Leads Active on Site */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Card title="Leads Active on Site" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activeLeadsLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                            ) : activeLeads.length > 0 ? (
                                activeLeads.map((session) => (
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

                {/* Bottom Section - Hotsheet */}
                <DashboardHotsheet />
            </div>
        </MainLayout>
    );
};

// Helper function to determine date urgency styling and label
const getDateUrgency = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (dateOnly.getTime() === today.getTime()) {
        return {
            label: 'Today',
            badge: 'Today',
            bg: 'hsl(var(--danger) / 0.12)',
            border: 'hsl(var(--danger) / 0.35)',
            textColor: 'hsl(var(--danger))',
            dateColor: 'hsl(var(--danger))',
            badgeBg: 'hsl(var(--danger) / 0.2)',
            badgeColor: 'hsl(var(--danger))',
        };
    }

    if (dateOnly.getTime() === tomorrow.getTime()) {
        return {
            label: 'Tomorrow',
            badge: 'Tomorrow',
            bg: 'hsl(var(--warning) / 0.12)',
            border: 'hsl(var(--warning) / 0.35)',
            textColor: 'hsl(var(--warning))',
            dateColor: 'hsl(var(--warning))',
            badgeBg: 'hsl(var(--warning) / 0.2)',
            badgeColor: 'hsl(var(--warning))',
        };
    }

    if (dateOnly < nextWeek) {
        return {
            label: formatted,
            badge: 'Soon',
            bg: 'hsl(var(--warning) / 0.08)',
            border: 'hsl(var(--warning) / 0.25)',
            textColor: 'hsl(var(--foreground))',
            dateColor: 'hsl(var(--warning))',
            badgeBg: 'hsl(var(--warning) / 0.15)',
            badgeColor: 'hsl(var(--warning))',
        };
    }

    return {
        label: formatted,
        badge: null,
        bg: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        textColor: 'hsl(var(--foreground))',
        dateColor: 'hsl(var(--foreground-muted))',
        badgeBg: null,
        badgeColor: null,
    };
};

// Helper function to get status colors
const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'hot':
            return { bg: '#ffcdd2', text: '#c63737' };
        case 'qualify':
            return { bg: '#c8e6c9', text: '#256029' };
        case 'watch':
            return { bg: '#feedaf', text: '#8a5340' };
        case 'nurture':
            return { bg: '#eccfff', text: '#694382' };
        case 'new':
            return { bg: '#b3e5fc', text: '#23547b' };
        case 'closed':
            return { bg: '#ffd8b2', text: '#805b36' };
        default:
            return { bg: 'hsl(var(--muted))', text: 'hsl(var(--foreground))' };
    }
};

// Helper function to check if lead has upcoming reminder (within next 7 days)
const hasUpcomingReminder = (lead) => {
    if (!lead.reminders || lead.reminders.length === 0) return false;

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    return lead.reminders.some((reminder) => {
        // Skip completed reminders
        if (reminder.completed) return false;

        const reminderDate = new Date(reminder.reminder_date);

        // Check if reminder is between now and 7 days from now
        return reminderDate >= now && reminderDate <= oneWeekFromNow;
    });
};

// Helper function to format last visit time
const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Never';

    const now = new Date();
    const visitDate = new Date(lastVisit);
    const diffMs = now - visitDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins} min ago`;
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
};

export default Dashboard;
