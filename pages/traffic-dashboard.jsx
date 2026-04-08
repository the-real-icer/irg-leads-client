// React & NextJS
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import IrgApi from '../assets/irgApi';

const TrafficDashboard = () => {
    // __________________Redux State______________________\\
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const router = useRouter();

    // __________________Local State______________________\\
    const [liveSessions, setLiveSessions] = useState([]);
    const [liveLoading, setLiveLoading] = useState(true);
    const [pageStats, setPageStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [showIdentifiedOnly, setShowIdentifiedOnly] = useState(false);

    // __________________Access Control______________________\\
    useEffect(() => {
        if (agent && agent.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [agent, router]);

    // __________________Data Fetching______________________\\
    const fetchLiveSessions = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await IrgApi.get('/tracking/live-sessions', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setLiveSessions(res.data.data);
            }
        } catch {
            // Silently fail
        } finally {
            setLiveLoading(false);
        }
    }, [isLoggedIn]);

    const fetchPageStats = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await IrgApi.get('/tracking/page-stats', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (res.data.status === 'success') {
                setPageStats(res.data);
            }
        } catch {
            // Silently fail
        } finally {
            setStatsLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch on mount + auto-refresh live sessions every 30s
    useEffect(() => {
        fetchLiveSessions();
        fetchPageStats();
        const interval = setInterval(fetchLiveSessions, 30000);
        return () => clearInterval(interval);
    }, [fetchLiveSessions, fetchPageStats]);

    // Don't render for non-admins
    if (agent && agent.role !== 'admin') return null;

    // Filter recent activity
    const recentActivity = pageStats?.data?.recentActivity || [];
    const filteredActivity = showIdentifiedOnly
        ? recentActivity.filter((a) => a.lead_id)
        : recentActivity;

    // Internal stats
    const internalStats = pageStats?.data?.internal || {};
    const ga4Configured = pageStats?.ga4_configured || false;
    const ga4Data = pageStats?.data?.ga4 || null;

    // Count identified vs anonymous
    const identifiedCount = liveSessions.filter((s) => s.is_identified).length;
    const anonymousCount = liveSessions.length - identifiedCount;

    return (
        <MainLayout title="Traffic Dashboard">
            <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                        Traffic Dashboard
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))' }}>
                        Real-time visitor activity on icerealtygroup.com
                    </p>
                </div>

                {/* Section 1 — Live Visitors */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span>Live Visitors</span>
                                <span
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        background: liveSessions.length > 0 ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--muted))',
                                        color: liveSessions.length > 0 ? 'hsl(var(--success))' : 'hsl(var(--foreground-muted))',
                                    }}
                                >
                                    {liveSessions.length} active
                                </span>
                            </div>
                        }
                    >
                        {/* Summary badges */}
                        {liveSessions.length > 0 && (
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))' }}>
                                    <i className="pi pi-user" style={{ marginRight: '0.25rem' }}></i>
                                    {identifiedCount} identified
                                </span>
                                <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))' }}>
                                    <i className="pi pi-eye" style={{ marginRight: '0.25rem' }}></i>
                                    {anonymousCount} anonymous
                                </span>
                            </div>
                        )}

                        {liveLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                        ) : liveSessions.length > 0 ? (
                            <ScrollPanel style={{ width: '100%', height: '400px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                                            <th style={thStyle}>Visitor</th>
                                            <th style={thStyle}>Current Page</th>
                                            <th style={thStyle}>Time on Page</th>
                                            <th style={thStyle}>Pages Viewed</th>
                                            <th style={thStyle}>Source</th>
                                            <th style={thStyle}>Device</th>
                                            <th style={thStyle}>Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liveSessions.map((session) => (
                                            <tr
                                                key={session.session_id}
                                                style={{
                                                    borderBottom: '1px solid hsl(var(--border-subtle))',
                                                    cursor: session.lead_id ? 'pointer' : 'default',
                                                    transition: 'background 0.15s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'hsl(var(--muted))';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                                onClick={() => {
                                                    if (session.lead_id) {
                                                        window.location.href = `/lead/${session.lead_id}`;
                                                    }
                                                }}
                                            >
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                background: 'hsl(var(--success))',
                                                                display: 'inline-block',
                                                                boxShadow: '0 0 6px hsl(var(--success) / 0.5)',
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                        {session.is_identified ? (
                                                            <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                                {session.lead_name}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>
                                                                Anonymous
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {session.current_page_title || session.current_page || '—'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {formatDuration(session.time_on_current_page)}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {session.total_pages_viewed}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '4px',
                                                            background: getSourceColor(session.traffic_source).bg,
                                                            color: getSourceColor(session.traffic_source).text,
                                                        }}
                                                    >
                                                        {session.traffic_source}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <i
                                                        className={getDeviceIcon(session.device_type)}
                                                        style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))' }}
                                                        title={session.device_type}
                                                    ></i>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {session.visitor_location?.city
                                                            ? `${session.visitor_location.city}, ${session.visitor_location.region}`
                                                            : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ScrollPanel>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                <i className="pi pi-users" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                                <p style={{ fontSize: '0.9375rem', margin: 0 }}>No active visitors right now</p>
                                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0', color: 'hsl(var(--muted-foreground))' }}>
                                    Sessions appear when someone visits the site
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Section 2 — Analytics Overview (two-column grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Internal Stats */}
                    <Card title="Site Analytics (Last 7 Days)">
                        {statsLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Top Pages */}
                                <div>
                                    <div style={sectionHeaderStyle}>Top Pages</div>
                                    {(internalStats.topPages || []).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {internalStats.topPages.map((p, i) => (
                                                <div
                                                    key={p.page}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '0.375rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                                        {p.page}
                                                    </span>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {p.views}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={emptyTextStyle}>No page data yet</p>
                                    )}
                                </div>

                                {/* Traffic Sources */}
                                <div>
                                    <div style={sectionHeaderStyle}>Traffic Sources</div>
                                    {(internalStats.trafficSources || []).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {internalStats.trafficSources.map((s, i) => (
                                                <div
                                                    key={s.source || `source-${i}`}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '0.375rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {s.source || 'Direct'}
                                                    </span>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {s.sessions}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={emptyTextStyle}>No source data yet</p>
                                    )}
                                </div>

                                {/* Device Breakdown */}
                                <div>
                                    <div style={sectionHeaderStyle}>Devices</div>
                                    {(internalStats.deviceBreakdown || []).length > 0 ? (
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {internalStats.deviceBreakdown.map((d) => (
                                                <div
                                                    key={d.device || d.deviceCategory}
                                                    style={{
                                                        flex: 1,
                                                        textAlign: 'center',
                                                        padding: '0.75rem',
                                                        background: 'hsl(var(--muted))',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <i
                                                        className={getDeviceIcon(d.device)}
                                                        style={{ fontSize: '1.25rem', color: 'hsl(var(--primary))', display: 'block', marginBottom: '0.25rem' }}
                                                    ></i>
                                                    <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                                        {d.sessions}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', textTransform: 'capitalize' }}>
                                                        {d.device || 'Unknown'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={emptyTextStyle}>No device data yet</p>
                                    )}
                                </div>

                                {/* Top Locations */}
                                <div>
                                    <div style={sectionHeaderStyle}>Top Locations</div>
                                    {(internalStats.topLocations || []).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {internalStats.topLocations.map((loc, i) => (
                                                <div
                                                    key={`${loc._id?.city}-${loc._id?.region}-${i}`}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '0.375rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {loc._id?.city}{loc._id?.region ? `, ${loc._id.region}` : ''}
                                                    </span>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {loc.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={emptyTextStyle}>No location data yet</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Google Analytics */}
                    <Card title="Google Analytics">
                        {statsLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                        ) : !ga4Configured ? (
                            <div style={{ padding: '1.5rem' }}>
                                <div
                                    style={{
                                        padding: '1.25rem',
                                        background: 'hsl(var(--warning) / 0.12)',
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--warning) / 0.3)',
                                    }}
                                >
                                    <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'hsl(var(--warning))', marginBottom: '0.75rem' }}>
                                        <i className="pi pi-info-circle" style={{ marginRight: '0.5rem' }}></i>
                                        GA4 Not Configured
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))', margin: '0 0 0.75rem' }}>
                                        Connect Google Analytics 4 to see additional traffic data. Setup steps:
                                    </p>
                                    <ol style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))', margin: 0, paddingLeft: '1.25rem' }}>
                                        <li style={{ marginBottom: '0.375rem' }}>Create a GA4 property at analytics.google.com</li>
                                        <li style={{ marginBottom: '0.375rem' }}>Create a service account at console.cloud.google.com</li>
                                        <li style={{ marginBottom: '0.375rem' }}>Enable the Google Analytics Data API</li>
                                        <li style={{ marginBottom: '0.375rem' }}>Add the service account email as a Viewer on your GA4 property</li>
                                        <li>Set <code>GA4_PROPERTY_ID</code> and <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> in your .env</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Realtime + Today vs Yesterday */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={statCardStyle}>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Realtime Users
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'hsl(var(--primary))' }}>
                                            {ga4Data?.realtime?.activeUsers ?? '—'}
                                        </div>
                                    </div>
                                    <div style={statCardStyle}>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Today
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                            {ga4Data?.todayVsYesterday?.today ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>
                                            vs {ga4Data?.todayVsYesterday?.yesterday ?? '—'} yesterday
                                        </div>
                                    </div>
                                </div>

                                {/* GA4 Top Pages */}
                                {ga4Data?.topPages && ga4Data.topPages.length > 0 && (
                                    <div>
                                        <div style={sectionHeaderStyle}>Top Pages (GA4)</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {ga4Data.topPages.map((p, i) => (
                                                <div
                                                    key={p.page || p.pagePath}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '0.375rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                                        {p.page || p.pagePath}
                                                    </span>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {p.views || p.screenPageViews}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GA4 Traffic Sources */}
                                {ga4Data?.trafficSources && ga4Data.trafficSources.length > 0 && (
                                    <div>
                                        <div style={sectionHeaderStyle}>Traffic Sources (GA4)</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {ga4Data.trafficSources.map((s, i) => (
                                                <div
                                                    key={s.source || `ga4-source-${i}`}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '0.375rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground))' }}>
                                                        {s.source || s.sessionSource}
                                                    </span>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {s.sessions}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GA4 Device Breakdown */}
                                {ga4Data?.deviceBreakdown && ga4Data.deviceBreakdown.length > 0 && (
                                    <div>
                                        <div style={sectionHeaderStyle}>Devices (GA4)</div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {ga4Data.deviceBreakdown.map((d) => (
                                                <div
                                                    key={d.device || d.deviceCategory}
                                                    style={{
                                                        flex: 1,
                                                        textAlign: 'center',
                                                        padding: '0.75rem',
                                                        background: 'hsl(var(--muted))',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <i
                                                        className={getDeviceIcon(d.device || d.deviceCategory)}
                                                        style={{ fontSize: '1.25rem', color: 'hsl(var(--primary))', display: 'block', marginBottom: '0.25rem' }}
                                                    ></i>
                                                    <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                                        {d.sessions}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', textTransform: 'capitalize' }}>
                                                        {d.device || d.deviceCategory || 'Unknown'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Section 3 — Recent Activity Feed */}
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Recent Activity</span>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: '400',
                                    color: 'hsl(var(--foreground-muted))',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={showIdentifiedOnly}
                                    onChange={(e) => setShowIdentifiedOnly(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                Identified leads only
                            </label>
                        </div>
                    }
                >
                    {statsLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                    ) : filteredActivity.length > 0 ? (
                        <ScrollPanel style={{ width: '100%', height: '500px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {filteredActivity.map((event, i) => (
                                    <div
                                        key={event._id || `${event.timestamp}-${i}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '4px',
                                            background: i % 2 === 0 ? 'hsl(var(--muted))' : 'transparent',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', minWidth: '130px' }}>
                                            {formatTimestamp(event.timestamp)}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.8125rem',
                                                color: 'hsl(var(--foreground))',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1,
                                            }}
                                        >
                                            {event.page_title || event.page_url}
                                        </span>
                                        {event.lead_id ? (
                                            <button
                                                type="button"
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: 'hsl(var(--primary))',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    window.location.href = `/lead/${event.lead_id}`;
                                                }}
                                            >
                                                {event.lead_name || 'Lead'}
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                                                Anonymous
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollPanel>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                            <p style={{ fontSize: '0.9375rem', margin: 0 }}>No recent activity to display</p>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

// ─── Helpers ────────────────────────────────────────────

const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
        case 'mobile':
            return 'pi pi-mobile';
        case 'tablet':
            return 'pi pi-tablet';
        default:
            return 'pi pi-desktop';
    }
};

const getSourceColor = (source) => {
    const s = source?.toLowerCase() || '';
    if (s.includes('google') || s.includes('organic')) return { bg: 'hsl(var(--success) / 0.15)', text: 'hsl(var(--success))' };
    if (s.includes('facebook') || s.includes('social')) return { bg: 'hsl(var(--primary) / 0.12)', text: 'hsl(var(--primary))' };
    if (s.includes('email')) return { bg: 'hsl(var(--danger) / 0.15)', text: 'hsl(var(--danger))' };
    if (s === 'direct') return { bg: 'hsl(270 38% 49% / 0.15)', text: 'hsl(270 38% 60%)' };
    return { bg: 'hsl(var(--muted))', text: 'hsl(var(--foreground-muted))' };
};

// ─── Style Constants ────────────────────────────────────

const thStyle = {
    textAlign: 'left',
    padding: '0.625rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'hsl(var(--foreground-muted))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
};

const sectionHeaderStyle = {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'hsl(var(--foreground-muted))',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
};

const statCardStyle = {
    flex: 1,
    textAlign: 'center',
    padding: '1rem',
    background: 'hsl(var(--muted))',
    borderRadius: '8px',
};

const emptyTextStyle = {
    fontSize: '0.8125rem',
    color: 'hsl(var(--muted-foreground))',
    margin: 0,
    fontStyle: 'italic',
};

export default TrafficDashboard;
