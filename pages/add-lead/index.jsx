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
const InputText = dynamic(() => import('primereact/inputtext'), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown'), { ssr: false });
const Card = dynamic(() => import('primereact/card'), { ssr: false });
const InputTextarea = dynamic(() => import('primereact/inputtextarea'), { ssr: false });
const Button = dynamic(() => import('primereact/button'), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import showToast from '../../utils/showToast';
import irgApi from '../../assets/irgApi';
import { categories, sources, types, states, blankUser } from '../../assets/newUserPage';

const AddLead = () => {
    const [user, setUser] = useState(blankUser);

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

    const onSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            // Basic validation
            if (!email || !phone) {
                showToast('error', 'Email and phone are required.', 'Validation Error');
                return;
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
                state: user.state.name,
                source: source.name,
                type: type.name,
                category: category.name,
                agentId: agent._id,
            };

            try {
                const res = await irgApi.post('/users/new-user', newUser, {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.data.status === 'success') {
                    showToast('success', `${firstName} has been added!`, 'Lead Added!', 'top-left');
                    setUser(blankUser);
                    // TODO: Enable navigation or dispatch action to update lead list
                    // router.push(`/lead/${res.data._id}`);
                }
            } catch (err) {
                if (err.message === 'Request failed with status code 418') {
                    showToast(
                        'error',
                        'A lead with that email already exists.',
                        'Duplicate Lead',
                        'top-left',
                    );
                } else {
                    showToast(
                        'error',
                        'Something went wrong. Please try again.',
                        'Error',
                        'top-left',
                    );
                }
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
        ],
    );

    return (
        <MainLayout>
            <div style={{ margin: '3rem' }}>
                <Card>
                    <h2>Add A Lead</h2>
                    <form onSubmit={onSubmit}>
                        <div className="grid formgrid mt-3">
                            <div className="col-6 p-inputgroup">
                                <span className="p-float-label">
                                    <InputText
                                        id="firstName"
                                        value={firstName}
                                        onChange={onChange}
                                    />
                                    <label htmlFor="firstName">First Name</label>
                                </span>
                            </div>
                            <div className="col-6 p-inputgroup">
                                <span className="p-float-label">
                                    <InputText id="lastName" value={lastName} onChange={onChange} />
                                    <label htmlFor="lastName">Last Name</label>
                                </span>
                            </div>
                        </div>

                        <div className="grid mt-3">
                            <div className="col-6 p-inputgroup">
                                <span className="p-float-label">
                                    <InputText
                                        id="phone"
                                        // mask="(999) 999-9999"
                                        value={phone}
                                        // placeholder="(999) 999-9999"
                                        onChange={onChange}
                                        required
                                    />
                                    <label htmlFor="phone">Phone</label>
                                </span>
                            </div>
                            <div className="col-6 p-inputgroup">
                                <span className="p-float-label">
                                    <InputText
                                        id="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                    <label htmlFor="email">Email</label>
                                </span>
                            </div>
                        </div>

                        <div className="grid mt-3">
                            <div className="col-12 md:col-12">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText
                                            id="address"
                                            value={address}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="address">Address</label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid mt-3">
                            <div className="col-12 md:col-5">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputText id="city" value={city} onChange={onChange} />
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
                                            placeholder="Select a State"
                                        />
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
                                        />
                                        <label htmlFor="zipcode">Zipcode</label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid mt-3">
                            <div className="col-7">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <InputTextarea
                                            id="description"
                                            value={description}
                                            onChange={onChange}
                                            rows={5}
                                            cols={80}
                                        />
                                        <label htmlFor="description">Description</label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid mt-3">
                            <div className="col-2 md:col-3">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="source"
                                            value={source}
                                            options={sources}
                                            onChange={onChange}
                                            optionLabel="name"
                                            placeholder="Select a Source"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="type"
                                            value={type}
                                            options={types}
                                            onChange={onChange}
                                            optionLabel="name"
                                            placeholder="Select a Type"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="col-2 md:col-3">
                                <div className="p-inputgroup">
                                    <span className="p-float-label">
                                        <Dropdown
                                            id="category"
                                            value={category}
                                            options={categories}
                                            onChange={onChange}
                                            optionLabel="label"
                                            placeholder="Select a Category"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button label="Add Lead" className="p-button-raised mt-3" type="submit" />
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
};

export default AddLead;
