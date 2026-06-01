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
    const scheduleLabel = scheduledDate ? formatPrintDate(scheduledDate) : 'Date not set';
    const title = name || 'Showing Tour';

    return (
        <section
            className={
                'print-page flex min-h-[9.8in] flex-col justify-between overflow-hidden '
                + 'rounded-[18px] border border-[#d1d5db] bg-[#f8fafc] p-[0]'
            }
        >
            <div className="bg-[#111827] px-[30px] py-[24px] text-white">
                <div className="flex items-center justify-between gap-[24px]">
                    <img
                        src="/IRG-Main-Logo.png"
                        alt="Ice Realty Group"
                        className="h-[38px] w-auto object-contain print-image"
                    />
                    <div className="text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d1d5db]">
                        Private Client Packet
                    </div>
                </div>
            </div>

            <div className="px-[30px] py-[34px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                    Showing Tour
                </div>
                <h1 className="m-0 mt-[10px] max-w-[680px] text-[40px] font-semibold leading-[1.08] text-[#111827]">
                    {title}
                </h1>
                <div className="mt-[12px] h-[4px] w-[88px] rounded-full bg-[#0f766e]" />

                <div className="mt-[30px] grid max-w-[620px] grid-cols-2 gap-[12px]">
                    {clientName && (
                        <div className="rounded-[12px] border border-[#d1d5db] bg-white p-[14px]">
                            <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                                Client
                            </div>
                            <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                                {clientName}
                            </div>
                        </div>
                    )}
                    <div className="rounded-[12px] border border-[#d1d5db] bg-white p-[14px]">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                            Scheduled Date
                        </div>
                        <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                            {scheduleLabel}
                        </div>
                    </div>
                    <div className="rounded-[12px] border border-[#d1d5db] bg-white p-[14px]">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                            Properties
                        </div>
                        <div className="mt-[4px] text-[14px] font-semibold text-[#111827]">
                            {stopCount}
                        </div>
                    </div>
                    <div className="rounded-[12px] border border-[#d1d5db] bg-white p-[14px]">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
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
                            'mt-[18px] max-w-[620px] rounded-[12px] border border-[#f59e0b] '
                            + 'bg-[#fffbeb] p-[12px] text-[12px] text-[#92400e]'
                        }
                    >
                        This packet was generated from the current unsaved tour state.
                    </div>
                )}
            </div>

            <div className="border-t border-[#d1d5db] bg-white px-[30px] py-[18px]">
                <div
                    className={
                        'flex items-center justify-between gap-[20px] text-[10px] '
                        + 'uppercase tracking-[0.14em] text-[#6b7280]'
                    }
                >
                    <span>Prepared for private client review</span>
                    <span>Ice Realty Group</span>
                </div>
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
