import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), { ssr: false });

import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const SendPropertyDialog = ({ visible, onHide, leadId, isLoggedIn, onSuccess, coBuyers = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendToCoBuyers, setSendToCoBuyers] = useState(false);

    useEffect(() => { if (visible) setSendToCoBuyers(false); }, [visible]);

    const headers = { Authorization: `Bearer ${isLoggedIn}` };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await IrgApi.get(
                `/mlsproperties/search?q=${encodeURIComponent(searchQuery.trim())}`,
                { headers },
            );
            if (response.data.status === 'success') {
                setSearchResults(response.data.data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleSelectProperty = (property) => {
        setSelectedProperty(property);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleResultKeyDown = (e, property) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectProperty(property);
        }
    };

    const handleSend = async () => {
        if (!selectedProperty || sending) return;

        setSending(true);
        try {
            const response = await IrgApi.post(
                `/users/dashboard/${leadId}/send-property`,
                {
                    propertyId: selectedProperty._id,
                    message: message.trim() || undefined,
                },
                { headers },
            );
            if (response.data.status === 'success') {
                if (sendToCoBuyers && coBuyers.length > 0) {
                    Promise.allSettled(
                        coBuyers.map((cb) =>
                            IrgApi.post(
                                `/users/dashboard/${cb._id}/send-property`,
                                { propertyId: selectedProperty._id, message: message.trim() || undefined },
                                { headers }
                            )
                        )
                    );
                }
                setSelectedProperty(null);
                setMessage('');
                onSuccess();
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to send property', 'Error');
        } finally {
            setSending(false);
        }
    };

    const handleHide = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProperty(null);
        setMessage('');
        onHide();
    };

    return (
        <Dialog
            header="Send Property to Lead"
            visible={visible}
            onHide={handleHide}
            style={{ width: '550px' }}
            modal
            draggable={false}
        >
            <div className="send-property">
                {/* Selected Property Preview */}
                {selectedProperty ? (
                    <div className="send-property__selected">
                        <div className="send-property__selected-info">
                            <strong>{selectedProperty.address}</strong>
                            {selectedProperty.unit_number && ` #${selectedProperty.unit_number}`},{' '}
                            {selectedProperty.city}, CA {selectedProperty.zip_code}
                            <div style={{ color: '#2196f3', fontWeight: 700, marginTop: '0.25rem' }}>
                                {selectedProperty.price}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                                {selectedProperty.bedrooms} Bed, {selectedProperty.bathrooms} Bath, {selectedProperty.sqft} SqFt
                            </div>
                        </div>
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-danger p-button-sm"
                            onClick={() => setSelectedProperty(null)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Search Input */}
                        <div className="send-property__search">
                            <span className="p-input-icon-left" style={{ flex: 1 }}>
                                <i className="pi pi-search" />
                                <InputText
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Search by address or MLS number..."
                                    style={{ width: '100%' }}
                                />
                            </span>
                            <Button
                                label="Search"
                                icon={searching ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
                                className="p-button-info"
                                onClick={handleSearch}
                                disabled={!searchQuery.trim() || searching}
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="send-property__results">
                                {searchResults.map((property) => (
                                    <div
                                        key={property._id}
                                        className="send-property__result"
                                        onClick={() => handleSelectProperty(property)}
                                        onKeyDown={(e) => handleResultKeyDown(e, property)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div>
                                            <strong>{property.address}</strong>
                                            {property.unit_number && ` #${property.unit_number}`},{' '}
                                            {property.city}, CA {property.zip_code}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#6c757d' }}>
                                            <span style={{ color: '#2196f3', fontWeight: 700 }}>{property.price}</span>
                                            <span>{property.bedrooms}bd / {property.bathrooms}ba</span>
                                            {property.mls_number && <span>MLS# {property.mls_number}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Message */}
                <div className="send-property__message">
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>
                        Message (optional)
                    </label>
                    <InputTextarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                        autoResize
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Co-buyer option */}
                {coBuyers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                        <input type="checkbox" id="sendToCoBuyers" checked={sendToCoBuyers} onChange={(e) => setSendToCoBuyers(e.target.checked)} />
                        <label htmlFor="sendToCoBuyers" style={{ fontSize: '13px', color: 'hsl(var(--foreground))' }}>
                            Also send to co-buyer{coBuyers.length > 1 ? 's' : ''}: <strong>{coBuyers.map((cb) => `${cb.first_name} ${cb.last_name}`).join(', ')}</strong>
                        </label>
                    </div>
                )}

                {/* Send */}
                <div className="send-property__footer">
                    <Button
                        label="Send Property"
                        icon="pi pi-send"
                        className="p-button-info"
                        onClick={handleSend}
                        disabled={!selectedProperty || sending}
                        loading={sending}
                    />
                </div>
            </div>
        </Dialog>
    );
};

SendPropertyDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    leadId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    coBuyers: PropTypes.array,
};

export default SendPropertyDialog;
