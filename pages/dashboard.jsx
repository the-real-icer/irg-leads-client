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

const Dashboard = () => {
    // __________________Redux State______________________\\
    const allLeads = useSelector((state) => state.allLeadsPage);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    const router = useRouter();

    // __________________Local State______________________\\
    const [activeLeads, setActiveLeads] = useState([]);
    const [activeLeadsLoading, setActiveLeadsLoading] = useState(true);
    const [txMetrics, setTxMetrics] = useState(null);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState(false);

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

    // Fetch on mount + refresh active leads every 60 seconds
    useEffect(() => {
        fetchActiveLeads();
        fetchTxMetrics();
        const interval = setInterval(fetchActiveLeads, 60000);
        return () => clearInterval(interval);
    }, [fetchActiveLeads, fetchTxMetrics]);

    return (
        <MainLayout>
            <div className="dashboard-page" style={{ padding: '1.5rem' }}>
                {/* Top Section - Two Boxes Side by Side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Top Left - Transactions */}
                    <Card title="Transactions" style={{ height: '100%' }}>
                        {txLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i}>
                                        <div style={{ width: '60%', height: '0.875rem', borderRadius: '4px', background: '#e9ecef', marginBottom: '0.5rem' }} />
                                        <div style={{ width: '35%', height: '1.5rem', borderRadius: '4px', background: '#e9ecef' }} />
                                    </div>
                                ))}
                            </div>
                        ) : txError ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                                <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', color: '#e74c3c' }}></i>
                                <p style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Failed to load transaction data</p>
                                <button
                                    onClick={() => { setTxError(false); setTxLoading(true); fetchTxMetrics(); }}
                                    style={{ padding: '0.4rem 1.25rem', borderRadius: '6px', border: '1px solid #667eea', background: '#667eea', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                        YTD Closed Transactions
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                        {txMetrics?.closedCountYTD ?? 0}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                        YTD Closed Volume
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                        {formatCurrency(txMetrics?.closedVolumeYTD)}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                        Number of Transactions in Escrow
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                        {txMetrics?.currentTransactions ?? 0}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                        Dollar Volume of Transactions in Escrow
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                        {formatCurrency(txMetrics?.escrowVolume)}
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: '#495057',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        Upcoming Important Dates
                                    </div>
                                    <div
                                        style={{
                                            padding: '0.75rem',
                                            background: '#fff3cd',
                                            borderRadius: '6px',
                                            border: '1px solid #ffc107',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.875rem', color: '#856404' }}>
                                            <strong>Contingency Due:</strong> 1135 Main St - 2/15/25
                                        </div>
                                    </div>
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
                                        <div
                                            key={lead._id}
                                            style={{
                                                padding: '1rem',
                                                background: 'white',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
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
                                                            color: '#2c3e50',
                                                            marginBottom: '0.25rem',
                                                        }}
                                                    >
                                                        {lead.first_name} {lead.last_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.875rem',
                                                            color: '#6c757d',
                                                            marginBottom: '0.5rem',
                                                        }}
                                                    >
                                                        Avg Price:{' '}
                                                        {lead.average_price_point
                                                            ? `$${parseInt(
                                                                  lead.average_price_point
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
                                                                    background: '#fff3cd',
                                                                    color: '#856404',
                                                                    border: '1px solid #ffc107',
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
                                                            color: '#667eea',
                                                            fontWeight: '600',
                                                        }}
                                                    >
                                                        {formatLastVisit(lead.last_visit)}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.875rem',
                                                            color: '#6c757d',
                                                        }}
                                                    >
                                                        {lead.backend_profile?.homes_viewed_count || 0}{' '}
                                                        {lead.backend_profile?.homes_viewed_count === 1
                                                            ? 'home'
                                                            : 'homes'}{' '}
                                                        viewed
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        style={{
                                            padding: '2rem',
                                            textAlign: 'center',
                                            color: '#6c757d',
                                        }}
                                    >
                                        No recent leads to display
                                    </div>
                                )}
                            </div>
                        </ScrollPanel>
                    </Card>
                </div>

                {/* Middle Section - Leads Active on Site */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Card title="Leads Active on Site" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activeLeadsLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                            ) : activeLeads.length > 0 ? (
                                activeLeads.map((session) => (
                                    <div
                                        key={session.lead_id}
                                        style={{
                                            padding: '0.875rem 1rem',
                                            background: 'white',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
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
                                                        background: '#22c55e',
                                                        display: 'inline-block',
                                                        boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#2c3e50' }}>
                                                    {session.lead_name || 'Unknown Lead'}
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', color: '#6c757d', marginTop: '0.125rem' }}>
                                                    {session.current_page_title || session.current_page || 'Unknown page'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8125rem', color: session.is_live ? '#22c55e' : '#6c757d', fontWeight: '500' }}>
                                                {session.is_live ? 'Live now' : formatLastVisit(session.last_seen)}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#adb5bd', marginTop: '0.125rem' }}>
                                                {session.total_pages_viewed} {session.total_pages_viewed === 1 ? 'page' : 'pages'} viewed
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div
                                    style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        color: '#6c757d',
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

// Helper function to format currency
const formatCurrency = (value) => {
    if (value == null) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
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
            return { bg: '#e9ecef', text: '#495057' };
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
