import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import DOMPurify from 'isomorphic-dompurify';

import 'react-quill-new/dist/quill.snow.css';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

import MainLayout from '../../../components/layout/MainLayout';
import IrgApi from '../../../assets/irgApi';
import showToast from '../../../utils/showToast';

const typeOptions = [
    { label: 'Buyer', value: 'Buyer' },
    { label: 'Seller', value: 'Seller' },
    { label: 'Both', value: 'Both' },
];

const timeframeOptions = [
    { label: '30 days', value: '30 days' },
    { label: '60 days', value: '60 days' },
    { label: '90 days', value: '90 days' },
    { label: '3-6 months', value: '3-6 months' },
    { label: '6 months - 1 year', value: '6 months - 1 year' },
    { label: 'Long-term', value: 'long-term' },
];

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
    ],
};

const quillFormats = [
    'header', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link',
];

const EditDripCampaign = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const router = useRouter();
    const { id } = router.query;
    const quillRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    // Step 1: Campaign details
    const [campaignInfo, setCampaignInfo] = useState({
        name: '',
        type: null,
        timeframe: null,
        is_shared: true,
    });

    // Step 2: Emails
    const [emails, setEmails] = useState([]);
    const [currentEmail, setCurrentEmail] = useState({
        subject: '',
        body: '',
        dayNumber: '',
    });
    const [editingIndex, setEditingIndex] = useState(null);

    // Fetch campaign data
    useEffect(() => {
        const fetchCampaign = async () => {
            if (!id || !isLoggedIn) return;
            try {
                const response = await IrgApi.get(`/drip-campaigns/${id}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (response.data.status === 'success') {
                    const campaign = response.data.data;
                    setCampaignInfo({
                        name: campaign.name,
                        type: campaign.type,
                        timeframe: campaign.timeframe,
                        is_shared: campaign.is_shared,
                    });
                    setEmails(
                        (campaign.emails || []).map((e) => ({
                            subject: e.subject,
                            body: e.body,
                            dayNumber: e.dayNumber,
                        }))
                    );
                }
            } catch (error) {
                showToast('error', 'Failed to load campaign', 'Error');
                router.push('/drip-campaigns');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id, isLoggedIn]); // eslint-disable-line

    const insertSubjectVariable = (variable) => {
        setCurrentEmail((prev) => ({
            ...prev,
            subject: prev.subject + variable,
        }));
    };

    const insertBodyVariable = (variable) => {
        const editor = quillRef.current?.getEditor?.();
        if (editor) {
            const range = editor.getSelection(true);
            const position = range ? range.index : editor.getLength() - 1;
            editor.insertText(position, variable);
            editor.setSelection(position + variable.length);
        } else {
            // Fallback if editor ref not ready
            setCurrentEmail((prev) => ({
                ...prev,
                body: prev.body + variable,
            }));
        }
    };

    const handleAddEmail = () => {
        if (!currentEmail.dayNumber || !currentEmail.subject.trim()) {
            showToast('warn', 'Day number and subject are required', 'Missing Information');
            return;
        }

        const strippedBody = currentEmail.body.replace(/<[^>]*>/g, '').trim();
        if (!strippedBody) {
            showToast('warn', 'Please enter email body content', 'Missing Information');
            return;
        }

        const emailEntry = {
            subject: currentEmail.subject,
            body: currentEmail.body,
            dayNumber: parseInt(currentEmail.dayNumber, 10),
        };

        if (editingIndex !== null) {
            setEmails((prev) => prev.map((e, i) => (i === editingIndex ? emailEntry : e)));
            setEditingIndex(null);
        } else {
            setEmails((prev) => [...prev, emailEntry]);
        }

        setCurrentEmail({ subject: '', body: '', dayNumber: '' });
    };

    const handleEditEmail = (index) => {
        const email = emails[index];
        setCurrentEmail({
            subject: email.subject,
            body: email.body,
            dayNumber: email.dayNumber.toString(),
        });
        setEditingIndex(index);
    };

    const handleRemoveEmail = (index) => {
        setEmails((prev) => prev.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setCurrentEmail({ subject: '', body: '', dayNumber: '' });
        }
    };

    const handleSubmit = async () => {
        if (emails.length === 0) {
            showToast('warn', 'Please add at least one email to the campaign', 'No Emails');
            return;
        }

        setSaving(true);
        try {
            const response = await IrgApi.patch(
                `/drip-campaigns/${id}`,
                {
                    campaign: {
                        name: campaignInfo.name,
                        type: campaignInfo.type,
                        timeframe: campaignInfo.timeframe,
                        is_shared: campaignInfo.is_shared,
                        emails: emails.sort((a, b) => a.dayNumber - b.dayNumber),
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Campaign updated successfully', 'Success');
                router.push('/drip-campaigns');
            }
        } catch (error) {
            showToast(
                'error',
                error.response?.data?.message || 'Failed to update campaign',
                'Error'
            );
        } finally {
            setSaving(false);
        }
    };

    const canProceedStep1 =
        campaignInfo.name.trim() && campaignInfo.type && campaignInfo.timeframe;

    if (loading) {
        return (
            <MainLayout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <i
                        className="pi pi-spin pi-spinner"
                        style={{ fontSize: '3rem', color: '#667eea' }}
                    />
                    <p style={{ color: '#6c757d', marginTop: '1rem' }}>Loading campaign...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Button
                        label="Back to Campaigns"
                        icon="pi pi-arrow-left"
                        className="p-button-text"
                        onClick={() => router.push('/drip-campaigns')}
                        style={{ marginBottom: '1rem' }}
                    />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                        Edit Drip Campaign
                    </h1>
                </div>

                {/* Step Indicator */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginBottom: '2rem',
                    }}
                >
                    {[
                        { num: 1, label: 'Campaign Details' },
                        { num: 2, label: 'Edit Emails' },
                        { num: 3, label: 'Review & Save' },
                    ].map((s) => (
                        <div
                            key={s.num}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: step >= s.num ? 1 : 0.4,
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: step >= s.num ? '#667eea' : '#dee2e6',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {step > s.num ? <i className="pi pi-check" /> : s.num}
                            </div>
                            <span style={{ fontWeight: '600', color: '#495057' }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Campaign Details */}
                {step === 1 && (
                    <Card
                        style={{
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#2c3e50',
                                marginBottom: '1.5rem',
                            }}
                        >
                            Campaign Details
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        color: '#495057',
                                    }}
                                >
                                    Campaign Type *
                                </label>
                                <Dropdown
                                    value={campaignInfo.type}
                                    options={typeOptions}
                                    onChange={(e) =>
                                        setCampaignInfo((prev) => ({ ...prev, type: e.value }))
                                    }
                                    placeholder="Select campaign type"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        color: '#495057',
                                    }}
                                >
                                    Campaign Name *
                                </label>
                                <InputText
                                    value={campaignInfo.name}
                                    onChange={(e) =>
                                        setCampaignInfo((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., Buyer - 90 Day Nurture Sequence"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        color: '#495057',
                                    }}
                                >
                                    Lead Timeframe *
                                </label>
                                <Dropdown
                                    value={campaignInfo.timeframe}
                                    options={timeframeOptions}
                                    onChange={(e) =>
                                        setCampaignInfo((prev) => ({
                                            ...prev,
                                            timeframe: e.value,
                                        }))
                                    }
                                    placeholder="When does the lead plan to buy/sell?"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="isShared"
                                    checked={campaignInfo.is_shared}
                                    onChange={(e) =>
                                        setCampaignInfo((prev) => ({
                                            ...prev,
                                            is_shared: e.checked,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="isShared"
                                    style={{ fontWeight: '500', color: '#495057' }}
                                >
                                    Make available to all agents
                                </label>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '2rem',
                            }}
                        >
                            <Button
                                label="Next: Edit Emails"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                                style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                            />
                        </div>
                    </Card>
                )}

                {/* Step 2: Edit Emails */}
                {step === 2 && (
                    <div>
                        {/* Existing Emails List */}
                        {emails.length > 0 && (
                            <Card
                                style={{
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: '#2c3e50',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    Campaign Emails ({emails.length})
                                </h3>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                    }}
                                >
                                    {emails
                                        .sort((a, b) => a.dayNumber - b.dayNumber)
                                        .map((email) => (
                                            <div
                                                key={email.dayNumber}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: '#f8fafc',
                                                    borderLeft: '4px solid #667eea',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            marginBottom: '0.25rem',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                backgroundColor: '#667eea',
                                                                color: 'white',
                                                                padding: '0.2rem 0.6rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '700',
                                                            }}
                                                        >
                                                            Day {email.dayNumber}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                            }}
                                                        >
                                                            {email.subject}
                                                        </span>
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6c757d',
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}
                                                        {email.body.replace(/<[^>]*>/g, '').length > 100
                                                            ? '...'
                                                            : ''}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Button
                                                        icon="pi pi-pencil"
                                                        className="p-button-sm p-button-text"
                                                        onClick={() => handleEditEmail(index)}
                                                    />
                                                    <Button
                                                        icon="pi pi-trash"
                                                        className="p-button-sm p-button-danger p-button-text"
                                                        onClick={() => handleRemoveEmail(index)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        )}

                        {/* Add/Edit Email Form */}
                        <Card
                            style={{
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                borderRadius: '12px',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '1rem',
                                }}
                            >
                                {editingIndex !== null ? 'Edit Email' : 'Add Email'}
                            </h3>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem',
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem',
                                            color: '#495057',
                                        }}
                                    >
                                        Day Number *
                                    </label>
                                    <InputText
                                        type="number"
                                        value={currentEmail.dayNumber}
                                        onChange={(e) =>
                                            setCurrentEmail((prev) => ({
                                                ...prev,
                                                dayNumber: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g., 1 (sends 1 day after enrollment)"
                                        min="1"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem',
                                            color: '#495057',
                                        }}
                                    >
                                        Subject Line *
                                    </label>
                                    <InputText
                                        value={currentEmail.subject}
                                        onChange={(e) =>
                                            setCurrentEmail((prev) => ({
                                                ...prev,
                                                subject: e.target.value,
                                            }))
                                        }
                                        placeholder="Email subject line"
                                        style={{ width: '100%' }}
                                    />
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginTop: '0.5rem',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#6c757d',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            Insert variable:
                                        </span>
                                        <Button
                                            label="{{Lead Name}}"
                                            className="p-button-sm p-button-outlined p-button-secondary"
                                            onClick={() => insertSubjectVariable('{{Lead Name}}')}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        />
                                        <Button
                                            label="{{Agent Name}}"
                                            className="p-button-sm p-button-outlined p-button-secondary"
                                            onClick={() => insertSubjectVariable('{{Agent Name}}')}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem',
                                            color: '#495057',
                                        }}
                                    >
                                        Email Body *
                                    </label>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#6c757d',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            Insert variable:
                                        </span>
                                        <Button
                                            label="{{Lead Name}}"
                                            className="p-button-sm p-button-outlined p-button-secondary"
                                            onClick={() => insertBodyVariable('{{Lead Name}}')}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        />
                                        <Button
                                            label="{{Agent Name}}"
                                            className="p-button-sm p-button-outlined p-button-secondary"
                                            onClick={() => insertBodyVariable('{{Agent Name}}')}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        />
                                        <Button
                                            label="{{Agent Signature}}"
                                            className="p-button-sm p-button-outlined p-button-secondary"
                                            onClick={() => insertBodyVariable('{{Agent Signature}}')}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        />
                                    </div>
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={currentEmail.body}
                                        onChange={(value) =>
                                            setCurrentEmail((prev) => ({ ...prev, body: value }))
                                        }
                                        modules={quillModules}
                                        formats={quillFormats}
                                        style={{ minHeight: '200px' }}
                                    />
                                </div>

                                <Button
                                    label={
                                        editingIndex !== null
                                            ? 'Update Email'
                                            : 'Add Email to Campaign'
                                    }
                                    icon={editingIndex !== null ? 'pi pi-check' : 'pi pi-plus'}
                                    className="p-button-success"
                                    onClick={handleAddEmail}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: '600',
                                        alignSelf: 'flex-start',
                                    }}
                                />
                            </div>
                        </Card>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '1.5rem',
                            }}
                        >
                            <Button
                                label="Back"
                                icon="pi pi-arrow-left"
                                className="p-button-text"
                                onClick={() => setStep(1)}
                            />
                            <Button
                                label="Next: Review"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                disabled={emails.length === 0}
                                onClick={() => setStep(3)}
                                style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Save */}
                {step === 3 && (
                    <div>
                        <Card
                            style={{
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Review Campaign
                            </h2>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>
                                        Campaign Name
                                    </span>
                                    <p style={{ fontWeight: '700', color: '#2c3e50', margin: '0.25rem 0 0 0' }}>
                                        {campaignInfo.name}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>
                                        Type
                                    </span>
                                    <p style={{ fontWeight: '700', color: '#2c3e50', margin: '0.25rem 0 0 0' }}>
                                        {campaignInfo.type}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>
                                        Timeframe
                                    </span>
                                    <p style={{ fontWeight: '700', color: '#2c3e50', margin: '0.25rem 0 0 0' }}>
                                        {campaignInfo.timeframe}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>
                                        Total Emails
                                    </span>
                                    <p style={{ fontWeight: '700', color: '#2c3e50', margin: '0.25rem 0 0 0' }}>
                                        {emails.length}
                                    </p>
                                </div>
                            </div>

                            <h3
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '1rem',
                                }}
                            >
                                Email Sequence
                            </h3>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                }}
                            >
                                {emails
                                    .sort((a, b) => a.dayNumber - b.dayNumber)
                                    .map((email) => (
                                        <div
                                            key={email.dayNumber}
                                            style={{
                                                padding: '1rem',
                                                backgroundColor: '#f8fafc',
                                                borderLeft: '4px solid #667eea',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    marginBottom: '0.5rem',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        backgroundColor: '#667eea',
                                                        color: 'white',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    Day {email.dayNumber}
                                                </span>
                                                <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                                                    {email.subject}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '0.9rem',
                                                    color: '#495057',
                                                    maxHeight: '60px',
                                                    overflow: 'hidden',
                                                }}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Button
                                label="Back"
                                icon="pi pi-arrow-left"
                                className="p-button-text"
                                onClick={() => setStep(2)}
                            />
                            <Button
                                label={saving ? 'Saving...' : 'Save Changes'}
                                icon="pi pi-check"
                                className="p-button-success"
                                disabled={saving}
                                loading={saving}
                                onClick={handleSubmit}
                                style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default EditDripCampaign;
