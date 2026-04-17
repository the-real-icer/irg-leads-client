import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

import ClientPicker from './ClientPicker';
import TourSaveStatus from './TourSaveStatus';

const Calendar = dynamic(
    () => import('primereact/calendar').then((mod) => mod.Calendar),
    { ssr: false },
);

const saveButtonLabel = (saveState, isNewTour) => {
    if (saveState === 'saving') return 'Saving…';
    if (isNewTour) return 'Save Tour';
    if (saveState === 'dirty' || saveState === 'error') return 'Save Changes';
    return 'Saved';
};

const TourHeader = ({
    name,
    onNameChange,
    client,
    onClientChange,
    scheduledDate,
    onScheduledDateChange,
    saveState,
    isNewTour,
    canSave,
    lastSavedAt,
    onSave,
    onNewTour,
}) => {
    const saveDisabled = !canSave;

    return (
        <div className="flex flex-col gap-[16px]">
            {/* Row 1 — title + save status + save button */}
            <div
                className={
                    'flex flex-col min-[900px]:flex-row '
                    + 'min-[900px]:items-center min-[900px]:justify-between gap-[12px]'
                }
            >
                <h1 className="m-0 text-[28px] font-semibold text-foreground">
                    Schedule Showings
                </h1>
                <div className="flex items-center gap-[12px]">
                    <TourSaveStatus
                        saveState={saveState}
                        isNewTour={isNewTour}
                        lastSavedAt={lastSavedAt}
                        onRetry={onSave}
                    />
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saveDisabled}
                        className={
                            'bg-primary text-white rounded-[8px] '
                            + 'px-[20px] py-[10px] text-[14px] font-semibold '
                            + 'hover:bg-primary-hover transition-colors '
                            + 'disabled:opacity-50 disabled:cursor-not-allowed '
                            + 'focus:outline-none focus:ring-2 focus:ring-primary/40'
                        }
                    >
                        {saveButtonLabel(saveState, isNewTour)}
                    </button>
                </div>
            </div>

            {/* Row 2 — name + client + date + new-tour */}
            <div
                className={
                    'flex flex-col min-[900px]:flex-row min-[900px]:items-end '
                    + 'gap-[12px]'
                }
            >
                <div className="flex flex-col gap-[6px] min-[900px]:flex-1 min-w-0">
                    <label htmlFor="tour-name" className="text-[12px] text-foreground/70">
                        Tour name
                    </label>
                    <input
                        id="tour-name"
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Tour name — e.g. Buyer Smith's Weekend Tour"
                        maxLength={120}
                        className={
                            'w-full rounded-[12px] border border-border '
                            + 'bg-surface text-foreground placeholder:text-foreground/50 '
                            + 'text-[14px] px-[16px] py-[12px] '
                            + 'focus:outline-none focus:ring-2 focus:ring-primary/40'
                        }
                    />
                </div>

                <div className="min-[900px]:w-[260px]">
                    <ClientPicker value={client} onChange={onClientChange} />
                </div>

                <div className="flex flex-col gap-[6px] min-[900px]:w-[200px]">
                    <label htmlFor="tour-scheduled-date" className="text-[12px] text-foreground/70">
                        Scheduled (optional)
                    </label>
                    <Calendar
                        id="tour-scheduled-date"
                        value={scheduledDate}
                        onChange={(e) => onScheduledDateChange(e.value || null)}
                        placeholder="Select date"
                        style={{ width: '100%' }}
                        showIcon
                        dateFormat="mm/dd/yy"
                        showButtonBar
                    />
                </div>

                <button
                    type="button"
                    onClick={onNewTour}
                    className={
                        'rounded-[8px] border border-border bg-surface '
                        + 'text-foreground hover:bg-background '
                        + 'px-[16px] py-[10px] text-[14px] font-semibold '
                        + 'transition-colors '
                        + 'focus:outline-none focus:ring-2 focus:ring-primary/40 '
                        + 'self-start min-[900px]:self-auto min-[900px]:mb-[2px]'
                    }
                >
                    New Tour
                </button>
            </div>
        </div>
    );
};

TourHeader.propTypes = {
    name: PropTypes.string.isRequired,
    onNameChange: PropTypes.func.isRequired,
    client: PropTypes.shape({
        _id: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        email: PropTypes.string,
    }),
    onClientChange: PropTypes.func.isRequired,
    scheduledDate: PropTypes.instanceOf(Date),
    onScheduledDateChange: PropTypes.func.isRequired,
    saveState: PropTypes.oneOf(['clean', 'dirty', 'saving', 'saved', 'error']).isRequired,
    isNewTour: PropTypes.bool.isRequired,
    canSave: PropTypes.bool.isRequired,
    lastSavedAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    onSave: PropTypes.func.isRequired,
    onNewTour: PropTypes.func.isRequired,
};

TourHeader.defaultProps = {
    client: null,
    scheduledDate: null,
    lastSavedAt: null,
};

export default TourHeader;
