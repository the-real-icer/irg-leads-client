// React & NextJS
import { useState, useCallback } from 'react';
// import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Redux
import {
    useSelector,
    //  useDispatch
} from 'react-redux';

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

const AddLead = () => {
    const [user, setUser] = useState(blankUser);
    const [loading, setLoading] = useState(false);

    const {
        firstName,
        lastName,
        email,
        phone,
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

    const onChange = useCallback((e) => {
        setUser((prevUser) => ({ ...prevUser, [e.target.id]: e.target.value }));
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[\d\s\-()]+$/;
        return phone.length >= 10 && phoneRegex.test(phone);
    };

    const onSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            // Prevent double submission
            if (loading) return;

            // Enhanced validation
            if (!email || !phone) {
                showToast('error', 'Email and phone are required.', 'Validation Error', 'top-left');
                return;
            }

            if (!validateEmail(email)) {
                showToast('error', 'Please enter a valid email address.', 'Invalid Email', 'top-left');
                return;
            }

            if (!validatePhone(phone)) {
                showToast(
                    'error',
                    'Please enter a valid phone number (at least 10 digits).',
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
                phone,
                description,
                address,
                city,
                zipcode,
                state: user.state?.name || '',
                source: source?.name || '',
                type: type?.name || '',
                category: category?.name || '',
                agentId: agent._id,
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
                    showToast(
                        'success',
                        `${firstName || 'Lead'} has been added successfully!`,
                        'Lead Added!',
                        'top-left',
                    );
                    setUser(blankUser);
                    // TODO: Enable navigation or dispatch action to update lead list
                    // router.push(`/lead/${res.data._id}`);
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
            phone,
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
                                            value={phone}
                                            onChange={onChange}
                                            required
                                            disabled={loading}
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
                                            placeholder="Source"
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
                                            placeholder="Type"
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
                                            placeholder="Category"
                                            disabled={loading}
                                        />
                                        <label htmlFor="category">Lead Category</label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-4">
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
