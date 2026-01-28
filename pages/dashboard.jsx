// React & NextJS
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import PrpCard from '../components/prpCard/PrpCard';

const Dashboard = () => {
    // __________________Redux State______________________\\
    const allLeads = useSelector((state) => state.allLeadsPage);
    const hotsheet = useSelector((state) => state.hotsheet);

    // Sort leads by last visit date (most recent first)
    const sortedLeads = [...allLeads].sort((a, b) => {
        const dateA = a.last_visit ? new Date(a.last_visit) : new Date(0);
        const dateB = b.last_visit ? new Date(b.last_visit) : new Date(0);
        return dateB - dateA;
    });

    // Get top 4 most recent leads
    const recentLeads = sortedLeads.slice(0, 4);

    return (
        <MainLayout>
            <div className="dashboard-page" style={{ padding: '1.5rem' }}>
                {/* Top Section - Two Boxes Side by Side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Top Left - Transactions */}
                    <Card title="Transactions" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                    YTD Closed Transactions
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>4</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                    YTD Closed Volume
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                    $2,000,000
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                    Number of Transactions in Escrow
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>3</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                    Dollar Volume of Transactions in Escrow
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>
                                    $1,350,000
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
                                            onClick={() =>
                                                (window.location.href = `/lead/${lead._id}`)
                                            }
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
                                                    <div>
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

                {/* Bottom Section - Hotsheet */}
                <Card title="Hotsheet Properties" style={{ width: '100%' }}>
                    <ScrollPanel style={{ width: '100%', height: '600px' }}>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1.5rem',
                                padding: '1rem 0',
                            }}
                        >
                            {hotsheet && hotsheet.length > 0 ? (
                                hotsheet.map((property) => (
                                    <PrpCard
                                        key={property._id || property.mls_number}
                                        property={property}
                                        handleOpenMapDialog={() => {}}
                                    />
                                ))
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#6c757d',
                                    }}
                                >
                                    <i
                                        className="pi pi-home"
                                        style={{ fontSize: '3rem', marginBottom: '1rem' }}
                                    ></i>
                                    <p style={{ fontSize: '1.125rem' }}>
                                        No properties in your hotsheet yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollPanel>
                </Card>
            </div>
        </MainLayout>
    );
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

// Helper function to format last visit time
const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Never';

    const now = new Date();
    const visitDate = new Date(lastVisit);
    const diffMs = now - visitDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
        return diffHours === 0 ? 'Less than 1 hour ago' : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
};

export default Dashboard;
