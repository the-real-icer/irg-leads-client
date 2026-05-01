import PropTypes from 'prop-types';

import {
    formatClientName,
    formatGeneratedDate,
    formatPrintDate,
} from './printFormatters';

const PrintableTourCoverPage = ({
    name,
    client,
    scheduledDate,
    stopCount,
    generatedAt,
    hasUnsavedChanges,
}) => {
    const clientName = formatClientName(client);

    return (
        <section className="print-page flex min-h-[9.8in] flex-col justify-between p-[28px]">
            <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#111827]">
                    Ice Realty Group
                </div>
                <div className="mt-[8px] h-[3px] w-[72px] bg-[#111827]" />
            </div>

            <div>
                <div className="text-[12px] uppercase tracking-[0.12em] text-[#6b7280]">
                    Private showing tour packet
                </div>
                <h1 className="m-0 mt-[12px] max-w-[680px] text-[42px] font-semibold leading-tight text-[#111827]">
                    {name || 'Showing Tour'}
                </h1>
                <div className="mt-[24px] grid max-w-[520px] grid-cols-2 gap-[12px]">
                    {clientName && (
                        <div className="rounded-[10px] border border-[#d1d5db] p-[12px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Client
                            </div>
                            <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                                {clientName}
                            </div>
                        </div>
                    )}
                    {scheduledDate && (
                        <div className="rounded-[10px] border border-[#d1d5db] p-[12px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Scheduled Date
                            </div>
                            <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                                {formatPrintDate(scheduledDate)}
                            </div>
                        </div>
                    )}
                    <div className="rounded-[10px] border border-[#d1d5db] p-[12px]">
                        <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                            Properties
                        </div>
                        <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                            {stopCount}
                        </div>
                    </div>
                    <div className="rounded-[10px] border border-[#d1d5db] p-[12px]">
                        <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                            Generated
                        </div>
                        <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                            {formatGeneratedDate(generatedAt)}
                        </div>
                    </div>
                </div>
                {hasUnsavedChanges && (
                    <div
                        className={
                            'mt-[18px] max-w-[520px] rounded-[10px] border border-[#f59e0b] '
                            + 'bg-[#fffbeb] p-[12px] text-[12px] text-[#92400e]'
                        }
                    >
                        This packet was generated from the current unsaved tour state.
                    </div>
                )}
            </div>

            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">
                Prepared for private client review
            </div>
        </section>
    );
};

PrintableTourCoverPage.propTypes = {
    name: PropTypes.string,
    client: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
    }),
    scheduledDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    stopCount: PropTypes.number.isRequired,
    generatedAt: PropTypes.instanceOf(Date).isRequired,
    hasUnsavedChanges: PropTypes.bool,
};

PrintableTourCoverPage.defaultProps = {
    name: '',
    client: null,
    scheduledDate: null,
    hasUnsavedChanges: false,
};

export default PrintableTourCoverPage;
