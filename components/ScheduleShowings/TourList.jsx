import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { formatBedsBaths } from './tourHelpers';

// Sortable stop card — useSortable provides transform/transition/isDragging
// plus `attributes` + `listeners` for the drag-handle button. We attach
// those to the handle ONLY so clicks on Remove (or any future interactive
// element on the card) never initiate a drag.
const SortableStopCard = ({ stop, index, onRemove, isBroken, markBroken }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: stop.mls_number });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={
                'flex items-center gap-[12px] '
                + 'bg-surface rounded-[12px] border border-border '
                + 'shadow-sm p-[12px]'
            }
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label={`Drag to reorder ${stop.address}`}
                className={
                    'flex-shrink-0 cursor-grab active:cursor-grabbing '
                    + 'text-foreground/40 hover:text-foreground '
                    + 'p-[4px] rounded-[4px] '
                    + 'focus:outline-none focus:ring-2 focus:ring-primary/40 '
                    + 'transition-colors'
                }
            >
                <i className="pi pi-bars" aria-hidden="true" />
            </button>

            <span
                className={
                    'flex-shrink-0 w-[28px] h-[28px] rounded-full '
                    + 'bg-primary text-white text-[13px] font-semibold '
                    + 'flex items-center justify-center'
                }
                aria-hidden="true"
            >
                {index + 1}
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
    );
};

SortableStopCard.propTypes = {
    stop: PropTypes.shape({
        mls_number: PropTypes.string.isRequired,
        address: PropTypes.string,
        unit_number: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        price: PropTypes.string,
        thumbnail: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    isBroken: PropTypes.func.isRequired,
    markBroken: PropTypes.func.isRequired,
};

// Screen-reader instructions surfaced when a drag handle receives focus.
// @dnd-kit reads these via the DndContext `accessibility` prop.
const screenReaderInstructions = {
    draggable:
        'Press space or enter to pick up a tour stop. '
        + 'Use the arrow keys to move. Press space or enter again to drop. '
        + 'Press escape to cancel.',
};

const TourList = ({ stops, onRemove, onReorder }) => {
    const count = stops.length;

    const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
    const isBroken = (url) => brokenThumbs.has(url);
    const markBroken = (url) => setBrokenThumbs((prev) => {
        const next = new Set(prev);
        next.add(url);
        return next;
    });

    // PointerSensor with a 5px activation constraint — a simple click on
    // the handle doesn't start a drag, only a clear pointer-move does.
    // KeyboardSensor with the sortable coordinate getter gives us the
    // full Space/Arrow/Space/Escape flow for free.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = stops.findIndex((s) => s.mls_number === active.id);
        const newIndex = stops.findIndex((s) => s.mls_number === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        onReorder(arrayMove(stops, oldIndex, newIndex));
    };

    return (
        <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between">
                <h2 className="m-0 text-[16px] font-semibold text-foreground">
                    Tour ({count})
                </h2>
                {count > 1 && (
                    <span className="text-[12px] text-foreground/60">
                        Drag to reorder
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    accessibility={{ screenReaderInstructions }}
                >
                    <SortableContext
                        items={stops.map((s) => s.mls_number)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="list-none m-0 p-0 flex flex-col gap-[8px]">
                            {stops.map((stop, index) => (
                                <SortableStopCard
                                    key={stop.mls_number}
                                    stop={stop}
                                    index={index}
                                    onRemove={onRemove}
                                    isBroken={isBroken}
                                    markBroken={markBroken}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

TourList.propTypes = {
    stops: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
};

export default TourList;
