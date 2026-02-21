import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

import { clearSelectedHomes } from '../../store/actions';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });
const Editor = dynamic(() => import('primereact/editor').then((mod) => mod.Editor), { ssr: false });

const SendToLeadDialog = ({ visible, onHide }) => {
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const allLeads = useSelector((state) => state.allLeadsPage);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const dispatch = useDispatch();

    const [lead, setLead] = useState(null);
    const [subject, setSubject] = useState('Check out these properties!');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const getImage = (property) => {
        if (!property?.listing_pics) return '/No-Photo-Light-Large.jpg';
        return property.listing_pics.replace(/http:/, 'https:');
    };

    const handleLeadChange = useCallback((e) => {
        setLead(e.value);
    }, []);

    const resetForm = useCallback(() => {
        setLead(null);
        setSubject('Check out these properties!');
        setMessage('');
        setSending(false);
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
                { homes: selectedHomes, user: lead, agent, subject, message },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (res.data.status === 'success') {
                dispatch(clearSelectedHomes());
                resetForm();
                onHide();
                showToast('success', `${selectedHomes.length} properties sent to ${lead.first_name || lead.email}`, 'Email Sent!');
            }
        } catch (err) {
            console.error('Send properties error:', err); // eslint-disable-line
            showToast('error', 'Failed to send email. Please try again.', 'Error');
        } finally {
            setSending(false);
        }
    }, [lead, subject, message, selectedHomes, agent, isLoggedIn, dispatch, resetForm, onHide]);

    const leadOptionTemplate = (option) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{option.first_name} {option.last_name || ''}</span>
            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>{option.email}</span>
        </div>
    );

    const selectedLeadTemplate = (option) => {
        if (!option) return <span style={{ color: '#6c757d' }}>Select a lead...</span>;
        return <span>{option.first_name} {option.last_name || ''} ({option.email})</span>;
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
            <p style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic', margin: '0 0 0.5rem' }}>
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
