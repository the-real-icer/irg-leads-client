import { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import EmailToLeadDialog from './EmailToLeadDialog';
import IrgApi from '../../../assets/irgApi';
import showToast from '../../../utils/showToast';
import getLeadDisplayName from '../../../utils/getLeadDisplayName';

const UserActions = ({ property }) => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const allLeads = useSelector((state) => state.allLeadsPage?.leads);

    // ── Dialog state ───────────────────────────────────────────────
    const [showDialog, setShowDialog] = useState(false);
    const [sending, setSending] = useState(false);

    // ── Lead search state ──────────────────────────────────────────
    const [leadInput, setLeadInput] = useState('');
    const [leadSuggestions, setLeadSuggestions] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);

    // ── Email content state ────────────────────────────────────────
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // ── Fallback leads (if Redux store is empty) ───────────────────
    const [localLeads, setLocalLeads] = useState(null);

    const leads = useMemo(() => allLeads || localLeads || [], [allLeads, localLeads]);

    // ── Fetch leads if Redux store is empty when dialog opens ──────
    useEffect(() => {
        if (!showDialog || !isLoggedIn) return;
        if (allLeads?.length > 0) return; // Already have leads from Redux
        if (localLeads !== null) return; // Already fetched

        const fetchLeads = async () => {
            try {
                const res = await IrgApi.post(
                    '/users/get-agent-users',
                    {},
                    { headers: { Authorization: `Bearer ${isLoggedIn}` } },
                );
                if (res.data.status === 'success') {
                    setLocalLeads(res.data.data || []);
                }
            } catch {
                setLocalLeads([]);
            }
        };
        fetchLeads();
    }, [showDialog, isLoggedIn, allLeads, localLeads]);

    // ── Build default email content ────────────────────────────────
    const buildDefaults = useCallback(() => {
        const addr = property?.address || '';
        const city = property?.city || '';
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';

        setSubject(`Check out this property — ${addr}${unitNum}, ${city}`);
        setMessage(
            `<p>Hi,</p>` +
            `<p>I found a property I think you'll love! Take a look:</p>` +
            `<p><strong>${addr}${unitNum}, ${city}, ${property?.state || 'CA'} ${property?.zip_code || ''}</strong><br/>` +
            `${property?.price || ''} — ${property?.bedrooms || 0} Beds, ${property?.bathrooms || 0} Baths, ${property?.sqft || 0} SqFt</p>`,
        );
    }, [property]);

    // ── Open dialog ────────────────────────────────────────────────
    const handleEmailClick = useCallback(() => {
        buildDefaults();
        setSelectedLead(null);
        setLeadInput('');
        setLeadSuggestions([]);
        setShowDialog(true);
    }, [buildDefaults]);

    // ── Close dialog ───────────────────────────────────────────────
    const handleHide = useCallback(() => {
        if (!sending) setShowDialog(false);
    }, [sending]);

    // ── Lead search (client-side filter) ───────────────────────────
    const handleLeadSearch = useCallback(
        (event) => {
            const query = (event.query || '').toLowerCase().trim();
            if (!query) {
                // Show recent leads when empty
                setLeadSuggestions(leads.slice(0, 8));
                return;
            }
            const filtered = leads.filter((lead) => {
                const displayName = getLeadDisplayName(lead).toLowerCase();
                const email = (lead.email || '').toLowerCase();
                return displayName.includes(query) || email.includes(query);
            });
            setLeadSuggestions(filtered.slice(0, 10));
        },
        [leads],
    );

    // ── Lead select ────────────────────────────────────────────────
    const handleLeadSelect = useCallback(
        (e) => {
            const lead = e.value;
            if (lead && lead._id) {
                setSelectedLead(lead);
                setLeadInput(getLeadDisplayName(lead));

                // Update the default body with the lead's first name
                const firstName = lead.first_name?.trim() || '';
                if (firstName) {
                    const addr = property?.address || '';
                    const city = property?.city || '';
                    const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
                    setMessage(
                        `<p>Hi ${firstName},</p>` +
                        `<p>I found a property I think you'll love! Take a look:</p>` +
                        `<p><strong>${addr}${unitNum}, ${city}, ${property?.state || 'CA'} ${property?.zip_code || ''}</strong><br/>` +
                        `${property?.price || ''} — ${property?.bedrooms || 0} Beds, ${property?.bathrooms || 0} Baths, ${property?.sqft || 0} SqFt</p>`,
                    );
                }
            }
        },
        [property],
    );

    // ── Clear lead ─────────────────────────────────────────────────
    const handleLeadClear = useCallback(() => {
        setSelectedLead(null);
        setLeadInput('');
    }, []);

    // ── Send email ─────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!selectedLead || !selectedLead.email) {
            showToast('error', 'Please select a lead with a valid email address', 'Validation Error');
            return;
        }

        try {
            setSending(true);
            const res = await IrgApi.post(
                '/users/send-one-property',
                {
                    user: selectedLead,
                    agent,
                    message,
                    subject,
                    home: property,
                },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (res.data.status === 'success') {
                showToast('success', 'Email sent successfully!', 'Email Sent');
                setSelectedLead(null);
                setLeadInput('');
                setMessage('');
                setSubject('');
                setShowDialog(false);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send email. Please try again.';
            showToast('error', msg, 'Error');
        } finally {
            setSending(false);
        }
    }, [selectedLead, agent, message, subject, property, isLoggedIn]);

    return (
        <>
            <EmailToLeadDialog
                visible={showDialog}
                onHide={handleHide}
                property={property}
                leadInput={leadInput}
                setLeadInput={setLeadInput}
                leadSuggestions={leadSuggestions}
                onLeadSearch={handleLeadSearch}
                selectedLead={selectedLead}
                onLeadSelect={handleLeadSelect}
                onLeadClear={handleLeadClear}
                subject={subject}
                onSubjectChange={(e) => setSubject(e.target.value)}
                message={message}
                onMessageChange={setMessage}
                agentSignature={agent?.email_signature || ''}
                onSend={handleSend}
                sending={sending}
            />
            <button
                className="property__action-btn property__action-btn--primary-filled"
                onClick={handleEmailClick}
                type="button"
            >
                <i className="pi pi-envelope" />
                Email to Client
            </button>
        </>
    );
};

UserActions.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        mls_number: PropTypes.string.isRequired,
    }).isRequired,
};

export default UserActions;
