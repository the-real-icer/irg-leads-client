import PropTypes from 'prop-types';

const AgentInfo = ({ property }) => (
    <div className="agent__info">
    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    background: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderLeft: '3px solid hsl(var(--primary))',
                    borderRadius: 'var(--radius)',
                }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                    <p style={{
                        fontSize: '13px',
                        color: 'hsl(var(--muted-foreground))',
                        margin: 0,
                        lineHeight: 1.5,
                    }}>
                        Data Updated Manually — Double Check MLS to Confirm
                    </p>
                </div>
        <p>Occupant Type: {property.occupant_type}</p>
        <p>Listing Agent: {property.list_agent_name}</p>
        <p>Listing Agent Email: {property.list_agent_email}</p>
        <p>Showing Instruction: {property.showing_instructions}</p>
        <p>Private Remarks: {property.private_remarks}</p>
    </div>
);

AgentInfo.propTypes = {
    property: PropTypes.shape({
        occupant_type: PropTypes.string.isRequired,
        list_agent_name: PropTypes.string.isRequired,
        list_agent_email: PropTypes.string.isRequired,
        showing_instructions: PropTypes.string.isRequired,
        private_remarks: PropTypes.number.isRequired,
    }).isRequired,
};

export default AgentInfo;
