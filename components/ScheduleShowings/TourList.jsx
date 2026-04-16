import { useState } from 'react';
import PropTypes from 'prop-types';

import { formatBedsBaths } from './tourHelpers';

const TourList = ({ stops, onRemove }) => {
    const count = stops.length;

    // Track thumbnail URLs that have failed to load so we can swap them
    // out for the placeholder instead of showing a broken-image icon.
    const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
    const isBroken = (url) => brokenThumbs.has(url);
    const markBroken = (url) => setBrokenThumbs((prev) => {
        const next = new Set(prev);
        next.add(url);
        return next;
    });

    return (
        <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between">
                <h2 className="m-0 text-[16px] font-semibold text-foreground">
                    Tour ({count})
                </h2>
                {count > 0 && (
                    <span className="text-[12px] text-foreground/60">
                        Ordered by add time
                    </span>
                )}
            </div>

            {count === 0 ? (
                <div
                    className={
                        'bg-surface rounded-[16px] border border-border '
                        + 'shadow-sm p-[24px] md:p-[32px]'
                    }
                >
                    <p className="m-0 text-[14px] text-foreground/70 text-center">
                        No properties added yet. Search on the left to build your tour.
                    </p>
                </div>
            ) : (
                <ul className="list-none m-0 p-0 flex flex-col gap-[8px]">
                    {stops.map((stop, idx) => (
                        <li
                            key={stop.mls_number}
                            className={
                                'flex items-center gap-[12px] '
                                + 'bg-surface rounded-[12px] border border-border '
                                + 'shadow-sm p-[12px]'
                            }
                        >
                            <span
                                className={
                                    'flex-shrink-0 w-[28px] h-[28px] rounded-full '
                                    + 'bg-primary text-white text-[13px] font-semibold '
                                    + 'flex items-center justify-center'
                                }
                                aria-hidden="true"
                            >
                                {idx + 1}
                            </span>

                            {stop.thumbnail && !isBroken(stop.thumbnail) ? (
                                <img
                                    src={stop.thumbnail}
                                    onError={() => markBroken(stop.thumbnail)}
                                    alt=""
                                    className="w-[48px] h-[48px] rounded-[8px] object-cover flex-shrink-0"
                                />
                            ) : (
                                <div
                                    className={
                                        'w-[48px] h-[48px] rounded-[8px] bg-background '
                                        + 'flex-shrink-0'
                                    }
                                />
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-medium text-foreground truncate">
                                    {stop.address}
                                    {stop.unit_number ? ` #${stop.unit_number}` : ''}
                                </div>
                                <div className="text-[12px] text-foreground/70 truncate">
                                    {stop.city}, {stop.state}
                                </div>
                                <div className="text-[12px] text-foreground/70 truncate">
                                    {stop.price}
                                    {formatBedsBaths(stop) && ` · ${formatBedsBaths(stop)}`}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onRemove(stop.mls_number)}
                                aria-label={`Remove ${stop.address} from tour`}
                                className={
                                    'flex-shrink-0 text-[12px] font-semibold '
                                    + 'text-foreground/70 hover:text-danger '
                                    + 'px-[8px] py-[4px] rounded-[6px] '
                                    + 'transition-colors'
                                }
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

TourList.propTypes = {
    stops: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default TourList;
