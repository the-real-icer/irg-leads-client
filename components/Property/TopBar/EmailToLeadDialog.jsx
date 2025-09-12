// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';

const EmailToLeadDialog = (props) => {
    const {
        showDialog,
        setShowDialog,
        selectedLead,
        // leads,
        onLeadChange,
        subject,
        handleSubjectChange,
        message,
        setMessage,
        handleEmailSubmit,
    } = props;

    const selectedLeadsTemplate = () => (
        <span className="property__topbar__dropdown__label">{selectedLead}</span>
    );

    const leadOptionTemplate = (option) => (
        <div className="property__topbar__dropdown__item">
            <div>{option.first_name}</div>
            <div>{option.email}</div>
        </div>
    );

    return (
        <Dialog
            header="Email This Property To A Lead"
            visible={showDialog}
            style={{ width: '80rem', background: '#fff', fontSize: '1.4rem' }}
            onHide={() => setShowDialog(false)}
        >
            <div className="p-fluid">
                <div className="p-field">
                    <label htmlFor="subject">Select A Lead</label>
                    <Dropdown
                        value={selectedLead}
                        // options={leads}
                        onChange={onLeadChange}
                        filter
                        showClear
                        filterBy="name"
                        valueTemplate={selectedLeadsTemplate}
                        itemTemplate={leadOptionTemplate}
                        placeholder={selectedLead}
                        className="property__topbar__dropdown"
                        panelClassName="property__topbar__dropdown__panel"
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="subject">Subject</label>
                    <InputText
                        id="subject"
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={handleSubjectChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <Editor
                    style={{ height: '320px' }}
                    value={message}
                    onTextChange={(e) => setMessage(e.htmlValue)}
                />
                <Button
                    label="Send"
                    icon="pi pi-check"
                    onClick={handleEmailSubmit}
                    style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}
                />
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-danger"
                    onClick={() => setShowDialog(false)}
                    style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}
                />
            </div>
        </Dialog>
    );
};

EmailToLeadDialog.propTypes = {
    setShowDialog: PropTypes.func.isRequired,
    onLeadChange: PropTypes.func.isRequired,
    handleSubjectChange: PropTypes.func.isRequired,
    handleEmailSubmit: PropTypes.func.isRequired,
    setMessage: PropTypes.func.isRequired,
    subject: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    showDialog: PropTypes.bool.isRequired,
};

export default EmailToLeadDialog;
