// React & NextJS
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';

import 'react-quill-new/dist/quill.snow.css';

const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

// Components
import MainLayout from '../../components/layout/MainLayout';
import GoogleConnectButton from '../../components/GoogleConnectButton';

// IRG API
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const quillFormats = [
    'header', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link', 'image',
];

const Profile = () => {
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const dispatch = useDispatch();

    const [emailSignature, setEmailSignature] = useState('');
    const [savingSignature, setSavingSignature] = useState(false);

    // Custom image handler — opens file picker and embeds as base64
    // instead of Quill's default URL prompt (which leads to broken images when URLs expire).
    // Must be a regular function (not arrow) so Quill binds `this.quill` correctly.
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                [{ size: ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ align: [] }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: {
                image() {
                    const quill = this.quill;
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();
                    input.onchange = () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                            showToast('warn', 'Image must be under 2MB', 'Too Large');
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                            const range = quill.getSelection(true);
                            quill.insertEmbed(range.index, 'image', reader.result);
                            quill.setSelection(range.index + 1);
                        };
                        reader.readAsDataURL(file);
                    };
                },
            },
        },
    }), []);

    useEffect(() => {
        if (agent?.email_signature) {
            setEmailSignature(agent.email_signature);
        }
    }, [agent?.email_signature]);

    const handleSaveSignature = async () => {
        setSavingSignature(true);
        try {
            const response = await IrgApi.patch(
                `/agents/${agent._id}`,
                { email_signature: emailSignature },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                dispatch({ type: 'ADD_AGENT', payload: { ...agent, email_signature: emailSignature } });
                showToast('success', 'Email signature saved', 'Success');
            }
        } catch (error) {
            showToast('error', 'Failed to save email signature', 'Error');
        } finally {
            setSavingSignature(false);
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '0.5rem',
                    }}>
                        Agent Settings
                    </h1>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                        Manage your integrations and preferences
                    </p>
                </div>

                {/* Agent Info */}
                <div style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '1rem' }}>
                        Profile Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Name</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Email</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Phone</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.phone || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>DRE License</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.dre_license || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Email Signature */}
                <div style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
                                Email Signature
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: '0.25rem 0 0 0' }}>
                                This signature will be included in drip campaign emails sent on your behalf
                            </p>
                        </div>
                        <Button
                            label={savingSignature ? 'Saving...' : 'Save Signature'}
                            icon="pi pi-save"
                            className="p-button-primary"
                            onClick={handleSaveSignature}
                            loading={savingSignature}
                            style={{ padding: '0.6rem 1.25rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                        />
                    </div>

                    <ReactQuill
                        theme="snow"
                        value={emailSignature}
                        onChange={setEmailSignature}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Create your email signature... (e.g., name, title, phone, company)"
                        style={{ minHeight: '200px', marginBottom: '1.5rem' }}
                    />

                    {/* Signature Preview */}
                    {emailSignature && emailSignature !== '<p><br></p>' && (
                        <div>
                            <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '0.75rem',
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: '1rem'
                            }}>
                                Preview
                            </h4>
                            <div
                                style={{
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailSignature, { ADD_DATA_URI_TAGS: ['img'] }) }}
                            />
                        </div>
                    )}
                </div>

                {/* Google Integration */}
                <GoogleConnectButton />
            </div>
        </MainLayout>
    );
};

export default Profile;
