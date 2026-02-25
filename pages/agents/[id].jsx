// React & NextJS
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Redux
import { useSelector } from 'react-redux';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const AgentProfile = () => {
    // __________________Next Router______________________\\
    const router = useRouter();
    const { id } = router.query;

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const currentAgent = useSelector((state) => state.agent);
    const isAdmin = currentAgent?.role === 'admin';

    // ________________Component State_________________\\
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        display_email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        title: '',
        dre_license: '',
        role: 'agent',
        image: '',
        commissionSplit: '',
    });
    const [commissionSplitError, setCommissionSplitError] = useState('');

    const roleOptions = [
        { label: 'Agent', value: 'agent' },
        { label: 'Admin', value: 'admin' },
    ];

    // Fetch agent data on mount
    useEffect(() => {
        if (!isLoggedIn || !id) return;

        const fetchAgent = async () => {
            setLoading(true);
            try {
                const response = await IrgApi.get(`/agents/${id}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success') {
                    const agentData = response.data.data;
                    setAgent(agentData);

                    // Populate form with agent data
                    setFormData({
                        name: agentData.name || '',
                        email: agentData.email || '',
                        display_email: agentData.display_email || '',
                        phone: agentData.phone || '',
                        address: agentData.address || '',
                        city: agentData.city || '',
                        state: agentData.state || '',
                        zip_code: agentData.zip_code || '',
                        title: agentData.title || '',
                        dre_license: agentData.dre_license || '',
                        role: agentData.role || 'agent',
                        image: agentData.image || '',
                        commissionSplit: agentData.commissionSplit != null ? String(agentData.commissionSplit) : '',
                    });
                }
            } catch (error) {
                console.error('Fetch agent error:', error); // eslint-disable-line

                let errorMessage = 'Failed to load agent';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                showToast('error', errorMessage, 'Error');

                // Redirect back to agents list if agent not found
                if (error.response?.status === 404) {
                    setTimeout(() => router.push('/agents'), 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAgent();
    }, [isLoggedIn, id, router]);

    // Handle form input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.display_email || !formData.title || !formData.dre_license || !formData.image) {
            showToast('error', 'Please fill in all required fields', 'Validation Error');
            return;
        }

        // Commission split validation
        if (formData.commissionSplit !== '' && formData.commissionSplit !== null && formData.commissionSplit !== undefined) {
            const splitVal = parseFloat(formData.commissionSplit);
            if (isNaN(splitVal) || splitVal < 0 || splitVal > 100) {
                setCommissionSplitError('Please enter a valid percentage between 0 and 100');
                showToast('error', 'Commission split must be between 0 and 100', 'Validation Error');
                return;
            }
            setCommissionSplitError('');
        }

        // Parse commission split for submission
        const submitData = { ...formData };
        if (submitData.commissionSplit !== '' && submitData.commissionSplit !== null && submitData.commissionSplit !== undefined) {
            submitData.commissionSplit = parseFloat(submitData.commissionSplit);
        } else {
            delete submitData.commissionSplit;
        }

        try {
            setSaving(true);
            const response = await IrgApi.patch(
                `/agents/${id}`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Agent updated successfully', 'Success');
                setAgent(response.data.data);
            }
        } catch (error) {
            console.error('Update agent error:', error); // eslint-disable-line

            // Handle different types of errors
            let errorMessage = 'Failed to update agent';

            if (error.response?.data?.message) {
                const message = error.response.data.message;

                // Check if it's a validation error
                if (message.includes('validation failed')) {
                    const validationErrors = [];

                    // Extract field names and error messages
                    const errorMatches = message.match(/([a-zA-Z_]+): Path `([^`]+)` is required\./g);
                    if (errorMatches) {
                        errorMatches.forEach(match => {
                            const fieldMatch = match.match(/`([^`]+)`/);
                            if (fieldMatch) {
                                const fieldName = fieldMatch[1]
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                validationErrors.push(fieldName);
                            }
                        });
                    }

                    if (validationErrors.length > 0) {
                        errorMessage = `Missing required fields: ${validationErrors.join(', ')}`;
                    } else {
                        errorMessage = message;
                    }
                } else if (message.includes('duplicate key error') || message.includes('E11000')) {
                    // Handle duplicate key errors
                    if (message.includes('email')) {
                        errorMessage = 'An agent with this email already exists';
                    } else if (message.includes('dre_license')) {
                        errorMessage = 'An agent with this DRE license already exists';
                    } else {
                        errorMessage = 'This agent already exists in the system';
                    }
                } else {
                    errorMessage = message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast('error', errorMessage, 'Error');
        } finally {
            setSaving(false);
        }
    };

    // Handle back button
    const handleBack = () => {
        router.push('/agents');
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Button
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-rounded"
                            onClick={handleBack}
                            tooltip="Back to Agents"
                        />
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            margin: 0,
                        }}>
                            {loading ? 'Loading...' : `Edit Agent: ${agent?.name || ''}`}
                        </h1>
                    </div>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem', marginLeft: '4rem' }}>
                        Update agent information and settings
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading agent details...</p>
                        </div>
                    </Card>
                ) : (
                    <Card style={{
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px'
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Agent Image Preview */}
                                {formData.image && (
                                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                        <img
                                            src={formData.image}
                                            alt={formData.name}
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #667eea'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Name */}
                                <div>
                                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                        Name *
                                    </label>
                                    <InputText
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Enter agent name"
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>

                                {/* Email Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {/* Email (Login) */}
                                    <div>
                                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Email (Login) *
                                        </label>
                                        <InputText
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="Enter login email"
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>

                                    {/* Display Email */}
                                    <div>
                                        <label htmlFor="display_email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Display Email *
                                        </label>
                                        <InputText
                                            id="display_email"
                                            type="email"
                                            value={formData.display_email}
                                            onChange={(e) => handleChange('display_email', e.target.value)}
                                            placeholder="Enter public display email"
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                        Phone
                                    </label>
                                    <InputText
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {/* Title and DRE License Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {/* Title */}
                                    <div>
                                        <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Title *
                                        </label>
                                        <InputText
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            placeholder="e.g., Real Estate Agent"
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>

                                    {/* DRE License */}
                                    <div>
                                        <label htmlFor="dre_license" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            DRE License *
                                        </label>
                                        <InputText
                                            id="dre_license"
                                            value={formData.dre_license}
                                            onChange={(e) => handleChange('dre_license', e.target.value)}
                                            placeholder="Enter DRE license number"
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                        Image URL *
                                    </label>
                                    <InputText
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => handleChange('image', e.target.value)}
                                        placeholder="Enter image URL"
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                        Address
                                    </label>
                                    <InputText
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="Enter street address"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {/* City, State, Zip */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            City
                                        </label>
                                        <InputText
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            placeholder="City"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            State
                                        </label>
                                        <InputText
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => handleChange('state', e.target.value)}
                                            placeholder="State"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="zip_code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Zip
                                        </label>
                                        <InputText
                                            id="zip_code"
                                            value={formData.zip_code}
                                            onChange={(e) => handleChange('zip_code', e.target.value)}
                                            placeholder="Zip"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                        Role *
                                    </label>
                                    <Dropdown
                                        id="role"
                                        value={formData.role}
                                        options={roleOptions}
                                        onChange={(e) => handleChange('role', e.value)}
                                        placeholder="Select role"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {/* Commission Split (Admin Only) */}
                                {isAdmin && (
                                    <div>
                                        <label htmlFor="commissionSplit" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Commission Split
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <InputText
                                                id="commissionSplit"
                                                value={formData.commissionSplit}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    handleChange('commissionSplit', val);
                                                    if (commissionSplitError) setCommissionSplitError('');
                                                }}
                                                placeholder="e.g., 50"
                                                style={{ width: '100%', paddingRight: '2rem' }}
                                                className={commissionSplitError ? 'p-invalid' : ''}
                                            />
                                            {formData.commissionSplit && (
                                                <span style={{
                                                    position: 'absolute',
                                                    right: '0.75rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#6c757d',
                                                    fontSize: '0.9rem',
                                                    pointerEvents: 'none',
                                                }}>%</span>
                                            )}
                                        </div>
                                        {commissionSplitError && (
                                            <small style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                                                {commissionSplitError}
                                            </small>
                                        )}
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                                    <Button
                                        label="Cancel"
                                        className="p-button-text"
                                        onClick={handleBack}
                                        type="button"
                                        disabled={saving}
                                    />
                                    <Button
                                        label={saving ? 'Saving...' : 'Save Changes'}
                                        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                                        type="submit"
                                        disabled={saving}
                                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                    />
                                </div>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
};

export default AgentProfile;
