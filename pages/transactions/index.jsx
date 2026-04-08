// React & NextJS
import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

// ── Helpers ──────────────────────────────────────────────────────
const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return '#f59e0b';
        case 'In Escrow': return '#667eea';
        case 'Closed': return '#4CAF50';
        case 'Cancelled': return '#ff5252';
        default: return '#6c757d';
    }
};

// ── Date range presets ───────────────────────────────────────────
const getPresetDates = (preset) => {
    const now = new Date();
    switch (preset) {
        case 'this-month': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
        }
        case 'ytd': {
            const start = new Date(now.getFullYear(), 0, 1);
            return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
        }
        case 'last-12': {
            const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
        }
        default:
            return { startDate: '', endDate: '' };
    }
};

// ── Stat cards renderer ──────────────────────────────────────────
const StatCards = ({ stats }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    }}>
        <Card style={{
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
        }}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', opacity: 0.9 }}>
                Current Transactions
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {stats.currentTransactions}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Active deals in pipeline
            </div>
        </Card>

        <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                Sales Volume in Escrow
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}>
                {formatCurrency(stats.escrowVolume)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                {stats.escrowCount} {stats.escrowCount === 1 ? 'transaction' : 'transactions'}
            </div>
        </Card>

        <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                Sales Volume Closed YTD
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}>
                {formatCurrency(stats.closedVolumeYTD)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                {stats.closedCountYTD} closed in {stats.year}
            </div>
        </Card>

        <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                Pending Commissions
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b' }}>
                {formatCurrency(stats.pendingCommissions)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                In escrow + pending
            </div>
        </Card>

        <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                Commissions Earned YTD
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4CAF50' }}>
                {formatCurrency(stats.earnedCommissionsYTD)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                From closed deals
            </div>
        </Card>
    </div>
);

const TransactionsDashboard = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const isAdmin = agent?.role === 'admin';

    // ── Tab state ────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('my');

    // ── My Transactions state ────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Brokerage commission display logic ─────────────────────────
    // Show agent_net_commission for the logged-in agent's own transactions,
    // brokerage_net_commission for other agents' transactions
    const getBrokerageCommission = (transaction) => {
        if (transaction.agent?._id === agent?._id ||
            transaction.agent === agent?._id) {
            return transaction.agent_net_commission || 0;
        }
        return transaction.brokerage_net_commission || 0;
    };

    // ── Brokerage tab state ──────────────────────────────────────
    const [brokerageStats, setBrokerageStats] = useState(null);
    const [brokerageTransactions, setBrokerageTransactions] = useState([]);
    const [brokerageLoading, setBrokerageLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [agentFilter, setAgentFilter] = useState('');
    const [datePreset, setDatePreset] = useState('ytd');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'acceptanceDate', direction: 'desc' });

    // ── Fetch My Transactions on mount ───────────────────────────
    useEffect(() => {
        if (!isLoggedIn || !agent) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const statsResponse = await IrgApi.get('/transactions/dashboard-stats', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (statsResponse.data.status === 'success') {
                    setStats(statsResponse.data.data);
                }

                const transactionsResponse = await IrgApi.get('/transactions/all-agent-transactions', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (transactionsResponse.data.status === 'success') {
                    setTransactions(transactionsResponse.data.data);
                }
            } catch (error) {
                showToast('error', 'Failed to load dashboard data', 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isLoggedIn, agent]);

    // ── Fetch agents list once when brokerage tab first opened ───
    useEffect(() => {
        if (activeTab !== 'brokerage' || !isAdmin || agents.length > 0) return;

        const fetchAgents = async () => {
            try {
                const response = await IrgApi.get('/agents/all-agents', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (response.data.status === 'success') {
                    setAgents(response.data.data);
                }
            } catch (err) {
                // silent fail
            }
        };
        fetchAgents();
    }, [activeTab, isAdmin, isLoggedIn, agents.length]);

    // ── Compute active date range ────────────────────────────────
    const activeDateRange = useMemo(() => {
        if (datePreset === 'custom') {
            return { startDate: customStartDate, endDate: customEndDate };
        }
        return getPresetDates(datePreset);
    }, [datePreset, customStartDate, customEndDate]);

    // ── Fetch brokerage data when tab/filters change ─────────────
    const fetchBrokerageData = useCallback(async () => {
        if (!isLoggedIn || !isAdmin) return;

        setBrokerageLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeDateRange.startDate) params.append('startDate', activeDateRange.startDate);
            if (activeDateRange.endDate) params.append('endDate', activeDateRange.endDate);
            if (agentFilter) params.append('agentId', agentFilter);

            const qs = params.toString() ? `?${params.toString()}` : '';
            const headers = { Authorization: `Bearer ${isLoggedIn}` };

            const [statsRes, txnRes] = await Promise.all([
                IrgApi.get(`/transactions/brokerage-dashboard-stats${qs}`, { headers }),
                IrgApi.get(`/transactions/all-brokerage-transactions${qs}`, { headers }),
            ]);

            if (statsRes.data.status === 'success') setBrokerageStats(statsRes.data.data);
            if (txnRes.data.status === 'success') setBrokerageTransactions(txnRes.data.data);
        } catch (error) {
            showToast('error', 'Failed to load brokerage data', 'Error');
        } finally {
            setBrokerageLoading(false);
        }
    }, [isLoggedIn, isAdmin, activeDateRange, agentFilter]);

    useEffect(() => {
        if (activeTab === 'brokerage') {
            fetchBrokerageData();
        }
    }, [activeTab, fetchBrokerageData]);

    // ── Client-side sort for brokerage table ─────────────────────
    const sortedBrokerageTransactions = useMemo(() => {
        if (!brokerageTransactions.length) return [];
        const sorted = [...brokerageTransactions];
        sorted.sort((a, b) => {
            let aVal;
            let bVal;
            switch (sortConfig.key) {
                case 'agent':
                    aVal = a.agent?.name || '';
                    bVal = b.agent?.name || '';
                    break;
                case 'address':
                    aVal = a.address || '';
                    bVal = b.address || '';
                    break;
                case 'status':
                    aVal = a.status || '';
                    bVal = b.status || '';
                    break;
                case 'salesPrice':
                    aVal = a.salesPrice || 0;
                    bVal = b.salesPrice || 0;
                    break;
                case 'agent_net_commission':
                    aVal = a.agent_net_commission || 0;
                    bVal = b.agent_net_commission || 0;
                    break;
                case 'brokerage_net_commission':
                    aVal = a.brokerage_net_commission || 0;
                    bVal = b.brokerage_net_commission || 0;
                    break;
                case 'acceptanceDate':
                    aVal = a.acceptanceDate ? new Date(a.acceptanceDate) : new Date(0);
                    bVal = b.acceptanceDate ? new Date(b.acceptanceDate) : new Date(0);
                    break;
                case 'expectedClose':
                    aVal = a.anticipatedClosingDate ? new Date(a.anticipatedClosingDate) : new Date(0);
                    bVal = b.anticipatedClosingDate ? new Date(b.anticipatedClosingDate) : new Date(0);
                    break;
                default:
                    aVal = '';
                    bVal = '';
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [brokerageTransactions, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    // ══════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════

    return (
        <MainLayout title="Transactions">
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'hsl(var(--foreground))',
                            marginBottom: '0.5rem',
                        }}>
                            Transactions Dashboard
                        </h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>
                            Track your transactions, sales volume, and commissions
                        </p>
                    </div>
                    <Button
                        label="Add New Transaction"
                        icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={() => router.push('/transactions/new')}
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
                    />
                </div>

                {/* ── Tab Bar (admin only) ──────────────────────────── */}
                {isAdmin && (
                    <div style={{
                        display: 'flex',
                        gap: '0',
                        marginBottom: '2rem',
                        borderBottom: '2px solid hsl(var(--border))',
                    }}>
                        <button
                            onClick={() => setActiveTab('my')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === 'my' ? '600' : '400',
                                color: activeTab === 'my' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'my' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                                marginBottom: '-2px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            My Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('brokerage')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === 'brokerage' ? '600' : '400',
                                color: activeTab === 'brokerage' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'brokerage' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                                marginBottom: '-2px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Brokerage
                        </button>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 1 — MY TRANSACTIONS
                    ══════════════════════════════════════════════════ */}
                {activeTab === 'my' && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
                            </div>
                        ) : stats && (
                            <StatCards stats={stats} />
                        )}

                        <Card title="Your Transactions" style={{
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                        }}>
                            {transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No transactions yet</p>
                                    <p style={{ fontSize: '0.9rem' }}>Click &quot;Add New Transaction&quot; to create your first one</p>
                                </div>
                            ) : (
                                <ScrollPanel style={{ width: '100%', height: '600px' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '1.5rem',
                                        padding: '0.5rem',
                                    }}>
                                        {transactions.map((transaction) => (
                                            <div
                                                key={transaction._id}
                                                style={{
                                                    padding: '1.25rem',
                                                    background: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {transaction.property?.listing_pics && (
                                                    <div style={{ marginBottom: '1rem', borderRadius: '6px', overflow: 'hidden' }}>
                                                        <img
                                                            src={transaction.property.listing_pics.replace(/http:/, 'https:')}
                                                            alt={transaction.address}
                                                            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
                                                    {transaction.address}
                                                </div>
                                                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                    {transaction.city}, {transaction.state} {transaction.zipCode}
                                                </div>

                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    backgroundColor: getStatusColor(transaction.status) + '20',
                                                    color: getStatusColor(transaction.status),
                                                    marginBottom: '1rem',
                                                }}>
                                                    {transaction.status}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Sales Price:</span>
                                                        <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                            {formatCurrency(transaction.salesPrice)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Est. Commission:</span>
                                                        <span style={{ fontWeight: '600', color: 'hsl(var(--success))' }}>
                                                            {formatCurrency(transaction.estimatedAgentCommission)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Acceptance Date:</span>
                                                        <span style={{ color: 'hsl(var(--foreground))' }}>
                                                            {formatDate(transaction.acceptanceDate)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                                                            {transaction.actualClosingDate ? 'Closed:' : 'Expected Close:'}
                                                        </span>
                                                        <span style={{ color: 'hsl(var(--foreground))' }}>
                                                            {formatDate(transaction.actualClosingDate || transaction.anticipatedClosingDate)}
                                                        </span>
                                                    </div>
                                                    {transaction.property && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border))', marginTop: '0.5rem' }}>
                                                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>MLS#:</span>
                                                            <span style={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}>
                                                                {transaction.property.mls_number}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    label="Edit"
                                                    icon="pi pi-pencil"
                                                    className="p-button-sm p-button-outlined"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/transactions/edit/${transaction._id}`);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        marginTop: '1rem',
                                                        justifyContent: 'center',
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollPanel>
                            )}
                        </Card>
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 2 — BROKERAGE TRANSACTIONS (admin only)
                    ══════════════════════════════════════════════════ */}
                {activeTab === 'brokerage' && isAdmin && (
                    <>
                        {brokerageLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                <p style={{ marginTop: '1rem' }}>Loading brokerage data...</p>
                            </div>
                        ) : (
                            <>
                                {/* Stat Cards */}
                                {brokerageStats && <StatCards stats={brokerageStats} />}

                                {/* ── Date Range Filter Bar ────────────── */}
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'hsl(var(--card))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'hsl(var(--foreground))', marginRight: '0.5rem' }}>
                                        Date Range:
                                    </span>
                                    {[
                                        { key: 'this-month', label: 'This Month' },
                                        { key: 'ytd', label: 'YTD' },
                                        { key: 'last-12', label: 'Last 12 Months' },
                                        { key: 'custom', label: 'Custom' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.key}
                                            onClick={() => setDatePreset(preset.key)}
                                            style={{
                                                padding: '0.4rem 0.9rem',
                                                fontSize: '0.85rem',
                                                fontWeight: datePreset === preset.key ? '600' : '400',
                                                color: datePreset === preset.key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                                                backgroundColor: datePreset === preset.key ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                                                border: '1px solid ' + (datePreset === preset.key ? 'hsl(var(--primary))' : 'hsl(var(--border))'),
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}

                                    {datePreset === 'custom' && (
                                        <>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.85rem',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '6px',
                                                    color: 'hsl(var(--foreground))',
                                                    background: 'hsl(var(--background))',
                                                }}
                                            />
                                            <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>to</span>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.85rem',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '6px',
                                                    color: 'hsl(var(--foreground))',
                                                    background: 'hsl(var(--background))',
                                                }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* ── Agent Filter + Table ─────────────── */}
                                <Card style={{
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                    borderRadius: '12px',
                                }}>
                                    {/* Agent Filter */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <select
                                            value={agentFilter}
                                            onChange={(e) => setAgentFilter(e.target.value)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                fontSize: '0.9rem',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '6px',
                                                color: 'hsl(var(--foreground))',
                                                background: 'hsl(var(--background))',
                                                minWidth: '220px',
                                            }}
                                        >
                                            <option value="">All Agents</option>
                                            {agents.map((a) => (
                                                <option key={a._id} value={a._id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Transactions Table */}
                                    {sortedBrokerageTransactions.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                            <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No transactions found</p>
                                            <p style={{ fontSize: '0.9rem' }}>Adjust your filters to see results</p>
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '0.9rem',
                                            }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                                                        {[
                                                            { key: 'agent', label: 'Agent' },
                                                            { key: 'address', label: 'Property Address' },
                                                            { key: 'status', label: 'Status' },
                                                            { key: 'salesPrice', label: 'Sales Price' },
                                                            { key: 'agent_net_commission', label: 'Est. Agent Commission' },
                                                            { key: 'brokerage_net_commission', label: 'Est. Brokerage Commission' },
                                                            { key: 'acceptanceDate', label: 'Acceptance Date' },
                                                            { key: 'expectedClose', label: 'Expected Close' },
                                                        ].map((col) => (
                                                            <th
                                                                key={col.key}
                                                                onClick={() => handleSort(col.key)}
                                                                style={{
                                                                    padding: '0.75rem',
                                                                    textAlign: 'left',
                                                                    color: 'hsl(var(--foreground))',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    userSelect: 'none',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {col.label}{getSortIndicator(col.key)}
                                                            </th>
                                                        ))}
                                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'hsl(var(--foreground))', fontWeight: '600' }}>
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedBrokerageTransactions.map((txn) => (
                                                        <tr
                                                            key={txn._id}
                                                            style={{ borderBottom: '1px solid hsl(var(--border))' }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }}
                                                        >
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))' }}>
                                                                {txn.agent?.name || 'N/A'}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))', fontWeight: '500' }}>
                                                                {txn.address || 'N/A'}
                                                            </td>
                                                            <td style={{ padding: '0.75rem' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '0.2rem 0.6rem',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600',
                                                                    backgroundColor: getStatusColor(txn.status) + '20',
                                                                    color: getStatusColor(txn.status),
                                                                }}>
                                                                    {txn.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))', fontWeight: '600' }}>
                                                                {formatCurrency(txn.salesPrice)}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--success))', fontWeight: '600' }}>
                                                                {formatCurrency(txn.agent_net_commission)}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))', fontWeight: '600' }}>
                                                                {formatCurrency(getBrokerageCommission(txn))}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))' }}>
                                                                {formatDate(txn.acceptanceDate)}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', color: 'hsl(var(--foreground))' }}>
                                                                {formatDate(txn.actualClosingDate || txn.anticipatedClosingDate)}
                                                            </td>
                                                            <td style={{ padding: '0.75rem' }}>
                                                                <Button
                                                                    label="Edit"
                                                                    icon="pi pi-pencil"
                                                                    className="p-button-sm p-button-outlined"
                                                                    onClick={() => router.push(`/transactions/edit/${txn._id}`)}
                                                                    style={{ fontSize: '0.8rem' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Totals Row */}
                                                    <tr style={{
                                                        borderTop: '2px solid hsl(var(--border))',
                                                        background: 'hsl(var(--muted))',
                                                    }}>
                                                        <td style={{ padding: '0.75rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                                            Totals
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }} />
                                                        <td style={{ padding: '0.75rem' }} />
                                                        <td style={{ padding: '0.75rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                                            {formatCurrency(brokerageTransactions.reduce((sum, t) => sum + (t.salesPrice || 0), 0))}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', fontWeight: '700', color: 'hsl(var(--success))' }}>
                                                            {formatCurrency(brokerageTransactions.reduce((sum, t) => sum + (t.agent_net_commission || 0), 0))}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>
                                                            {formatCurrency(brokerageTransactions.reduce((sum, t) => sum + getBrokerageCommission(t), 0))}
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }} />
                                                        <td style={{ padding: '0.75rem' }} />
                                                        <td style={{ padding: '0.75rem' }} />
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card>
                            </>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default TransactionsDashboard;
