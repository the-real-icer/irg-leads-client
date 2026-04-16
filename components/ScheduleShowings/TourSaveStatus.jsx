import PropTypes from 'prop-types';

import { formatRelativeTime } from './tourHelpers';

const TourSaveStatus = ({ saveState, isNewTour, lastSavedAt, onRetry }) => {
    if (saveState === 'saving') {
        return (
            <span className="flex items-center gap-[6px] text-[12px] text-foreground/70">
                <i className="pi pi-spin pi-spinner" aria-hidden="true" />
                Saving…
            </span>
        );
    }

    if (saveState === 'saved') {
        return (
            <span className="flex items-center gap-[6px] text-[12px] text-success">
                <i className="pi pi-check" aria-hidden="true" />
                Saved
            </span>
        );
    }

    if (saveState === 'dirty') {
        return (
            <span className="flex items-center gap-[6px] text-[12px] text-warning">
                <i className="pi pi-circle-fill text-[8px]" aria-hidden="true" />
                Unsaved changes
            </span>
        );
    }

    if (saveState === 'error') {
        return (
            <span className="flex items-center gap-[8px] text-[12px] text-danger">
                <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                Save failed
                <button
                    type="button"
                    onClick={onRetry}
                    className={
                        'text-[12px] font-semibold text-primary '
                        + 'hover:text-primary-hover underline underline-offset-2'
                    }
                >
                    Retry
                </button>
            </span>
        );
    }

    // saveState === 'clean'
    if (!isNewTour && lastSavedAt) {
        return (
            <span className="text-[12px] text-foreground/60">
                Saved · {formatRelativeTime(lastSavedAt)}
            </span>
        );
    }

    return null;
};

TourSaveStatus.propTypes = {
    saveState: PropTypes.oneOf(['clean', 'dirty', 'saving', 'saved', 'error']).isRequired,
    isNewTour: PropTypes.bool.isRequired,
    lastSavedAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    onRetry: PropTypes.func,
};

TourSaveStatus.defaultProps = {
    lastSavedAt: null,
    onRetry: undefined,
};

export default TourSaveStatus;
