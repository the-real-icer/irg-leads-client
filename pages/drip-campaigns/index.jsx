import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Chip = dynamic(() => import('primereact/chip').then((mod) => mod.Chip), { ssr: false });
const ProgressBar = dynamic(() => import('primereact/progressbar').then((mod) => mod.ProgressBar), {
    ssr: false,
});

import MainLayout from '../../components/layout/MainLayout';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Buyer', value: 'Buyer' },
    { label: 'Seller', value: 'Seller' },
    { label: 'Both', value: 'Both' },
];

const timeframeOptions = [
    { label: 'All Timeframes', value: '' },
    { label: '30 days', value: '30 days' },
    { label: '60 days', value: '60 days' },
    { label: '90 days', value: '90 days' },
    { label: '3-6 months', value: '3-6 months' },
    { label: '6 months - 1 year', value: '6 months - 1 year' },
    { label: 'Long-term', value: 'long-term' },
];

const getTypeBadgeColor = (type) => {
    const colors = {
        Buyer: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
        Seller: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
        Both: { bg: '#f3e8ff', color: '#7c3aed', border: '#c4b5fd' },
    };
    return colors[type] || colors.Both;
};

const DripCampaigns = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const router = useRouter();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [timeframeFilter, setTimeframeFilter] = useState('');

    const fetchCampaigns = async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            if (timeframeFilter) params.append('timeframe', timeframeFilter);

            const response = await IrgApi.get(
                `/drip-campaigns${params.toString() ? `?${params.toString()}` : ''}`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );

            if (response.data.status === 'success') {
                setCampaigns(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            showToast('error', 'Failed to load drip campaigns', 'Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [isLoggedIn, typeFilter, timeframeFilter]); // eslint-disable-line

    const handleDeleteCampaign = async (campaignId) => {
        try {
            const response = await IrgApi.delete(`/drip-campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (response.data.status === 'success') {
                setCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
                showToast('success', 'Campaign deleted', 'Success');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            showToast('error', error.response?.data?.message || 'Failed to delete campaign', 'Error');
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: '2rem' }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                            Drip Campaigns
                        </h1>
                        <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>
                            Create and manage automated email sequences for your leads
                        </p>
                    </div>
                    <Button
                        label="Create Campaign"
                        icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={() => router.push('/drip-campaigns/new')}
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
                    />
                </div>

                {/* Filters */}
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <Dropdown
                        value={typeFilter}
                        options={typeOptions}
                        onChange={(e) => setTypeFilter(e.value)}
                        placeholder="Filter by Type"
                        style={{ minWidth: '200px' }}
                    />
                    <Dropdown
                        value={timeframeFilter}
                        options={timeframeOptions}
                        onChange={(e) => setTimeframeFilter(e.value)}
                        placeholder="Filter by Timeframe"
                        style={{ minWidth: '200px' }}
                    />
                </div>

                {/* Campaign Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <i
                            className="pi pi-spin pi-spinner"
                            style={{ fontSize: '3rem', color: '#667eea' }}
                        />
                        <p style={{ color: '#6c757d', marginTop: '1rem' }}>Loading campaigns...</p>
                    </div>
                ) : campaigns.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '1.5rem',
                        }}
                    >
                        {campaigns.map((campaign) => {
                            const badgeColor = getTypeBadgeColor(campaign.type);
                            return (
                                <Card
                                    key={campaign._id}
                                    style={{
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ padding: '0.5rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'start',
                                                marginBottom: '1rem',
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    margin: 0,
                                                }}
                                            >
                                                {campaign.name}
                                            </h3>
                                            <span
                                                style={{
                                                    backgroundColor: badgeColor.bg,
                                                    color: badgeColor.color,
                                                    border: `1px solid ${badgeColor.border}`,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '16px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {campaign.type}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                marginBottom: '1rem',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Chip
                                                label={campaign.timeframe}
                                                icon="pi pi-clock"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#475569',
                                                }}
                                            />
                                            <Chip
                                                label={`${campaign.emails?.length || 0} emails`}
                                                icon="pi pi-envelope"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#475569',
                                                }}
                                            />
                                        </div>

                                        {campaign.created_by && (
                                            <p
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: '#6c757d',
                                                    margin: '0 0 1rem 0',
                                                }}
                                            >
                                                Created by {campaign.created_by.name || 'Unknown'}
                                            </p>
                                        )}

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '0.5rem',
                                                borderTop: '1px solid #e2e8f0',
                                                paddingTop: '1rem',
                                            }}
                                        >
                                            <Button
                                                label="Edit"
                                                icon="pi pi-pencil"
                                                className="p-button-sm p-button-outlined"
                                                onClick={() =>
                                                    router.push(`/drip-campaigns/edit/${campaign._id}`)
                                                }
                                            />
                                            {(campaign.created_by?._id === agent?._id ||
                                                agent?.role === 'admin') && (
                                                <Button
                                                    icon="pi pi-trash"
                                                    className="p-button-sm p-button-danger p-button-text"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCampaign(campaign._id);
                                                    }}
                                                    tooltip="Delete campaign"
                                                    tooltipOptions={{ position: 'top' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '4rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                        }}
                    >
                        <i
                            className="pi pi-send"
                            style={{
                                fontSize: '3rem',
                                color: '#6c757d',
                                opacity: 0.5,
                                display: 'block',
                                marginBottom: '1rem',
                            }}
                        />
                        <h3 style={{ color: '#495057', marginBottom: '0.5rem' }}>
                            No campaigns yet
                        </h3>
                        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                            Create your first drip campaign to start automating lead engagement
                        </p>
                        <Button
                            label="Create Your First Campaign"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={() => router.push('/drip-campaigns/new')}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DripCampaigns;
