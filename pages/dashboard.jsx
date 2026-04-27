import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

import MainLayout from '../components/layout/MainLayout';
import DashboardHotsheet from '../components/Dashboard/DashboardHotsheet';

import DashboardTabBar from '../components/Dashboard/DashboardTabBar';
import ProductionGrid from '../components/Dashboard/ProductionGrid';
import UpcomingDatesList from '../components/Dashboard/UpcomingDatesList';
import RecentLeadsCard from '../components/Dashboard/RecentLeadsCard';
import RecentAgentLoginsCard from '../components/Dashboard/RecentAgentLoginsCard';
import ActiveLeadsCard from '../components/Dashboard/ActiveLeadsCard';
import BrokerageTab from '../components/Dashboard/BrokerageTab';

import useDashboardData from '../hooks/dashboard/useDashboardData';

const Dashboard = () => {
    const {
        isAdmin,
        allLeads,
        activeTab,
        setActiveTab,
        txMetrics,
        txLoading,
        txError,
        retryTxMetrics,
        upcomingDates,
        upcomingDatesLoading,
        recentLeads,
        activeLeads,
        activeLeadsLoading,
        recentAgentLogins,
        recentAgentLoginsLoading,
        brokerageStats,
        brokerageUpcomingDates,
        brokerageLoading,
        leadSourceReport,
        leadSourceReportLoading,
        leadSourceReportError,
    } = useDashboardData();

    return (
        <MainLayout title="Dashboard">
            <div className="dashboard-page" style={{ padding: '1.5rem' }}>
                {/* ── Tab Bar (admin only) ──────────────────────────── */}
                {isAdmin && (
                    <DashboardTabBar activeTab={activeTab} onTabChange={setActiveTab} />
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 1 — MY PRODUCTION
                    ══════════════════════════════════════════════════ */}
                {activeTab === 'my' && (<>
                {/* Top Section - Two Boxes Side by Side */}
                <div className="grid-cols-1 md:grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Top Left - My Production */}
                    <Card title="My Production" style={{ height: '100%' }}>
                        <ProductionGrid
                            metrics={txMetrics}
                            loading={txLoading}
                            error={txError}
                            onRetry={retryTxMetrics}
                        />
                        {!txLoading && !txError && (
                            <UpcomingDatesList
                                title="Upcoming Important Dates"
                                dates={upcomingDates}
                                loading={upcomingDatesLoading}
                            />
                        )}
                    </Card>

                    {/* Top Right - Recent Leads */}
                    <RecentLeadsCard leads={recentLeads} />
                </div>

                {isAdmin && (
                    <RecentAgentLoginsCard
                        logins={recentAgentLogins}
                        loading={recentAgentLoginsLoading}
                    />
                )}

                {/* Middle Section - Leads Active on Site */}
                <ActiveLeadsCard
                    sessions={activeLeads}
                    loading={activeLeadsLoading}
                    allLeads={allLeads}
                />

                {/* Bottom Section - Hotsheet */}
                <DashboardHotsheet />
                </>)}

                {/* ══════════════════════════════════════════════════
                    TAB 2 — BROKERAGE (admin only)
                    ══════════════════════════════════════════════════ */}
                {activeTab === 'brokerage' && isAdmin && (
                    <BrokerageTab
                        stats={brokerageStats}
                        upcomingDates={brokerageUpcomingDates}
                        loading={brokerageLoading}
                        leadSourceReport={leadSourceReport}
                        leadSourceReportLoading={leadSourceReportLoading}
                        leadSourceReportError={leadSourceReportError}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Dashboard;
