// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const ConfirmOffMarketDialog = ({
    showConfirmDialog,
    setShowConfirmDialog,
    handleOffMarketSubmit,
}) => (
    <Dialog
        header="Confirm Change To Off Market"
        visible={showConfirmDialog}
        style={{ width: '40rem', background: '#fff', fontSize: '1.4rem' }}
        onHide={() => setShowConfirmDialog(false)}
    >
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '1rem',
            }}
        >
            <h1>ARE YOU SURE???</h1>
            <br />
            <h2>THIS IS OFF MARKET</h2>
            <br />
            <h2>NOT DISPLAY BACK</h2>
            <br />
            <Button
                label="Confirm"
                icon="pi pi-check"
                onClick={handleOffMarketSubmit}
                style={{ fontSize: '1.7rem', margin: '1rem 0' }}
            />
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-danger"
                onClick={() => setShowConfirmDialog(false)}
                style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}
            />
        </div>
    </Dialog>
);

ConfirmOffMarketDialog.propTypes = {
    showConfirmDialog: PropTypes.bool.isRequired,
    setShowConfirmDialog: PropTypes.func.isRequired,
    handleOffMarketSubmit: PropTypes.func.isRequired,
};

export default ConfirmOffMarketDialog;
