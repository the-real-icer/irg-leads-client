import PropTypes from 'prop-types';

import { formatRelativeTime, formatScheduledDate } from './tourHelpers';
import { getStatusMeta } from './stopStatus';

const MAX_STATUS_DOTS = 8;

// A compact at-a-glance row of status dots — one per stop — up to
// MAX_STATUS_DOTS. Overflow renders as "+N" instead of more dots.
// Returns null if the tour has no stops so the card doesn't reserve
// empty vertical space for nothing.
const StatusDotRow = ({ stops }) => {
    if (!Array.isArray(stops) || stops.length === 0) return null;
    const shown = stops.slice(0, MAX_STATUS_DOTS);
    const overflow = stops.length - shown.length;
    return (
        <div
            className="flex items-center gap-[4px] mt-[6px]"
            aria-label={`${stops.length} stop${stops.length === 1 ? '' : 's'} status summary`}
        >
            {shown.map((s, i) => {
                const meta = getStatusMeta(s?.status);
                return (
                    <span
                        // Stable composite key: using mls_number + index covers the
                        // rare case of duplicates slipping into legacy docs.
                        key={`${s?.mls_number || 'stop'}-${i}`}
                        title={meta.label}
                        className={`inline-block w-[8px] h-[8px] rounded-full bg-tour-stop-${meta.tailwindKey}`}
                    />
                );
            })}
            {overflow > 0 && (
                <span className="text-[11px] text-foreground/60 ml-[2px]">
                    +{overflow}
                </span>
            )}
        </div>
    );
};

StatusDotRow.propTypes = {
    stops: PropTypes.array,
};

StatusDotRow.defaultProps = {
    stops: [],
};

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
                                        <StatusDotRow stops={tour.stops} />
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
