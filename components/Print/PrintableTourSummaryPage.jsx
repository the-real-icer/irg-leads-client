import PropTypes from 'prop-types';

import { FALLBACK_IMAGE_LIGHT } from '../../utils/propertyImageFallback';
import { formatStopTime, getStatusMeta } from '../ScheduleShowings/stopStatus';
import PrintableAgentCard, { hasPrintableAgentDetails } from './PrintableAgentCard';
import {
    formatAddressLine,
    formatBedsBathsSqft,
    formatCityStateZip,
    formatClientName,
    formatPrice,
    formatPrintDate,
    getPrimaryPropertyImage,
    hasPrintableCoords,
} from './printFormatters';

const PrintableTourSummaryPage = ({
    name,
    client,
    agent,
    scheduledDate,
    stops,
}) => {
    const clientName = formatClientName(client);
    const hasAgentDetails = hasPrintableAgentDetails(agent);
    const stopsWithTimes = stops.filter((stop) => formatStopTime(stop.scheduled_time)).length;
    const stopsWithoutMaps = stops.filter((stop) => !hasPrintableCoords(stop)).length;
    const handleImageError = (event) => {
        const image = event.currentTarget;
        if (image.src !== FALLBACK_IMAGE_LIGHT) {
            image.src = FALLBACK_IMAGE_LIGHT;
        }
    };

    return (
        <section className="print-page p-[18px]">
            <div
                style={hasAgentDetails ? { display: 'grid' } : undefined}
                className={[
                    hasAgentDetails ? 'grid-cols-[1fr_220px] gap-[18px]' : '',
                    'rounded-[14px] border border-[#d1d5db] bg-[#f8fafc] p-[16px]',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                        Tour Summary
                    </div>
                    <h2 className="m-0 mt-[4px] text-[26px] font-semibold leading-[1.15] text-[#111827]">
                        {name || 'Showing Tour'}
                    </h2>
                    <div
                        className={
                            'mt-[10px] flex flex-wrap gap-x-[18px] gap-y-[4px] '
                            + 'text-[12px] text-[#4b5563]'
                        }
                    >
                        {clientName && <span>Client: {clientName}</span>}
                        {scheduledDate && <span>Date: {formatPrintDate(scheduledDate)}</span>}
                        <span>{stops.length} properties</span>
                    </div>
                    <div className="mt-[12px] max-w-[460px] grid-cols-3 gap-[8px]" style={{ display: 'grid' }}>
                        <div className="rounded-[10px] border border-[#d1d5db] bg-white px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Timed Stops
                            </div>
                            <div className="text-[15px] font-semibold text-[#111827]">
                                {stopsWithTimes}
                            </div>
                        </div>
                        <div className="rounded-[10px] border border-[#d1d5db] bg-white px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Needs Map
                            </div>
                            <div className="text-[15px] font-semibold text-[#111827]">
                                {stopsWithoutMaps}
                            </div>
                        </div>
                        <div className="rounded-[10px] border border-[#d1d5db] bg-white px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Packet Pages
                            </div>
                            <div className="text-[15px] font-semibold text-[#111827]">
                                {stops.length + 2}
                            </div>
                        </div>
                    </div>
                </div>
                {hasAgentDetails && <PrintableAgentCard agent={agent} compact />}
            </div>

            <div className="mt-[16px]">
                <h3 className="m-0 text-[14px] font-semibold text-[#111827]">
                    Ordered Property List
                </h3>
                <div className="mt-[10px] flex flex-col gap-[8px]">
                    {stops.map((stop, index) => {
                        const statusMeta = getStatusMeta(stop.status);
                        const timeLabel = formatStopTime(stop.scheduled_time);
                        return (
                            <div
                                key={stop.mls_number || `${index}-${stop.address}`}
                                style={{ display: 'grid' }}
                                className={
                                    'print-avoid-break grid-cols-[34px_64px_1fr_auto] '
                                    + 'items-center gap-[10px] rounded-[10px] border '
                                    + 'border-[#d1d5db] bg-white p-[8px]'
                                }
                            >
                                <div
                                    className={
                                        'flex h-[28px] w-[28px] items-center justify-center '
                                        + 'rounded-full bg-[#111827] text-[12px] '
                                        + 'font-semibold text-white'
                                    }
                                >
                                    {index + 1}
                                </div>
                                <img
                                    src={getPrimaryPropertyImage(stop)}
                                    onError={handleImageError}
                                    alt=""
                                    className="print-image h-[48px] w-[64px] rounded-[6px] object-cover"
                                />
                                <div>
                                    <div className="flex items-start justify-between gap-[12px]">
                                        <div className="min-w-0">
                                            <div className="text-[13px] font-semibold text-[#111827]">
                                                {formatAddressLine(stop)}
                                            </div>
                                            <div className="text-[11px] text-[#6b7280]">
                                                {[
                                                    formatCityStateZip(stop),
                                                    formatBedsBathsSqft(stop),
                                                ]
                                                    .filter(Boolean)
                                                    .join(' | ')}
                                            </div>
                                        </div>
                                        {formatPrice(stop) && (
                                            <div className="shrink-0 text-[12px] font-semibold text-[#111827]">
                                                {formatPrice(stop)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-[4px] flex flex-wrap gap-[6px] text-[10px] text-[#4b5563]">
                                        <span>{statusMeta.label}</span>
                                        {timeLabel && <span>{timeLabel}</span>}
                                        {!hasPrintableCoords(stop) && <span>Map unavailable</span>}
                                    </div>
                                </div>
                                <div className="text-right text-[10px] text-[#6b7280]">
                                    {stop.mls_number ? `MLS #${stop.mls_number}` : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="print-avoid-break mt-[18px] rounded-[12px] border border-[#d1d5db] p-[14px]">
                <h3 className="m-0 text-[14px] font-semibold text-[#111827]">
                    Route Reference
                </h3>
                <p className="mt-[6px] text-[11px] text-[#4b5563]">
                    The interactive map remains available in the CRM. This packet keeps the canonical
                    stop order as the print-safe route reference without requiring a static maps API.
                </p>
                <ol
                    style={{ display: 'grid' }}
                    className={
                        'mt-[10px] grid-cols-2 gap-x-[22px] gap-y-[5px] '
                        + 'pl-[18px] text-[11px] text-[#374151]'
                    }
                >
                    {stops.map((stop, index) => (
                        <li key={stop.mls_number || `${index}-${stop.address}`}>
                            {formatAddressLine(stop)}
                            {!hasPrintableCoords(stop) ? ' (map unavailable)' : ''}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="print-avoid-break mt-[14px] rounded-[12px] border border-[#d1d5db] p-[14px]">
                <h3 className="m-0 text-[14px] font-semibold text-[#111827]">
                    Tour Notes
                </h3>
                <div className="mt-[10px] grid-cols-2 gap-[10px]" style={{ display: 'grid' }}>
                    <div className="h-[90px] rounded-[8px] border border-dashed border-[#9ca3af]" />
                    <div className="h-[90px] rounded-[8px] border border-dashed border-[#9ca3af]" />
                </div>
            </div>
        </section>
    );
};

PrintableTourSummaryPage.propTypes = {
    name: PropTypes.string,
    client: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
    }),
    agent: PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
        title: PropTypes.string,
        display_email: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }),
    scheduledDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    stops: PropTypes.arrayOf(PropTypes.shape({
        mls_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        address: PropTypes.string,
        status: PropTypes.string,
        scheduled_time: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    })).isRequired,
};

PrintableTourSummaryPage.defaultProps = {
    name: '',
    client: null,
    agent: null,
    scheduledDate: null,
};

export default PrintableTourSummaryPage;
