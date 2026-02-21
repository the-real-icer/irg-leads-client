import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import AgentPropertyCard from './AgentPropertyCard';
import AgentNotesPanel from './AgentNotesPanel';
import SendPropertyDialog from './SendPropertyDialog';

const LeadDashboard = ({ leadId, isLoggedIn }) => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [summary, setSummary] = useState({ total: 0, liked: 0, maybe: 0, discarded: 0, pending_showings: 0 });

    // Notes panel state
    const [notesVisible, setNotesVisible] = useState(false);
    const [notesDelivery, setNotesDelivery] = useState(null);

    // Send property dialog state
    const [sendVisible, setSendVisible] = useState(false);

    const headers = { Authorization: `Bearer ${isLoggedIn}` };

    const fetchDeliveries = useCallback(async (pg = 1) => {
        setLoading(true);
        try {
            const response = await IrgApi.get(`/users/dashboard/${leadId}/properties?page=${pg}&limit=24`, { headers });
            if (response.data.status === 'success') {
                setDeliveries(response.data.data);
                setTotalPages(response.data.totalPages);
                setPage(response.data.page);
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    }, [leadId, isLoggedIn]); // eslint-disable-line

    const fetchSummary = useCallback(async () => {
        try {
            const response = await IrgApi.get(`/users/dashboard/${leadId}/summary`, { headers });
            if (response.data.status === 'success') {
                setSummary(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    }, [leadId, isLoggedIn]); // eslint-disable-line

    useEffect(() => {
        if (leadId && isLoggedIn) {
            fetchDeliveries(1);
            fetchSummary();
        }
    }, [leadId, isLoggedIn]); // eslint-disable-line

    const handleOpenNotes = (delivery) => {
        setNotesDelivery(delivery);
        setNotesVisible(true);
    };

    const handleShowingAction = async (requestId, status) => {
        try {
            const response = await IrgApi.patch(
                `/users/dashboard/showing-requests/${requestId}`,
                { status },
                { headers },
            );
            if (response.data.status === 'success') {
                showToast('success', `Showing ${status}`, 'Updated');
                fetchDeliveries(page);
                fetchSummary();
            }
        } catch (error) {
            console.error('Error updating showing request:', error);
            showToast('error', 'Failed to update showing request', 'Error');
        }
    };

    const handlePropertySent = () => {
        setSendVisible(false);
        fetchDeliveries(1);
        fetchSummary();
        showToast('success', 'Property sent to lead', 'Success');
    };

    const statCards = [
        { label: 'Total Sent', value: summary.total, icon: 'pi pi-send', color: '#667eea' },
        { label: 'Liked', value: summary.liked, icon: 'pi pi-heart-fill', color: '#e74c3c' },
        { label: 'Maybe', value: summary.maybe, icon: 'pi pi-question-circle', color: '#f59e0b' },
        { label: 'Discarded', value: summary.discarded, icon: 'pi pi-times-circle', color: '#6c757d' },
        { label: 'Pending Showings', value: summary.pending_showings, icon: 'pi pi-calendar', color: '#2196f3' },
    ];

    return (
        <div className="lead-dashboard">
            {/* Summary Stats */}
            <div className="lead-dashboard__stats">
                {statCards.map((stat) => (
                    <div key={stat.label} className="lead-dashboard__stat">
                        <i className={`${stat.icon} lead-dashboard__stat-icon`} style={{ color: stat.color }}></i>
                        <div className="lead-dashboard__stat-info">
                            <span className="lead-dashboard__stat-value">{stat.value}</span>
                            <span className="lead-dashboard__stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="lead-dashboard__actions">
                <Button
                    label="Send Property"
                    icon="pi pi-send"
                    className="p-button-rounded p-button-info"
                    onClick={() => setSendVisible(true)}
                />
                <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    className="p-button-rounded p-button-text"
                    onClick={() => { fetchDeliveries(page); fetchSummary(); }}
                />
            </div>

            {/* Property Grid */}
            {loading ? (
                <div className="lead-dashboard__loading">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <p>Loading properties...</p>
                </div>
            ) : deliveries.length > 0 ? (
                <>
                    <div className="lead-dashboard__grid">
                        {deliveries.map((delivery) => (
                            <AgentPropertyCard
                                key={delivery._id}
                                delivery={delivery}
                                onOpenNotes={() => handleOpenNotes(delivery)}
                                onShowingAction={handleShowingAction}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="lead-dashboard__pagination">
                            <Button
                                icon="pi pi-chevron-left"
                                className="p-button-text p-button-sm"
                                disabled={page <= 1}
                                onClick={() => fetchDeliveries(page - 1)}
                            />
                            <span className="lead-dashboard__page-info">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                icon="pi pi-chevron-right"
                                className="p-button-text p-button-sm"
                                disabled={page >= totalPages}
                                onClick={() => fetchDeliveries(page + 1)}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="lead-dashboard__empty">
                    <i className="pi pi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p style={{ fontSize: '1.1rem', color: '#6c757d', marginTop: '1rem' }}>
                        No properties have been sent to this lead yet.
                    </p>
                    <Button
                        label="Send First Property"
                        icon="pi pi-send"
                        className="p-button-rounded p-button-info"
                        style={{ marginTop: '1rem' }}
                        onClick={() => setSendVisible(true)}
                    />
                </div>
            )}

            {/* Notes Panel */}
            <AgentNotesPanel
                visible={notesVisible}
                onHide={() => { setNotesVisible(false); setNotesDelivery(null); }}
                delivery={notesDelivery}
                leadId={leadId}
                isLoggedIn={isLoggedIn}
                onNoteCreated={() => fetchDeliveries(page)}
            />

            {/* Send Property Dialog */}
            <SendPropertyDialog
                visible={sendVisible}
                onHide={() => setSendVisible(false)}
                leadId={leadId}
                isLoggedIn={isLoggedIn}
                onSuccess={handlePropertySent}
            />
        </div>
    );
};

LeadDashboard.propTypes = {
    leadId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.string.isRequired,
};

export default LeadDashboard;
