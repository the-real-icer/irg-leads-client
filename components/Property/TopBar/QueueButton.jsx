import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { addSelectedHome, removeSelectedHome } from '../../../store/actions';
import showToast from '../../../utils/showToast';

const QueueButton = ({ property }) => {
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const dispatch = useDispatch();

    const isQueued = selectedHomes.some((h) => h.mls_number === property.mls_number);

    const handleQueueToggle = () => {
        if (isQueued) {
            dispatch(removeSelectedHome(property));
            const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
            showToast('info', `${property.address}${unitNum} removed from queue`, 'Removed');
        } else {
            dispatch(addSelectedHome(property));
            const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
            showToast('success', `${property.address}${unitNum} added to queue`, 'Added to Queue');
        }
    };

    return (
        <button
            className={`property__action-btn ${isQueued ? 'property__action-btn--warning' : 'property__action-btn--primary-outline'}`}
            onClick={handleQueueToggle}
            type="button"
        >
            <i className={`pi ${isQueued ? 'pi-minus' : 'pi-plus'}`} />
            {isQueued ? 'Remove from Queue' : 'Add to Email Queue'}
        </button>
    );
};

QueueButton.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        mls_number: PropTypes.string.isRequired,
    }).isRequired,
};

export default QueueButton;
