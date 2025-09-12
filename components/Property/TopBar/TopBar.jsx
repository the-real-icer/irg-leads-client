// React
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

// Redux
import { useSelector } from 'react-redux';

// Third Party Components
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import TopBarStats from './TopBarStats';
import TopBarAddress from './TopBarAddress';
import EmailToLeadDialog from './EmailToLeadDialog';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../../../assets/irgApi';

const btnStyle = { fontSize: '1.2rem', fontWeight: '400', marginRight: '1rem' };

const TopBar = (props) => {
    const {
        property,
        // leads
    } = props;

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    const [showDialog, setShowDialog] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedLead, setSelectedLead] = useState('Select A Lead');
    const [lead, setLead] = useState({});

    const handleEmailClick = () => setShowDialog(true);
    const handleSubjectChange = (e) => setSubject(e.target.value);

    const toastEmailMsg = useRef(null);

    const handleToastMessage = (severity, summary, detail, life) => {
        toastEmailMsg.current.show({
            severity,
            summary,
            detail,
            life,
        });
    };

    const handleEmailSubmit = async () => {
        // e.preventDefault();

        const res = await IrgApi.post(
            '/users/send-one-property',
            { user: lead, agent, message, subject, home: property },
            {
                headers: {
                    Authorization: `Bearer ${isLoggedIn}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (res.data.status === 'success') {
            handleToastMessage('success', 'Email Sent!', '', 3000);
            setLead({});
            setSelectedLead('Select A Lead');
            setMessage('');
            setSubject('');
            setShowDialog(false);
        }
    };

    const onLeadChange = (e) => {
        if (e.value === null) {
            setLead({});
            setSelectedLead('Select A Lead');
        } else {
            setSelectedLead(e.value.email);
            setLead(e.value);
        }
    };

    return (
        <header className="property__page__container">
            <div className="property__topbar">
                <Toast
                    ref={toastEmailMsg}
                    className="irg__toast"
                    position="top-right"
                    baseZIndex={200000000}
                />
                <EmailToLeadDialog
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    selectedLead={selectedLead}
                    // leads={leads}
                    onLeadChange={onLeadChange}
                    subject={subject}
                    handleSubjectChange={handleSubjectChange}
                    message={message}
                    setMessage={setMessage}
                    handleEmailSubmit={handleEmailSubmit}
                />
                <TopBarAddress property={property} />
                <TopBarStats property={property} />
                <div className="property__topbar__actions">
                    <Button
                        label="Email To Client"
                        className="p-button-lg p-button-secondary p-button-outlined"
                        onClick={handleEmailClick}
                        style={btnStyle}
                    />
                </div>
            </div>
        </header>
    );
};

TopBar.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        listing_pics: PropTypes.string.isRequired,
        property_url: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        days_on_market: PropTypes.number.isRequired,
        bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        mls_number: PropTypes.string.isRequired,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default TopBar;
