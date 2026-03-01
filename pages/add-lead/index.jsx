// React & NextJS
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { addLead } from '../../store/actions';

// Dynamically Import Third Party Components
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputTextarea = dynamic(
    () => import('primereact/inputtextarea').then((mod) => mod.InputTextarea),
    { ssr: false },
);
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import showToast from '../../utils/showToast';
import irgApi from '../../assets/irgApi';
import { categories, sources, types, states, blankUser } from '../../assets/newUserPage';

const formatPhoneNumber = (digits) => {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const getDigitsOnly = (value) => value.replace(/\D/g, '').slice(0, 10);

const AddLead = () => {
    const [user, setUser] = useState(blankUser);
    const [loading, setLoading] = useState(false);
    const [displayPhone, setDisplayPhone] = useState('');
    const [phoneDigits, setPhoneDigits] = useState('');
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

    const {
        firstName,
        lastName,
        email,
        description,
        source,
        address,
        city,
        zipcode,
        type,
        category,
    } = user;

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const dispatch = useDispatch();

    // __________________Next.js Router______________________\\
    const router = useRouter();

    const onChange = useCallback((e) => {
        setUser((prevUser) => ({ ...prevUser, [e.target.id]: e.target.value }));
    }, []);

    const handlePhoneChange = useCallback((e) => {
        const digits = getDigitsOnly(e.target.value);
        setPhoneDigits(digits);
        setDisplayPhone(formatPhoneNumber(digits));
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const onSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            // Prevent double submission
            if (loading) return;

            // Enhanced validation
            if (!email || !phoneDigits) {
                showToast('error', 'Email and phone are required.', 'Validation Error', 'top-left');
                return;
            }

            if (!validateEmail(email)) {
                showToast('error', 'Please enter a valid email address.', 'Invalid Email', 'top-left');
                return;
            }

            if (phoneDigits.length !== 10) {
                showToast(
                    'error',
                    'Please enter a valid 10-digit phone number.',
                    'Invalid Phone',
                    'top-left',
                );
                return;
            }

            if (!firstName || !lastName) {
                showToast(
                    'warn',
                    'First and last name are recommended for better lead management.',
                    'Missing Information',
                    'top-left',
                );
            }

            const newUser = {
                firstName,
                lastName,
                email,
                phone: phoneDigits,
                description,
                address,
                city,
                zipcode,
                state: user.state?.name || '',
                source: source?.name || '',
                type: type?.name || '',
                category: category?.name || '',
                agentId: agent._id,
                sendWelcomeEmail,
            };

            setLoading(true);

            try {
                const res = await irgApi.post('/users/new-user', newUser, {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.data.status === 'success') {
                    // Add the new lead to Redux state
                    dispatch(addLead(res.data.data));

                    showToast(
                        'success',
                        `${firstName || 'Lead'} has been added successfully! Redirecting...`,
                        'Lead Added!',
                        'top-left',
                    );
                    // Navigate to the newly created lead's profile page
                    router.push(`/lead/${res.data.data._id}`);
                }
            } catch (err) {
                if (err.response?.status === 418) {
                    showToast(
                        'error',
                        'A lead with that email already exists.',
                        'Duplicate Lead',
                        'top-left',
                    );
                } else if (err.response?.status === 401) {
                    showToast(
                        'error',
                        'Your session has expired. Please log in again.',
                        'Authentication Error',
                        'top-left',
                    );
                } else {
                    showToast(
                        'error',
                        err.response?.data?.message || 'Something went wrong. Please try again.',
                        'Error',
                        'top-left',
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [
            firstName,
            lastName,
            email,
            phoneDigits,
            description,
            address,
            city,
            zipcode,
            source,
            type,
            category,
            agent._id,
            isLoggedIn,
            user.state,
            loading,
            router,
            dispatch,
            sendWelcomeEmail,
        ],
    );

    return (
        <MainLayout>
            <div className="add-lead-page">
                <Card className="add-lead-card">
                    <div className="add-lead-header">
                        <h2>Add A Lead</h2>
                        <p className="add-lead-subtitle">
                            Create a new lead by filling out the information below
                        </p>
                    </div>
                    <form onSubmit={onSubmit}>
                        {/* Name Fields */}
                        <div className="grid formgrid mt-4">
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="firstName"
                                            value={firstName}
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor="firstName">First Name</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="lastName"
                                            value={lastName}
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor="lastName">Last Name</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid mt-3">
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="phone"
                                            type="tel"
                                            value={displayPhone}
                                            onChange={handlePhoneChange}
                                            required
                                            disabled={loading}
                                            maxLength={14}
                                            inputMode="numeric"
                                            autoComplete="tel"
                                        />
                                        <label htmlFor="phone">Phone *</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="email"
                                            value={email}
                                            onChange={onChange}
                                            type="email"
                                            required
                                            disabled={loading}
                                        />
                                        <label htmlFor="email">Email *</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Address Fields */}
                        <div className="grid mt-3">
                            <div className="col-12">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="address"
                                            value={address}
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor="address">Street Address</label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid mt-3">
                            <div className="col-12 md:col-5">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="city"
                                            value={city}
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor="city">City</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="state"
                                            value={user.state}
                                            options={states}
                                            onChange={onChange}
                                            optionLabel="label"
                                            placeholder="State"
                                            disabled={loading}
                                        />
                                        <label htmlFor="state">State</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="zipcode"
                                            value={zipcode}
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor="zipcode">Zipcode</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="grid mt-3">
                            <div className="col-12">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputTextarea
                                            id="description"
                                            value={description}
                                            onChange={onChange}
                                            rows={5}
                                            autoResize
                                            disabled={loading}
                                        />
                                        <label htmlFor="description">Notes / Description</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lead Details */}
                        <div className="grid mt-4">
                            <div className="col-12 md:col-4">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="source"
                                            value={source}
                                            options={sources}
                                            onChange={onChange}
                                            optionLabel="name"
                                            disabled={loading}
                                        />
                                        <label htmlFor="source">Lead Source</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="type"
                                            value={type}
                                            options={types}
                                            onChange={onChange}
                                            optionLabel="name"
                                            disabled={loading}
                                        />
                                        <label htmlFor="type">Lead Type</label>
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="category"
                                            value={category}
                                            options={categories}
                                            onChange={onChange}
                                            optionLabel="label"
                                            disabled={loading}
                                        />
                                        <label htmlFor="category">Lead Category</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Email Checkbox */}
                        <div
                            className="mt-4"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '16px',
                                padding: '14px 16px',
                                background: 'hsl(var(--muted))',
                                borderRadius: 'var(--radius)',
                                border: '1px solid hsl(var(--border))',
                            }}
                        >
                            <input
                                type="checkbox"
                                id="sendWelcomeEmail"
                                checked={sendWelcomeEmail}
                                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                                disabled={loading}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: 'hsl(var(--primary))',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            />
                            <label
                                htmlFor="sendWelcomeEmail"
                                style={{
                                    fontSize: '14px',
                                    color: sendWelcomeEmail
                                        ? 'hsl(var(--foreground))'
                                        : 'hsl(var(--muted-foreground))',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                            >
                                Send Lead A Welcome Email
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <Button
                                label={loading ? 'Adding Lead...' : 'Add Lead'}
                                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-plus'}
                                className="p-button-raised p-button-success"
                                type="submit"
                                disabled={loading}
                            />
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
};

export default AddLead;
