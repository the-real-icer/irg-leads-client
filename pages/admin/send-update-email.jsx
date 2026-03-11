// React & NextJS
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const SendUpdateEmail = () => {
    // __________________Next Router______________________\\
    const router = useRouter();

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    // __________________Local State______________________\\
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
    const [showConfirm, setShowConfirm] = useState(false);
    const [sending, setSending] = useState(false);
    const iframeRef = useRef(null);

    // __________________Access Control______________________\\
    useEffect(() => {
        if (agent && agent.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [agent, router]);

    // __________________Fetch Agents______________________\\
    const fetchAgents = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const response = await IrgApi.get('/agents/all-agents', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (response.data.status === 'success') {
                setAgents(response.data.data);
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to load agents', 'Error');
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // __________________Handlers______________________\\
    const toggleAgent = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const selectAll = () => setSelectedIds(agents.map((a) => a._id));
    const deselectAll = () => setSelectedIds([]);

    const canSend = selectedIds.length > 0 && subject.trim() && htmlContent.trim();

    const handleSend = async () => {
        setShowConfirm(false);
        setSending(true);
        try {
            const recipients = agents
                .filter((a) => selectedIds.includes(a._id))
                .map((a) => ({ name: a.name, email: a.email }));

            const response = await IrgApi.post(
                '/admin/send-update-email',
                { subject, html: htmlContent, recipients },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } },
            );

            const { sent, failed } = response.data;
            if (failed === 0) {
                showToast('success', `Email sent to ${sent} agent${sent !== 1 ? 's' : ''} successfully`, 'Success');
            } else {
                showToast('warn', `${sent} sent, ${failed} failed`, 'Partial Success');
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to send email', 'Error');
        } finally {
            setSending(false);
        }
    };

    const refreshPreview = () => {
        if (iframeRef.current) {
            iframeRef.current.srcdoc = htmlContent;
        }
    };

    // __________________Render Guard______________________\\
    if (agent && agent.role !== 'admin') return null;

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'hsl(var(--foreground))',
                        marginBottom: '0.5rem',
                    }}>
                        Send Update Email
                    </h1>
                    <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.95rem' }}>
                        Send an HTML email to selected agents
                    </p>
                </div>

                {/* Section 1: Recipient Selection */}
                <div style={{
                    background: 'hsl(var(--surface))',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>
                                Recipients
                            </h3>
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                                {selectedIds.length} of {agents.length} agents selected
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                label="Select All"
                                className="p-button-outlined p-button-sm"
                                onClick={selectAll}
                                disabled={loading}
                            />
                            <Button
                                label="Deselect All"
                                className="p-button-outlined p-button-secondary p-button-sm"
                                onClick={deselectAll}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--foreground-muted))' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                            <p style={{ marginTop: '0.5rem' }}>Loading agents...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {agents.map((a) => {
                                const isSelected = selectedIds.includes(a._id);
                                return (
                                    <button
                                        key={a._id}
                                        onClick={() => toggleAgent(a._id)}
                                        type="button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            border: `2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                                            background: isSelected ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                                            transition: 'all 0.15s ease',
                                            userSelect: 'none',
                                        }}
                                    >
                                        {a.image ? (
                                            <img
                                                src={a.image}
                                                alt={a.name}
                                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'hsl(var(--primary) / 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: 'hsl(var(--primary))',
                                            }}>
                                                {a.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: isSelected ? '600' : '400',
                                            color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                        }}>
                                            {a.name}
                                        </span>
                                        {isSelected && (
                                            <i className="pi pi-check" style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))' }}></i>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section 2: Subject Line */}
                <div style={{
                    background: 'hsl(var(--surface))',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: '0 0 0.75rem 0' }}>
                        Subject
                    </h3>
                    <InputText
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Section 3: HTML Editor / Preview */}
                <div style={{
                    background: 'hsl(var(--surface))',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>
                            Email Body
                        </h3>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <Button
                                label="Edit"
                                icon="pi pi-pencil"
                                className={activeTab === 'edit' ? 'p-button-sm' : 'p-button-outlined p-button-sm'}
                                onClick={() => setActiveTab('edit')}
                            />
                            <Button
                                label="Preview"
                                icon="pi pi-eye"
                                className={activeTab === 'preview' ? 'p-button-sm' : 'p-button-outlined p-button-sm'}
                                onClick={() => setActiveTab('preview')}
                            />
                        </div>
                    </div>

                    {activeTab === 'edit' ? (
                        <InputTextarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            placeholder="Paste your HTML email here..."
                            rows={20}
                            style={{
                                width: '100%',
                                minHeight: '400px',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                            }}
                        />
                    ) : (
                        <div>
                            <div style={{ marginBottom: '0.75rem', textAlign: 'right' }}>
                                <Button
                                    label="Refresh Preview"
                                    icon="pi pi-refresh"
                                    className="p-button-outlined p-button-sm"
                                    onClick={refreshPreview}
                                />
                            </div>
                            <iframe
                                ref={iframeRef}
                                srcDoc={htmlContent || '<p style="color:#999;text-align:center;padding:2rem;">No HTML content to preview</p>'}
                                style={{
                                    width: '100%',
                                    minHeight: '500px',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    background: '#fff',
                                }}
                                title="Email Preview"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    )}
                </div>

                {/* Section 4: Send Button */}
                <div style={{ textAlign: 'right' }}>
                    <Button
                        label={sending ? 'Sending...' : `Send Email to ${selectedIds.length} Agent${selectedIds.length !== 1 ? 's' : ''}`}
                        icon={sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                        className="p-button-success"
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '600' }}
                        disabled={!canSend || sending}
                        onClick={() => setShowConfirm(true)}
                    />
                </div>

                {/* Confirmation Dialog */}
                <Dialog
                    header="Confirm Send"
                    visible={showConfirm}
                    onHide={() => setShowConfirm(false)}
                    style={{ width: '450px' }}
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <Button
                                label="Cancel"
                                className="p-button-text"
                                onClick={() => setShowConfirm(false)}
                            />
                            <Button
                                label="Confirm"
                                icon="pi pi-send"
                                className="p-button-success"
                                onClick={handleSend}
                            />
                        </div>
                    }
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'hsl(var(--warning))' }}></i>
                        <span style={{ color: 'hsl(var(--foreground))' }}>
                            Send to {selectedIds.length} agent{selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.
                        </span>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default SendUpdateEmail;
