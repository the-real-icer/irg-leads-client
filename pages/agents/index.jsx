// React & NextJS
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Redux
import { useSelector } from 'react-redux';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const Agents = () => {
    // __________________Next Router______________________\\
    const router = useRouter();

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const currentAgent = useSelector((state) => state.agent);
    const isAdmin = currentAgent?.role === 'admin';

    // ________________Component State_________________\\
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state for new agent
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
        password: '',
        image: '',
        commissionSplit: '',
    });
    const [commissionSplitError, setCommissionSplitError] = useState('');

    const roleOptions = [
        { label: 'Agent', value: 'agent' },
        { label: 'Admin', value: 'admin' },
    ];

    // Fetch all agents on mount
    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchAgents = async () => {
            setLoading(true);
            try {
                const response = await IrgApi.get('/agents/all-agents', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success') {
                    setAgents(response.data.data);
                }
            } catch (error) {
                let errorMessage = 'Failed to load agents';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                showToast('error', errorMessage, 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, [isLoggedIn]);

    // Handle form input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.dre_license || !formData.password || !formData.display_email || !formData.title || !formData.image) {
            showToast('error', 'Please fill in all required fields', 'Validation Error');
            return;
        }

        // Commission split validation (optional field)
        if (formData.commissionSplit !== '' && formData.commissionSplit !== null && formData.commissionSplit !== undefined) {
            const splitVal = parseFloat(formData.commissionSplit);
            if (Number.isNaN(splitVal) || splitVal < 0 || splitVal > 100) {
                setCommissionSplitError('Please enter a valid percentage between 0 and 100');
                showToast('error', 'Commission split must be between 0 and 100', 'Validation Error');
                return;
            }
            setCommissionSplitError('');
        }

        try {
            setSaving(true);
            const submitData = { ...formData };
            if (submitData.commissionSplit !== '' && submitData.commissionSplit !== null && submitData.commissionSplit !== undefined) {
                submitData.commissionSplit = parseFloat(submitData.commissionSplit);
            } else {
                delete submitData.commissionSplit;
            }

            const response = await IrgApi.post(
                '/agents/create-new-agent',
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Agent created successfully', 'Success');

                // Add new agent to the list
                setAgents((prev) => [...prev, response.data.data].sort((a, b) => a.name.localeCompare(b.name)));

                // Reset form and close dialog
                setFormData({
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
                    password: '',
                    image: '',
                    commissionSplit: '',
                });
                setCommissionSplitError('');
                setShowDialog(false);
            }
        } catch (error) {
            // Handle different types of errors
            let errorMessage = 'Failed to create agent';

            if (error.response?.data?.message) {
                // Extract validation errors from mongoose ValidationError
                const message = error.response.data.message;

                // Check if it's a validation error
                if (message.includes('validation failed')) {
                    // Parse validation errors
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
                    // Handle duplicate key errors (e.g., email or DRE license already exists)
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

    // Handle card click - navigate to agent edit page
    const handleAgentClick = (agentId) => {
        router.push(`/agents/${agentId}`);
    };

    return (
        <MainLayout>
            {/* Add Agent Dialog */}
            <Dialog
                header="Add New Agent"
                visible={showDialog}
                style={{ width: '600px' }}
                onHide={() => setShowDialog(false)}
                draggable={false}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Name */}
                        <div>
                            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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

                        {/* Email (Login) */}
                        <div>
                            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                            <label htmlFor="display_email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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

                        {/* Title */}
                        <div>
                            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                            <label htmlFor="dre_license" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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

                        {/* Image URL */}
                        <div>
                            <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                            <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                                <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                                <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                                <label htmlFor="zip_code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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

                        {/* Commission Split (admin only) */}
                        {isAdmin && (
                            <div>
                                <label htmlFor="commissionSplit" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
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
                                            color: 'hsl(var(--foreground-muted))',
                                            fontSize: '0.9rem',
                                            pointerEvents: 'none',
                                        }}>%</span>
                                    )}
                                </div>
                                {commissionSplitError && (
                                    <small style={{ color: 'hsl(var(--danger))', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                                        {commissionSplitError}
                                    </small>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                Password *
                            </label>
                            <InputText
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Enter password (min 8 characters)"
                                style={{ width: '100%' }}
                                required
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <Button
                                label="Cancel"
                                className="p-button-text"
                                onClick={() => setShowDialog(false)}
                                type="button"
                            />
                            <Button
                                label={saving ? 'Creating...' : 'Create Agent'}
                                icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                                type="submit"
                                disabled={saving}
                            />
                        </div>
                    </div>
                </form>
            </Dialog>

            {/* Main Content */}
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'hsl(var(--foreground))',
                            marginBottom: '0.5rem',
                        }}>
                            Agents
                        </h1>
                        <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.95rem' }}>
                            Manage all agents in the system
                        </p>
                    </div>
                    <Button
                        label="Add Agent"
                        icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={() => setShowDialog(true)}
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
                    />
                </div>

                {/* Agents Grid */}
                {loading ? (
                    <Card style={{ boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading agents...</p>
                        </div>
                    </Card>
                ) : agents.length === 0 ? (
                    <Card style={{ boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))' }}>
                            <i className="pi pi-users" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No agents found</p>
                            <p style={{ fontSize: '0.9rem' }}>Click "Add Agent" to create your first agent</p>
                        </div>
                    </Card>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {agents.map((agent) => (
                            <button
                                key={agent._id}
                                type="button"
                                style={{
                                    background: 'hsl(var(--surface))',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: 'none',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => handleAgentClick(agent._id)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px hsl(var(--shadow-color) / 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 12px hsl(var(--shadow-color) / 0.08)';
                                }}
                            >
                                {/* Agent Photo */}
                                <div style={{
                                    width: '100%',
                                    height: '280px',
                                    backgroundColor: 'hsl(var(--muted))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {agent.image ? (
                                        <img
                                            src={agent.image}
                                            alt={agent.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                objectPosition: 'center',
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<i class="pi pi-user" style="font-size: 4rem; color: hsl(var(--foreground-muted));"></i>';
                                            }}
                                        />
                                    ) : (
                                        <i className="pi pi-user" style={{ fontSize: '4rem', color: 'hsl(var(--foreground-muted))' }}></i>
                                    )}
                                </div>

                                {/* Agent Info */}
                                <div style={{ padding: '1.25rem' }}>
                                    {/* Name */}
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: 'hsl(var(--foreground))',
                                        marginBottom: '0.25rem',
                                    }}>
                                        {agent.name}
                                    </h3>

                                    {/* Title */}
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: 'hsl(var(--primary))',
                                        fontWeight: '600',
                                        marginBottom: '1rem',
                                    }}>
                                        {agent.title}
                                    </div>

                                    {/* Role Badge & Commission Split */}
                                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: agent.role === 'admin' ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--success) / 0.12)',
                                            color: agent.role === 'admin' ? 'hsl(var(--primary))' : 'hsl(var(--success))',
                                        }}>
                                            {agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: agent.commissionSplit != null ? 'hsl(var(--foreground))' : 'hsl(var(--foreground-muted))',
                                        }}>
                                            {agent.commissionSplit != null
                                                ? `${agent.commissionSplit}% / ${agent.brokerageCommissionSplit ?? (100 - agent.commissionSplit)}% (Agent / Brokerage)`
                                                : 'Split not set'}
                                        </span>
                                    </div>

                                    {/* Contact Info */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid hsl(var(--border))',
                                    }}>
                                        {/* Email */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <i className="pi pi-envelope" style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}></i>
                                            <span style={{
                                                color: 'hsl(var(--foreground))',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {agent.display_email || agent.email}
                                            </span>
                                        </div>

                                        {/* Phone */}
                                        {agent.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <i className="pi pi-phone" style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}></i>
                                                <span style={{ color: 'hsl(var(--foreground))' }}>
                                                    {agent.phone}
                                                </span>
                                            </div>
                                        )}

                                        {/* DRE License */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <i className="pi pi-id-card" style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}></i>
                                            <span style={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}>
                                                {agent.dre_license}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Agents;
