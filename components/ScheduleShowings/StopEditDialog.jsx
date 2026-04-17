import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

import { STOP_STATUSES, getStatusMeta } from './stopStatus';

// PrimeReact components — dynamic import w/ ssr: false matches house
// style (every Dialog + Calendar call site in the CRM uses this).
const Dialog = dynamic(
    () => import('primereact/dialog').then((mod) => mod.Dialog),
    { ssr: false },
);
const Calendar = dynamic(
    () => import('primereact/calendar').then((mod) => mod.Calendar),
    { ssr: false },
);

// One pill per status. Clicked → onSelect(value). Selected pill gets a
// ring in its own status color so it's obvious which one is active.
const StatusPill = ({ meta, selected, onSelect }) => {
    const key = meta.tailwindKey;
    return (
        <button
            type="button"
            onClick={() => onSelect(meta.value)}
            aria-pressed={selected}
            className={[
                'inline-flex items-center gap-[6px]',
                'px-[10px] py-[6px] rounded-[8px]',
                'text-[13px] font-medium',
                `bg-tour-stop-${key}/15`,
                `text-tour-stop-${key}`,
                'transition-all',
                selected
                    ? `ring-2 ring-tour-stop-${key} shadow-sm`
                    : 'hover:opacity-80',
            ].join(' ')}
        >
            <span
                aria-hidden="true"
                className={`inline-block w-[10px] h-[10px] rounded-full bg-tour-stop-${key}`}
            />
            {meta.label}
        </button>
    );
};

StatusPill.propTypes = {
    meta: PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        tailwindKey: PropTypes.string.isRequired,
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

const StopEditDialog = ({ stop, onSave, onCancel }) => {
    // Local editing state — copied in from the stop prop whenever the
    // dialog opens (i.e. the identity of `stop` changes). Local edits
    // stay scoped until Save; Cancel discards without touching the
    // parent's stops array.
    const [status, setStatus] = useState('pending');
    const [scheduledTime, setScheduledTime] = useState(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (!stop) return;
        setStatus(getStatusMeta(stop.status).value);
        setScheduledTime(
            stop.scheduled_time ? new Date(stop.scheduled_time) : null,
        );
        setNote(typeof stop.note === 'string' ? stop.note : '');
    }, [stop]);

    const handleSave = () => {
        onSave({
            status,
            scheduled_time: scheduledTime || null,
            note: note.trim(),
        });
    };

    const visible = Boolean(stop);
    const addressLine = stop
        ? [
            stop.address,
            stop.unit_number ? `#${stop.unit_number}` : null,
        ].filter(Boolean).join(' ')
        : '';
    const cityLine = stop
        ? [stop.city, stop.state, stop.zip_code].filter(Boolean).join(', ')
        : '';

    return (
        <Dialog
            header="Edit Stop"
            visible={visible}
            onHide={onCancel}
            style={{ width: '500px', maxWidth: '95vw' }}
            modal
            dismissableMask
        >
            <div className="flex flex-col gap-[20px]">
                {/* Address context — not editable */}
                {stop && (
                    <div
                        className={
                            'bg-background rounded-[8px] p-[12px] '
                            + 'border border-border'
                        }
                    >
                        <div className="text-[14px] font-medium text-foreground">
                            {addressLine}
                        </div>
                        {cityLine && (
                            <div className="text-[12px] text-foreground/70">
                                {cityLine}
                            </div>
                        )}
                    </div>
                )}

                {/* Status pill selector */}
                <div className="flex flex-col gap-[8px]">
                    <label
                        htmlFor="stop-status-group"
                        className="text-[12px] font-medium text-foreground/80"
                    >
                        Status
                    </label>
                    <div
                        id="stop-status-group"
                        role="radiogroup"
                        aria-label="Stop status"
                        className="flex flex-wrap gap-[8px]"
                    >
                        {STOP_STATUSES.map((meta) => (
                            <StatusPill
                                key={meta.value}
                                meta={meta}
                                selected={status === meta.value}
                                onSelect={setStatus}
                            />
                        ))}
                    </div>
                </div>

                {/* Scheduled time picker */}
                <div className="flex flex-col gap-[6px]">
                    <label
                        htmlFor="stop-scheduled-time"
                        className="text-[12px] font-medium text-foreground/80"
                    >
                        Scheduled time (optional)
                    </label>
                    <Calendar
                        id="stop-scheduled-time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.value || null)}
                        timeOnly
                        hourFormat="12"
                        placeholder="Select time"
                        showIcon
                        showButtonBar
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Note */}
                <div className="flex flex-col gap-[6px]">
                    <label
                        htmlFor="stop-note"
                        className="text-[12px] font-medium text-foreground/80"
                    >
                        Note (optional)
                    </label>
                    <textarea
                        id="stop-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Anything to remember about this showing…"
                        className={
                            'w-full rounded-[8px] border border-border '
                            + 'bg-surface text-foreground placeholder:text-foreground/50 '
                            + 'text-[14px] px-[12px] py-[10px] '
                            + 'focus:outline-none focus:ring-2 focus:ring-primary/40 '
                            + 'resize-y'
                        }
                    />
                    <div className="text-[11px] text-foreground/50 self-end">
                        {note.length} / 500
                    </div>
                </div>

                {/* Footer actions — inline children per CRM house style */}
                <div className="flex justify-end gap-[8px] pt-[4px]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={
                            'rounded-[8px] border border-border bg-surface '
                            + 'text-foreground hover:bg-background '
                            + 'px-[16px] py-[8px] text-[14px] font-medium '
                            + 'transition-colors '
                            + 'focus:outline-none focus:ring-2 focus:ring-primary/40'
                        }
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className={
                            'rounded-[8px] bg-primary text-white '
                            + 'hover:bg-primary-hover '
                            + 'px-[16px] py-[8px] text-[14px] font-semibold '
                            + 'transition-colors '
                            + 'focus:outline-none focus:ring-2 focus:ring-primary/40'
                        }
                    >
                        Save
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

StopEditDialog.propTypes = {
    stop: PropTypes.shape({
        mls_number: PropTypes.string,
        address: PropTypes.string,
        unit_number: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        scheduled_time: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.string,
        ]),
        note: PropTypes.string,
    }),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

StopEditDialog.defaultProps = {
    stop: null,
};

export default StopEditDialog;
