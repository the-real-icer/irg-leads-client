import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector, useDispatch } from 'react-redux';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Chip = dynamic(() => import('primereact/chip').then((mod) => mod.Chip), { ssr: false });

import MainLayout from '../../components/layout/MainLayout';
import CampaignPreviewDialog from '../../components/DripCampaigns/CampaignPreviewDialog';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import getLeadDisplayName from '../../utils/getLeadDisplayName';
import { fetchLeads } from '../../store/actions';
import { UPDATE_SINGLE_LEAD } from '../../store/actions/types';

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
        Buyer: {
            bg: 'hsl(var(--primary) / 0.12)',
            color: 'hsl(var(--primary))',
            border: 'hsl(var(--primary) / 0.35)',
        },
        Seller: {
            bg: 'hsl(var(--success) / 0.12)',
            color: 'hsl(var(--success))',
            border: 'hsl(var(--success) / 0.35)',
        },
        Both: {
            bg: 'hsl(var(--secondary) / 0.12)',
            color: 'hsl(var(--secondary))',
            border: 'hsl(var(--secondary) / 0.35)',
        },
    };
    return colors[type] || colors.Both;
};

const DripCampaigns = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const router = useRouter();
    const dispatch = useDispatch();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [timeframeFilter, setTimeframeFilter] = useState('');
    const [previewCampaign, setPreviewCampaign] = useState(null);

    // Assign To A Lead dialog state
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignDialogCampaign, setAssignDialogCampaign] = useState(null);
    const [leadSearch, setLeadSearch] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
    const [assignState, setAssignState] = useState('idle'); // idle | loading | success | error
    const [assignError, setAssignError] = useState('');

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
            showToast('error', error.response?.data?.message || 'Failed to delete campaign', 'Error');
        }
    };

    // ── Assign To A Lead ──
    const closeAssignDialog = useCallback(() => {
        setAssignDialogOpen(false);
        setAssignDialogCampaign(null);
        setLeadSearch('');
        setSelectedLead(null);
        setLeadDropdownOpen(false);
        setAssignState('idle');
        setAssignError('');
    }, []);

    const openAssignDialog = useCallback((campaign) => {
        // Ensure leads are loaded
        if ((!allLeads || allLeads.length === 0) && agent?._id && isLoggedIn) {
            dispatch(fetchLeads(agent._id, isLoggedIn));
        }
        setAssignDialogCampaign(campaign);
        setAssignDialogOpen(true);
    }, [allLeads, agent, isLoggedIn, dispatch]);

    const filteredLeads = useMemo(() => {
        if (!leadSearch.trim()) return [];
        const query = leadSearch.toLowerCase().trim();
        return (allLeads || [])
            .filter((lead) => {
                const displayName = getLeadDisplayName(lead).toLowerCase();
                const email = (lead.email || '').toLowerCase();
                return displayName.includes(query) || email.includes(query);
            })
            .slice(0, 8);
    }, [leadSearch, allLeads]);

    const checkAlreadyEnrolled = (lead, campaign) => {
        const enrolled = lead.drip_campaigns || [];
        return enrolled.some(
            (dc) => (dc.campaign?._id || dc.campaign) === campaign._id && dc.enabled
        );
    };

    const handleLeadSelect = useCallback((lead) => {
        setSelectedLead(lead);
        setLeadSearch('');
        setLeadDropdownOpen(false);
        setAssignError('');
        if (assignDialogCampaign && checkAlreadyEnrolled(lead, assignDialogCampaign)) {
            setAssignError(
                `${getLeadDisplayName(lead)} is already enrolled in "${assignDialogCampaign.name}"`
            );
        }
    }, [assignDialogCampaign]);

    const handleAssign = useCallback(async () => {
        if (!selectedLead || !assignDialogCampaign) return;
        setAssignState('loading');
        setAssignError('');
        try {
            const response = await IrgApi.post(
                '/drip-campaigns/enroll',
                { userId: selectedLead._id, campaignId: assignDialogCampaign._id },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                setAssignState('success');
                setTimeout(() => closeAssignDialog(), 800);
            }
        } catch (err) {
            setAssignState('idle');
            const message = err.response?.data?.message || '';
            if (message.toLowerCase().includes('already enrolled')) {
                setAssignError(
                    `${getLeadDisplayName(selectedLead)} is already enrolled in "${assignDialogCampaign.name}"`
                );
            } else {
                setAssignError(message || 'Something went wrong. Please try again.');
            }
        }
    }, [selectedLead, assignDialogCampaign, isLoggedIn, dispatch, closeAssignDialog]);

    // Close dialog on Escape key
    useEffect(() => {
        if (!assignDialogOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeAssignDialog();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [assignDialogOpen, closeAssignDialog]);

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
                        <h1
                            style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: 'hsl(var(--foreground))',
                                margin: 0,
                            }}
                        >
                            Drip Campaigns
                        </h1>
                        <p style={{ color: 'hsl(var(--foreground-muted))', margin: '0.5rem 0 0 0' }}>
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
                            style={{ fontSize: '3rem', color: 'hsl(var(--primary))' }}
                        />
                        <p style={{ color: 'hsl(var(--foreground-muted))', marginTop: '1rem' }}>
                            Loading campaigns...
                        </p>
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
                                        boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setPreviewCampaign(campaign)}
                                    className="drip-campaign-card"
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
                                                    color: 'hsl(var(--foreground))',
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
                                                    backgroundColor: 'hsl(var(--muted))',
                                                    color: 'hsl(var(--foreground-muted))',
                                                }}
                                            />
                                            <Chip
                                                label={`${campaign.emails?.length || 0} emails`}
                                                icon="pi pi-envelope"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    backgroundColor: 'hsl(var(--muted))',
                                                    color: 'hsl(var(--foreground-muted))',
                                                }}
                                            />
                                        </div>

                                        {campaign.created_by && (
                                            <p
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: 'hsl(var(--foreground-muted))',
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
                                                borderTop: '1px solid hsl(var(--border))',
                                                paddingTop: '1rem',
                                            }}
                                        >
                                            <Button
                                                label="Preview"
                                                icon="pi pi-eye"
                                                className="p-button-sm p-button-text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewCampaign(campaign);
                                                }}
                                            />
                                            <Button
                                                label="Edit"
                                                icon="pi pi-pencil"
                                                className="p-button-sm p-button-outlined"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/drip-campaigns/edit/${campaign._id}`);
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAssignDialog(campaign);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid hsl(var(--border))',
                                                    background: 'transparent',
                                                    color: 'hsl(var(--foreground))',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    whiteSpace: 'nowrap',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'hsl(var(--accent))';
                                                    e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                                                }}
                                            >
                                                <i className="pi pi-user-plus" style={{ fontSize: '12px' }} />
                                                Assign
                                            </button>
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
                            backgroundColor: 'hsl(var(--muted))',
                            borderRadius: '12px',
                        }}
                    >
                        <i
                            className="pi pi-send"
                            style={{
                                fontSize: '3rem',
                                color: 'hsl(var(--foreground-muted))',
                                opacity: 0.5,
                                display: 'block',
                                marginBottom: '1rem',
                            }}
                        />
                        <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
                            No campaigns yet
                        </h3>
                        <p style={{ color: 'hsl(var(--foreground-muted))', marginBottom: '1.5rem' }}>
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

            {/* Campaign Preview Dialog */}
            <CampaignPreviewDialog
                visible={!!previewCampaign}
                campaign={previewCampaign}
                onHide={() => setPreviewCampaign(null)}
            />

            {/* Assign To A Lead Dialog */}
            {assignDialogOpen && assignDialogCampaign && (
                <>
                    {/* Backdrop */}
                    <button
                        onClick={closeAssignDialog}
                        type="button"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 100,
                            backdropFilter: 'blur(2px)',
                            border: 'none',
                        }}
                        aria-label="Close assign dialog"
                    />

                    {/* Dialog */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 101,
                            width: '100%',
                            maxWidth: '480px',
                            background: 'hsl(var(--surface))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'calc(var(--radius) + 2px)',
                            padding: '28px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '20px',
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: 'hsl(var(--foreground))',
                                        margin: 0,
                                        marginBottom: '4px',
                                    }}
                                >
                                    Assign To A Lead
                                </h3>
                                <p
                                    style={{
                                        fontSize: '13px',
                                        color: 'hsl(var(--muted-foreground))',
                                        margin: 0,
                                    }}
                                >
                                    Campaign:{' '}
                                    <strong style={{ color: 'hsl(var(--foreground))' }}>
                                        {assignDialogCampaign.name}
                                    </strong>
                                </p>
                            </div>
                            <button
                                onClick={closeAssignDialog}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'hsl(var(--muted-foreground))',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius)',
                                    lineHeight: 1,
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Lead Search Input */}
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'hsl(var(--muted-foreground))',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '8px',
                                }}
                            >
                                Search Lead
                            </label>

                            {selectedLead ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        background: 'hsl(var(--muted))',
                                        border: '1px solid hsl(var(--primary))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                >
                                    <div>
                                        <span
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: 'hsl(var(--foreground))',
                                            }}
                                        >
                                            {getLeadDisplayName(selectedLead)}
                                        </span>
                                        {selectedLead.email && getLeadDisplayName(selectedLead) !== selectedLead.email && (
                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    color: 'hsl(var(--muted-foreground))',
                                                    marginLeft: '8px',
                                                }}
                                            >
                                                {selectedLead.email}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedLead(null);
                                            setAssignError('');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'hsl(var(--muted-foreground))',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '0 4px',
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={leadSearch}
                                    onChange={(e) => {
                                        setLeadSearch(e.target.value);
                                        setLeadDropdownOpen(true);
                                        setAssignError('');
                                    }}
                                    onFocus={(e) => {
                                        setLeadDropdownOpen(true);
                                        e.target.style.borderColor = 'hsl(var(--primary))';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'hsl(var(--border))';
                                        setTimeout(() => setLeadDropdownOpen(false), 150);
                                    }}
                                    placeholder="Type a name or email..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'hsl(var(--foreground))',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            )}

                            {/* Search results dropdown */}
                            {leadDropdownOpen && !selectedLead && filteredLeads.length > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        right: 0,
                                        background: 'hsl(var(--surface))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        zIndex: 10,
                                        overflow: 'hidden',
                                        maxHeight: '280px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {filteredLeads.map((lead) => (
                                        <button
                                            key={lead._id}
                                            onMouseDown={() => handleLeadSelect(lead)}
                                            type="button"
                                            style={{
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid hsl(var(--border) / 0.5)',
                                                border: 'none',
                                                background: 'transparent',
                                                width: '100%',
                                                textAlign: 'left',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background =
                                                    'hsl(var(--accent))';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: 'hsl(var(--foreground))',
                                                    display: 'block',
                                                }}
                                            >
                                                {getLeadDisplayName(lead)}
                                            </span>
                                            {lead.email && getLeadDisplayName(lead) !== lead.email && (
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        color: 'hsl(var(--muted-foreground))',
                                                    }}
                                                >
                                                    {lead.email}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No results state */}
                            {leadDropdownOpen &&
                                !selectedLead &&
                                leadSearch.trim() &&
                                filteredLeads.length === 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 4px)',
                                            left: 0,
                                            right: 0,
                                            background: 'hsl(var(--surface))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                            padding: '12px 14px',
                                            fontSize: '14px',
                                            color: 'hsl(var(--muted-foreground))',
                                            textAlign: 'center',
                                            zIndex: 10,
                                        }}
                                    >
                                        No leads found for &ldquo;{leadSearch}&rdquo;
                                    </div>
                                )}
                        </div>

                        {/* Inline error message */}
                        {assignError && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    padding: '10px 14px',
                                    background: 'hsl(var(--danger) / 0.1)',
                                    border: '1px solid hsl(var(--danger) / 0.3)',
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '16px',
                                }}
                            >
                                <i
                                    className="pi pi-exclamation-triangle"
                                    style={{
                                        flexShrink: 0,
                                        fontSize: '14px',
                                        color: 'hsl(var(--danger))',
                                        marginTop: '1px',
                                    }}
                                />
                                <p
                                    style={{
                                        fontSize: '13px',
                                        color: 'hsl(var(--danger))',
                                        margin: 0,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {assignError}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '8px',
                            }}
                        >
                            <button
                                onClick={closeAssignDialog}
                                style={{
                                    padding: '9px 20px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid hsl(var(--border))',
                                    background: 'transparent',
                                    color: 'hsl(var(--foreground))',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedLead || assignState === 'loading' || !!assignError}
                                style={{
                                    padding: '9px 24px',
                                    borderRadius: 'var(--radius)',
                                    border: 'none',
                                    background:
                                        !selectedLead || !!assignError
                                            ? 'hsl(var(--muted))'
                                            : assignState === 'success'
                                              ? 'hsl(var(--success))'
                                              : 'hsl(var(--primary))',
                                    color:
                                        !selectedLead || !!assignError
                                            ? 'hsl(var(--muted-foreground))'
                                            : '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor:
                                        !selectedLead || !!assignError ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {assignState === 'loading' && (
                                    <span
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'assign-spin 0.6s linear infinite',
                                            display: 'inline-block',
                                        }}
                                    />
                                )}
                                {assignState === 'success'
                                    ? 'Assigned!'
                                    : assignState === 'loading'
                                      ? 'Assigning...'
                                      : 'Assign Campaign'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </MainLayout>
    );
};

export default DripCampaigns;
