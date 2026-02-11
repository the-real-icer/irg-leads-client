// React & NextJS
import { useState, useEffect } from 'react';
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

const TransactionsDashboard = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard stats and transactions on mount
    useEffect(() => {
        if (!isLoggedIn || !agent) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch stats
                const statsResponse = await IrgApi.get('/transactions/dashboard-stats', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` }
                });

                if (statsResponse.data.status === 'success') {
                    setStats(statsResponse.data.data);
                }

                // Fetch all transactions
                const transactionsResponse = await IrgApi.get('/transactions/all-agent-transactions', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` }
                });

                if (transactionsResponse.data.status === 'success') {
                    setTransactions(transactionsResponse.data.data);
                }
            } catch (error) {
                console.error('Dashboard fetch error:', error); // eslint-disable-line
                showToast('error', 'Failed to load dashboard data', 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isLoggedIn, agent]);

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'In Escrow': return '#667eea';
            case 'Closed': return '#4CAF50';
            case 'Cancelled': return '#ff5252';
            default: return '#6c757d';
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                        }}>
                            Transactions Dashboard
                        </h1>
                        <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
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

                {/* Statistics Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                        <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
                    </div>
                ) : stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Current Transactions */}
                        <Card style={{
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
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

                        {/* Sales Volume in Escrow */}
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

                        {/* Sales Volume Closed YTD */}
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

                        {/* Pending Commissions */}
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

                        {/* Commissions Earned YTD */}
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
                )}

                {/* Transactions List */}
                <Card title="Your Transactions" style={{
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px'
                }}>
                    {transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No transactions yet</p>
                            <p style={{ fontSize: '0.9rem' }}>Click "Add New Transaction" to create your first one</p>
                        </div>
                    ) : (
                        <ScrollPanel style={{ width: '100%', height: '600px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '1.5rem',
                                padding: '0.5rem'
                            }}>
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        style={{
                                            padding: '1.25rem',
                                            background: 'white',
                                            border: '1px solid #dee2e6',
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
                                        {/* Property Image */}
                                        {transaction.property?.listing_pics && (
                                            <div style={{ marginBottom: '1rem', borderRadius: '6px', overflow: 'hidden' }}>
                                                <img
                                                    src={transaction.property.listing_pics.replace(/http:/, 'https:')}
                                                    alt={transaction.address}
                                                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}

                                        {/* Address */}
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
                                            {transaction.address}
                                        </div>
                                        <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                            {transaction.city}, {transaction.state} {transaction.zipCode}
                                        </div>

                                        {/* Status Badge */}
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            backgroundColor: getStatusColor(transaction.status) + '20',
                                            color: getStatusColor(transaction.status),
                                            marginBottom: '1rem'
                                        }}>
                                            {transaction.status}
                                        </div>

                                        {/* Transaction Details */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6c757d' }}>Sales Price:</span>
                                                <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                                                    {formatCurrency(transaction.salesPrice)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6c757d' }}>Est. Commission:</span>
                                                <span style={{ fontWeight: '600', color: '#4CAF50' }}>
                                                    {formatCurrency(transaction.estimatedAgentCommission)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6c757d' }}>Acceptance Date:</span>
                                                <span style={{ color: '#2c3e50' }}>
                                                    {formatDate(transaction.acceptanceDate)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6c757d' }}>
                                                    {transaction.actualClosingDate ? 'Closed:' : 'Expected Close:'}
                                                </span>
                                                <span style={{ color: '#2c3e50' }}>
                                                    {formatDate(transaction.actualClosingDate || transaction.anticipatedClosingDate)}
                                                </span>
                                            </div>
                                            {transaction.property && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #dee2e6', marginTop: '0.5rem' }}>
                                                    <span style={{ color: '#6c757d' }}>MLS#:</span>
                                                    <span style={{ color: '#2c3e50', fontFamily: 'monospace' }}>
                                                        {transaction.property.mls_number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Button */}
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
                                                justifyContent: 'center'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </ScrollPanel>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

export default TransactionsDashboard;
