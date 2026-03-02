import { useMemo } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const AutoComplete = dynamic(
    () => import('primereact/autocomplete').then((mod) => mod.AutoComplete),
    { ssr: false },
);
const InputText = dynamic(
    () => import('primereact/inputtext').then((mod) => mod.InputText),
    { ssr: false },
);
const Editor = dynamic(
    () => import('primereact/editor').then((mod) => mod.Editor),
    { ssr: false },
);
const Dialog = dynamic(
    () => import('primereact/dialog').then((mod) => mod.Dialog),
    { ssr: false },
);
const Button = dynamic(
    () => import('primereact/button').then((mod) => mod.Button),
    { ssr: false },
);

import getLeadDisplayName from '../../../utils/getLeadDisplayName';

const EmailToLeadDialog = ({
    visible,
    onHide,
    property,
    // Lead
    leadInput,
    setLeadInput,
    leadSuggestions,
    onLeadSearch,
    selectedLead,
    onLeadSelect,
    onLeadClear,
    // Subject & body
    subject,
    onSubjectChange,
    message,
    onMessageChange,
    // Signature
    agentSignature,
    // Actions
    onSend,
    sending,
}) => {
    // ── Property image URL ─────────────────────────────────────────
    const propertyImage = useMemo(() => {
        const raw = property?.listing_pics || '';
        return raw.replace(/http:/, 'https:') || '/No-Photo-Light-Large.jpg';
    }, [property?.listing_pics]);

    // ── Lead autocomplete item template ────────────────────────────
    const leadItemTemplate = (lead) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 0' }}>
            <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))', fontSize: '0.9rem' }}>
                {getLeadDisplayName(lead)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                {lead.email || ''}
            </span>
        </div>
    );

    return (
        <Dialog
            header="Email This Property To A Lead"
            visible={visible}
            onHide={onHide}
            style={{ width: '680px', maxWidth: '95vw' }}
            modal
            draggable={false}
            blockScroll
        >
            <div className="email-dialog">
                {/* ── Property Preview Card ──────────────────────── */}
                {property && (
                    <div className="email-dialog__property-card">
                        <img
                            src={propertyImage}
                            alt={property.address || 'Property'}
                            className="email-dialog__property-img"
                        />
                        <div className="email-dialog__property-details">
                            <div className="email-dialog__property-address">
                                {property.address}
                                {property.unit_number && ` #${property.unit_number}`}
                            </div>
                            <div className="email-dialog__property-location">
                                {property.city}, {property.state || 'CA'} {property.zip_code}
                            </div>
                            <div className="email-dialog__property-meta">
                                <span><strong>{property.price}</strong></span>
                                <span>{property.bedrooms} Beds</span>
                                <span>{property.bathrooms} Baths</span>
                                <span>{property.sqft} SqFt</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Lead Search ────────────────────────────────── */}
                <div className="email-dialog__field">
                    <label className="email-dialog__label" htmlFor="email-lead-search">
                        Send To
                    </label>
                    <div className="email-dialog__lead-search">
                        <AutoComplete
                            id="email-lead-search"
                            value={leadInput}
                            suggestions={leadSuggestions}
                            completeMethod={onLeadSearch}
                            onChange={(e) => {
                                if (typeof e.value === 'string') {
                                    setLeadInput(e.value);
                                }
                            }}
                            onSelect={onLeadSelect}
                            itemTemplate={leadItemTemplate}
                            field="first_name"
                            placeholder="Search for a lead by name or email..."
                            emptyMessage="No leads found"
                            style={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                            panelStyle={{ zIndex: 1100 }}
                            delay={100}
                            minLength={0}
                            disabled={!!selectedLead}
                        />
                    </div>

                    {/* Selected lead chip */}
                    {selectedLead && (
                        <div className="email-dialog__to-chip">
                            <div className="email-dialog__to-chip-info">
                                <span className="email-dialog__to-chip-name">
                                    {getLeadDisplayName(selectedLead)}
                                </span>
                                <span className="email-dialog__to-chip-email">
                                    {selectedLead.email || 'No email'}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="email-dialog__to-chip-clear"
                                onClick={onLeadClear}
                                title="Clear selection"
                            >
                                <i className="pi pi-times" style={{ fontSize: '0.75rem' }} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Subject ────────────────────────────────────── */}
                <div className="email-dialog__field">
                    <label className="email-dialog__label" htmlFor="email-subject">
                        Subject
                    </label>
                    <InputText
                        id="email-subject"
                        value={subject}
                        onChange={onSubjectChange}
                        placeholder="Email subject"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* ── Email Body ─────────────────────────────────── */}
                <div className="email-dialog__field">
                    <label className="email-dialog__label">
                        Message
                    </label>
                    <div className="email-dialog__editor-wrap">
                        <Editor
                            style={{ height: '200px' }}
                            value={message}
                            onTextChange={(e) => onMessageChange(e.htmlValue)}
                        />
                    </div>
                </div>

                {/* ── Signature Preview ──────────────────────────── */}
                <div className="email-dialog__signature">
                    <div className="email-dialog__signature-label">
                        Your signature will be automatically appended to this email
                    </div>
                    {agentSignature ? (
                        <div
                            className="email-dialog__signature-content"
                            dangerouslySetInnerHTML={{ __html: agentSignature }}
                        />
                    ) : (
                        <p className="email-dialog__signature-empty">
                            No signature configured &mdash; add one in your profile settings.
                        </p>
                    )}
                </div>

                {/* ── Footer Buttons ─────────────────────────────── */}
                <div className="email-dialog__footer">
                    <Button
                        label="Cancel"
                        className="p-button-text"
                        onClick={onHide}
                        disabled={sending}
                    />
                    <Button
                        label={sending ? 'Sending...' : 'Send Email'}
                        icon={sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                        className="email-dialog__btn-send"
                        onClick={onSend}
                        disabled={sending || !selectedLead}
                    />
                </div>
            </div>
        </Dialog>
    );
};

EmailToLeadDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    property: PropTypes.object,
    leadInput: PropTypes.string.isRequired,
    setLeadInput: PropTypes.func.isRequired,
    leadSuggestions: PropTypes.array.isRequired,
    onLeadSearch: PropTypes.func.isRequired,
    selectedLead: PropTypes.object,
    onLeadSelect: PropTypes.func.isRequired,
    onLeadClear: PropTypes.func.isRequired,
    subject: PropTypes.string.isRequired,
    onSubjectChange: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    onMessageChange: PropTypes.func.isRequired,
    agentSignature: PropTypes.string,
    onSend: PropTypes.func.isRequired,
    sending: PropTypes.bool.isRequired,
};

export default EmailToLeadDialog;
