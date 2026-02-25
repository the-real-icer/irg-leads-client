import PropTypes from 'prop-types';

const AgentInfo = ({ property }) => (
    <div className="agent__info">
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
