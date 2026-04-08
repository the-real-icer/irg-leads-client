import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

import { clearSelectedHomes } from '../../store/actions';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import getLeadDisplayName from '../../utils/getLeadDisplayName';
import { usePropertyFallbackImage } from '../../utils/propertyImageFallback';
import ikUrl from '../../utils/imageKit';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });
const Editor = dynamic(() => import('primereact/editor').then((mod) => mod.Editor), { ssr: false });

const SendToLeadDialog = ({ visible, onHide }) => {
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const dispatch = useDispatch();
    const fallbackImage = usePropertyFallbackImage();

    const [lead, setLead] = useState(null);
    const [subject, setSubject] = useState('Check out these properties!');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendToCoBuyers, setSendToCoBuyers] = useState(false);

    const coBuyers = useMemo(() => lead?.co_buyers || [], [lead?.co_buyers]);

    const getImage = (property) => {
        if (!property?.listing_pics) return fallbackImage;
        return ikUrl(property.listing_pics.replace(/http:/, 'https:'));
    };

    const handleLeadChange = useCallback((e) => {
        setLead(e.value);
        setSendToCoBuyers(false);
    }, []);

    const resetForm = useCallback(() => {
        setLead(null);
        setSubject('Check out these properties!');
        setMessage('');
        setSending(false);
        setSendToCoBuyers(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onHide();
    }, [resetForm, onHide]);

    const handleSend = useCallback(async () => {
        if (!lead) {
            showToast('warn', 'Please select a lead', 'Missing Lead');
            return;
        }
        if (!subject.trim()) {
            showToast('warn', 'Please enter a subject line', 'Missing Subject');
            return;
        }
        if (selectedHomes.length === 0) {
            showToast('warn', 'No properties in queue', 'Empty Queue');
            return;
        }

        setSending(true);
        try {
            const res = await IrgApi.post(
                '/users/send-many-properties',
                {
                    homes: selectedHomes,
                    user: lead,
                    agent,
                    subject,
                    message,
                    coBuyerIds: sendToCoBuyers && coBuyers.length > 0 ? coBuyers.map((cb) => cb._id) : [],
                },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const resultRows = res.data?.data?.results || [];
            const succeededCount = resultRows.filter((result) => result.status === 'success').length;
            const failedCount = resultRows.length - succeededCount;

            if (res.data.status === 'success' && resultRows.length > 0 && failedCount === 0) {
                dispatch(clearSelectedHomes());
                resetForm();
                onHide();
                showToast('success', `${selectedHomes.length} properties sent to ${getLeadDisplayName(lead)}`, 'Email Sent!');
            } else if (res.data.status === 'success' && succeededCount > 0) {
                showToast('warn', `Properties sent to ${succeededCount} of ${resultRows.length} recipients.`, 'Partial Success');
            } else {
                throw new Error('Failed to send properties. Please try again.');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || err.message || 'Failed to send email. Please try again.', 'Error');
        } finally {
            setSending(false);
        }
    }, [lead, subject, message, selectedHomes, agent, isLoggedIn, dispatch, resetForm, onHide, coBuyers, sendToCoBuyers]);

    const leadOptionTemplate = (option) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{getLeadDisplayName(option)}</span>
            {option.email && getLeadDisplayName(option) !== option.email && (
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{option.email}</span>
            )}
        </div>
    );

    const selectedLeadTemplate = (option) => {
        if (!option) return <span style={{ color: 'hsl(var(--muted-foreground))' }}>Select a lead...</span>;
        return <span>{getLeadDisplayName(option)} ({option.email})</span>;
    };

    return (
        <Dialog
            header={`Send ${selectedHomes.length} ${selectedHomes.length === 1 ? 'Property' : 'Properties'} to Lead`}
            visible={visible}
            onHide={handleClose}
            style={{ width: '50rem' }}
            className="property-queue__send-dialog"
            draggable={false}
        >
            {/* Property Preview */}
            <div className="property-queue__preview">
                {selectedHomes.slice(0, 6).map((property) => (
                    <img
                        key={property.mls_number}
                        src={getImage(property)}
                        alt={property.address}
                        className="property-queue__preview-thumb"
                        onError={(e) => {
                            if (e.currentTarget.src !== fallbackImage) {
                                e.currentTarget.src = fallbackImage;
                            }
                        }}
                    />
                ))}
                {selectedHomes.length > 6 && (
                    <span className="property-queue__preview-count">
                        +{selectedHomes.length - 6} more
                    </span>
                )}
                <span className="property-queue__preview-count">
                    {selectedHomes.length} {selectedHomes.length === 1 ? 'property' : 'properties'}
                </span>
            </div>

            {/* Lead Selector */}
            <div className="property-queue__field">
                <label htmlFor="queue-lead-select">Select a Lead</label>
                <Dropdown
                    id="queue-lead-select"
                    value={lead}
                    options={allLeads}
                    onChange={handleLeadChange}
                    filter
                    showClear
                    filterBy="first_name,email"
                    optionLabel="first_name"
                    valueTemplate={selectedLeadTemplate}
                    itemTemplate={leadOptionTemplate}
                    placeholder="Select a lead..."
                    style={{ width: '100%' }}
                />
            </div>

            {/* Co-buyer option */}
            {coBuyers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 0 0.5rem' }}>
                    <input type="checkbox" id="sendQueueToCoBuyers" checked={sendToCoBuyers} onChange={(e) => setSendToCoBuyers(e.target.checked)} />
                    <label htmlFor="sendQueueToCoBuyers" style={{ fontSize: '13px', color: 'hsl(var(--foreground))' }}>
                        Also send to co-buyer{coBuyers.length > 1 ? 's' : ''}: <strong>{coBuyers.map((cb) => `${cb.first_name} ${cb.last_name}`).join(', ')}</strong>
                    </label>
                </div>
            )}

            {/* Subject */}
            <div className="property-queue__field">
                <label htmlFor="queue-subject">Subject</label>
                <InputText
                    id="queue-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject line"
                    style={{ width: '100%', fontSize: '1rem' }}
                />
            </div>

            {/* Message */}
            <div className="property-queue__field">
                <label>Message (optional)</label>
                <Editor
                    style={{ height: '200px' }}
                    value={message}
                    onTextChange={(e) => setMessage(e.htmlValue)}
                />
            </div>

            {/* Info note */}
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', margin: '0 0 0.5rem' }}>
                Your queued properties and agent signature will be automatically included in the email.
            </p>

            {/* Actions */}
            <div className="property-queue__send-actions">
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-outlined p-button-secondary"
                    onClick={handleClose}
                    disabled={sending}
                />
                <Button
                    label={sending ? 'Sending...' : 'Send Email'}
                    icon={sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                    className="p-button-primary"
                    onClick={handleSend}
                    disabled={sending || !lead || selectedHomes.length === 0}
                />
            </div>
        </Dialog>
    );
};

export default SendToLeadDialog;
