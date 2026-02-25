import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';

import EmailToLeadDialog from './EmailToLeadDialog';
import IrgApi from '../../../assets/irgApi';

const UserActions = ({ property }) => {
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
        toastEmailMsg.current.show({ severity, summary, detail, life });
    };

    const handleEmailSubmit = async () => {
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
        <>
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
                onLeadChange={onLeadChange}
                subject={subject}
                handleSubjectChange={handleSubjectChange}
                message={message}
                setMessage={setMessage}
                handleEmailSubmit={handleEmailSubmit}
            />
            <button
                className="property__action-btn property__action-btn--primary-filled"
                onClick={handleEmailClick}
                type="button"
            >
                <i className="pi pi-envelope" />
                Email to Client
            </button>
        </>
    );
};

UserActions.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        mls_number: PropTypes.string.isRequired,
    }).isRequired,
};

export default UserActions;
