import { useState, useEffect, useRef } from 'react';
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
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendToCoBuyers, setSendToCoBuyers] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => () => {
        mountedRef.current = false;
    }, []);

    useEffect(() => {
        if (visible) {
            setSubject('');
            setMessage('');
            setSendToCoBuyers(false);
        }
    }, [visible]);

    useEffect(() => {
        if (selectedProperty) {
            setSubject(`Check out this property — ${selectedProperty.address || ''}`);
        }
    }, [selectedProperty]);

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
            const requestedRecipients = [
                { id: leadId, label: 'lead' },
                ...(sendToCoBuyers && coBuyers.length > 0
                    ? coBuyers.map((cb) => ({
                        id: cb._id,
                        label: `${cb.first_name} ${cb.last_name}`.trim() || 'co-buyer',
                    }))
                    : []),
            ];
            const payload = {
                propertyId: selectedProperty._id,
                message: message.trim() || undefined,
                subject: subject.trim() || undefined,
                coBuyerIds: requestedRecipients
                    .filter((recipient) => recipient.id !== leadId)
                    .map((recipient) => recipient.id),
            };
            const response = await IrgApi.post(
                `/users/dashboard/${leadId}/send-property`,
                payload,
                { headers },
            );
            const resultRows = response.data?.data?.results || [];
            const recipientLabelMap = new Map(requestedRecipients.map((recipient) => [recipient.id, recipient.label]));
            const failedRecipients = resultRows.filter((result) => result.status !== 'success');
            const succeededCount = resultRows.filter((result) => result.status === 'success').length;
            const failedRecipientLabels = failedRecipients.map((result) => recipientLabelMap.get(result.recipientId) || 'recipient');

            if (resultRows.length === 0) {
                throw new Error('Failed to send property');
            }

            if (failedRecipients.length === 0) {
                if (mountedRef.current) {
                    setSelectedProperty(null);
                    setMessage('');
                    onSuccess();
                    showToast(
                        'success',
                        requestedRecipients.length > 1
                            ? `Property sent to lead and ${requestedRecipients.length - 1} co-buyer${requestedRecipients.length - 1 > 1 ? 's' : ''}`
                            : 'Property sent to lead',
                        'Success',
                    );
                }
                return;
            }

            if (succeededCount > 0) {
                if (mountedRef.current) {
                    setSelectedProperty(null);
                    setMessage('');
                    onSuccess();
                    showToast(
                        'warn',
                        `Property sent to ${succeededCount} of ${resultRows.length} recipients. Failed: ${failedRecipientLabels.join(', ')}.`,
                        'Partial Success',
                    );
                }
                return;
            }

            throw new Error(`Failed to send property to ${failedRecipientLabels.join(', ')}`);
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message || 'Failed to send property', 'Error');
        } finally {
            if (mountedRef.current) {
                setSending(false);
            }
        }
    };

    const handleHide = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProperty(null);
        setSubject('');
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

                {/* Subject */}
                <div className="send-property__message">
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>
                        Subject
                    </label>
                    <InputText
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject line"
                        maxLength={150}
                        style={{ width: '100%' }}
                    />
                </div>

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
                    <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', marginBottom: 0 }}>
                        <i className="pi pi-info-circle" style={{ fontSize: '12px', flexShrink: 0 }} />
                        Your saved email signature will be added automatically.
                    </p>
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
