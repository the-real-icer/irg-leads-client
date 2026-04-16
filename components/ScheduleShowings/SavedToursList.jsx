import PropTypes from 'prop-types';

import { formatRelativeTime } from './tourHelpers';

const formatScheduledDate = (input) => {
    if (!input) return null;
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const SavedToursList = ({ tours, activeTourId, loading, onLoad, onDelete }) => {
    return (
        <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between">
                <h2 className="m-0 text-[16px] font-semibold text-foreground">
                    Saved Tours
                </h2>
                {tours.length > 0 && (
                    <span className="text-[12px] text-foreground/60">
                        {tours.length}
                    </span>
                )}
            </div>

            {loading && tours.length === 0 && (
                <div
                    className={
                        'bg-surface rounded-[16px] border border-border '
                        + 'shadow-sm p-[24px]'
                    }
                >
                    <p className="m-0 text-[14px] text-foreground/70 text-center">
                        Loading your tours…
                    </p>
                </div>
            )}

            {!loading && tours.length === 0 && (
                <div
                    className={
                        'bg-surface rounded-[16px] border border-border '
                        + 'shadow-sm p-[24px]'
                    }
                >
                    <p className="m-0 text-[14px] text-foreground/70 text-center">
                        No saved tours yet. Save your current tour to get started.
                    </p>
                </div>
            )}

            {tours.length > 0 && (
                <ul
                    className={
                        'list-none m-0 p-0 flex flex-col gap-[8px] '
                        + 'max-h-[400px] overflow-y-auto'
                    }
                >
                    {tours.map((tour) => {
                        const isActive = tour._id === activeTourId;
                        const stopCount = Array.isArray(tour.stops) ? tour.stops.length : 0;
                        const scheduledLabel = formatScheduledDate(tour.scheduled_date);
                        return (
                            <li key={tour._id} className="group relative">
                                <button
                                    type="button"
                                    onClick={() => onLoad(tour._id)}
                                    aria-current={isActive ? 'true' : undefined}
                                    className={
                                        'w-full text-left rounded-[12px] border p-[12px] '
                                        + 'shadow-sm transition-colors '
                                        + 'focus:outline-none focus:ring-2 focus:ring-primary/40 '
                                        + (isActive
                                            ? 'bg-primary/10 border-primary/40 border-l-4 '
                                            : 'bg-surface border-border hover:bg-background '
                                        )
                                    }
                                >
                                    <div className="flex items-start justify-between gap-[8px]">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[14px] font-semibold text-foreground truncate">
                                                {tour.name || 'Untitled tour'}
                                            </div>
                                            <div className="text-[12px] text-foreground/70 truncate">
                                                {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
                                                {tour.updatedAt
                                                    ? ` · updated ${formatRelativeTime(tour.updatedAt)}`
                                                    : ''}
                                            </div>
                                        </div>
                                        {scheduledLabel && (
                                            <span
                                                className={
                                                    'text-[11px] font-semibold '
                                                    + 'px-[6px] py-[2px] rounded-[4px] '
                                                    + 'bg-background text-foreground/70 '
                                                    + 'whitespace-nowrap'
                                                }
                                            >
                                                {scheduledLabel}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // eslint-disable-next-line no-alert
                                        if (window.confirm('Delete this tour?')) {
                                            onDelete(tour._id);
                                        }
                                    }}
                                    aria-label={`Delete ${tour.name || 'this tour'}`}
                                    className={
                                        'absolute top-[8px] right-[8px] '
                                        + 'opacity-0 group-hover:opacity-100 focus:opacity-100 '
                                        + 'text-foreground/50 hover:text-danger '
                                        + 'p-[4px] rounded-[4px] '
                                        + 'transition-opacity'
                                    }
                                >
                                    <i className="pi pi-times" aria-hidden="true" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

SavedToursList.propTypes = {
    tours: PropTypes.array.isRequired,
    activeTourId: PropTypes.string,
    loading: PropTypes.bool,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

SavedToursList.defaultProps = {
    activeTourId: null,
    loading: false,
};

export default SavedToursList;
