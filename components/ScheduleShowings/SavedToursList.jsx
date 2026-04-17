import PropTypes from 'prop-types';

import { formatRelativeTime, formatScheduledDate } from './tourHelpers';

// Build the secondary metadata line for a saved-tour card.
// Composes up to three segments joined by " · ": stop count, scheduled
// date (omitted if not set), and last-updated relative time (omitted
// if we somehow don't have an updatedAt).
const buildMetaLine = (tour) => {
    const stopCount = Array.isArray(tour.stops) ? tour.stops.length : 0;
    const parts = [`${stopCount} ${stopCount === 1 ? 'stop' : 'stops'}`];
    const scheduled = formatScheduledDate(tour.scheduled_date);
    if (scheduled) parts.push(scheduled);
    if (tour.updatedAt) parts.push(`updated ${formatRelativeTime(tour.updatedAt)}`);
    return parts.join(' · ');
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
                        return (
                            <li key={tour._id} className="relative">
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
                                    {/* pr-[28px] reserves space for the absolutely-positioned
                                        delete button so long names/metadata truncate before
                                        they reach the X icon. */}
                                    <div className="min-w-0 pr-[28px]">
                                        <div className="text-[14px] font-semibold text-foreground truncate">
                                            {tour.name || 'Untitled tour'}
                                        </div>
                                        <div className="text-[12px] text-foreground/70 truncate">
                                            {buildMetaLine(tour)}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(tour._id, tour.name || '');
                                    }}
                                    aria-label={`Delete ${tour.name || 'this tour'}`}
                                    className={
                                        'absolute top-[8px] right-[8px] '
                                        + 'text-foreground/40 hover:text-danger focus:text-danger '
                                        + 'p-[4px] rounded-[4px] '
                                        + 'transition-colors'
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
