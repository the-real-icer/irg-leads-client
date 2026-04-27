import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import IrgApi from '../../assets/irgApi';

const useDashboardData = () => {
    // ── Redux (read-only) ───────────────────────────────────────
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const currentAgent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const isAdmin = currentAgent?.role === 'admin';

    // ── Local state — personal tab ──────────────────────────────
    const [activeLeads, setActiveLeads] = useState([]);
    const [activeLeadsLoading, setActiveLeadsLoading] = useState(true);
    const [txMetrics, setTxMetrics] = useState(null);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState(false);
    const [upcomingDates, setUpcomingDates] = useState([]);
    const [upcomingDatesLoading, setUpcomingDatesLoading] = useState(true);
    const [recentAgentLogins, setRecentAgentLogins] = useState([]);
    const [recentAgentLoginsLoading, setRecentAgentLoginsLoading] = useState(true);

    // ── Local state — admin tab ─────────────────────────────────
    const [activeTab, setActiveTab] = useState('my');
    const [brokerageStats, setBrokerageStats] = useState(null);
    const [brokerageUpcomingDates, setBrokerageUpcomingDates] = useState([]);
    const [brokerageLoading, setBrokerageLoading] = useState(false);
    const [leadSourceReport, setLeadSourceReport] = useState(null);
    const [leadSourceReportLoading, setLeadSourceReportLoading] = useState(false);
    const [leadSourceReportError, setLeadSourceReportError] = useState(false);
    const brokerageFetched = useRef(false);

    // ── Derived data ────────────────────────────────────────────
    const recentLeads = useMemo(() => {
        const sorted = [...allLeads].sort((a, b) => {
            const dateA = a.last_visit ? new Date(a.last_visit) : new Date(0);
            const dateB = b.last_visit ? new Date(b.last_visit) : new Date(0);
            return dateB - dateA;
        });
        return sorted.slice(0, 4);
    }, [allLeads]);

    // ── Fetchers ────────────────────────────────────────────────

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

    // Retry handler for production grid error state
    const retryTxMetrics = useCallback(() => {
        setTxError(false);
        setTxLoading(true);
        fetchTxMetrics();
    }, [fetchTxMetrics]);

    // ── Effects ─────────────────────────────────────────────────

    // Fetch on mount + refresh active leads every 60 seconds
    useEffect(() => {
        fetchActiveLeads();
        fetchTxMetrics();
        fetchUpcomingDates();
        fetchRecentAgentLogins();
        const interval = setInterval(fetchActiveLeads, 60000);
        return () => clearInterval(interval);
    }, [fetchActiveLeads, fetchTxMetrics, fetchUpcomingDates, fetchRecentAgentLogins]);

    // Fetch brokerage data on first tab switch only
    useEffect(() => {
        if (activeTab !== 'brokerage' || !isAdmin || !isLoggedIn || brokerageFetched.current) return;
        brokerageFetched.current = true;

        const fetchBrokerageData = async () => {
            setBrokerageLoading(true);
            setLeadSourceReportLoading(true);
            setLeadSourceReportError(false);
            try {
                const headers = { Authorization: `Bearer ${isLoggedIn}` };
                const [statsRes, datesRes] = await Promise.all([
                    IrgApi.get('/transactions/brokerage-dashboard-stats', { headers }),
                    IrgApi.get('/transactions/brokerage-upcoming-dates', { headers }),
                ]);
                if (statsRes.data.status === 'success') setBrokerageStats(statsRes.data.data);
                if (datesRes.data.status === 'success') setBrokerageUpcomingDates(datesRes.data.data);
            } catch {
                // silent fail
            } finally {
                setBrokerageLoading(false);
            }

            try {
                const res = await IrgApi.get('/reports/lead-source-conversions', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                setLeadSourceReport(res.data?.status === 'success' ? res.data.data : null);
            } catch {
                setLeadSourceReport(null);
                setLeadSourceReportError(true);
            } finally {
                setLeadSourceReportLoading(false);
            }
        };
        fetchBrokerageData();
    }, [activeTab, isAdmin, isLoggedIn]);

    // ── Public interface ────────────────────────────────────────
    return {
        // Redux-derived
        isAdmin,
        allLeads,

        // Tab state
        activeTab,
        setActiveTab,

        // Personal — production
        txMetrics,
        txLoading,
        txError,
        retryTxMetrics,

        // Personal — upcoming dates
        upcomingDates,
        upcomingDatesLoading,

        // Personal — recent leads
        recentLeads,

        // Personal — active leads
        activeLeads,
        activeLeadsLoading,

        // Admin — agent logins
        recentAgentLogins,
        recentAgentLoginsLoading,

        // Brokerage tab
        brokerageStats,
        brokerageUpcomingDates,
        brokerageLoading,
        leadSourceReport,
        leadSourceReportLoading,
        leadSourceReportError,
    };
};

export default useDashboardData;
