'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

import PrintableAgentCard, { hasPrintableAgentDetails } from './PrintableAgentCard';
import {
    formatAddressLine,
    formatCityStateZip,
    formatHoaFee,
    formatLotSize,
    formatNumber,
    formatPrice,
    formatStories,
    getPrintablePropertyImages,
    hasPrintableCoords,
} from './printFormatters';
import { formatStopTime, getStatusMeta } from '../ScheduleShowings/stopStatus';

const getFirstValue = (property, fields) => {
    const field = fields.find((key) => {
        const value = property?.[key];
        return value !== undefined && value !== null && String(value).trim() !== '';
    });
    return field ? property[field] : '';
};

const Stat = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="rounded-[10px] border border-[#d1d5db] bg-[#f9fafb] px-[12px] py-[9px]">
            <div className="text-[9px] uppercase tracking-[0.12em] text-[#6b7280]">
                {label}
            </div>
            <div className="mt-[2px] text-[16px] font-semibold leading-tight text-[#111827]">
                {value}
            </div>
        </div>
    );
};

Stat.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Stat.defaultProps = {
    value: '',
};

const DetailRow = ({ label, value, longText }) => {
    if (!value) return null;
    return (
        <div
            className={[
                'print-avoid-break grid gap-[10px] border-b border-[#e5e7eb] py-[7px]',
                longText ? 'grid-cols-[128px_1fr]' : 'grid-cols-[128px_1fr]',
            ].join(' ')}
        >
            <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                {label}
            </div>
            <div
                className={[
                    'text-[11px] font-medium text-[#111827]',
                    longText ? 'leading-[1.45] text-[#374151]' : '',
                ].join(' ')}
            >
                {value}
            </div>
        </div>
    );
};

DetailRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longText: PropTypes.bool,
};

DetailRow.defaultProps = {
    value: '',
    longText: false,
};

const NoPhotoBlock = () => (
    <div
        className={
            'flex h-full min-h-[120px] items-center justify-center rounded-[10px] '
            + 'border border-[#d1d5db] bg-[#f3f4f6] text-[11px] font-semibold '
            + 'uppercase tracking-[0.12em] text-[#6b7280]'
        }
    >
        No photo available
    </div>
);

const PhotoTile = ({ src, alt, primary }) => {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <NoPhotoBlock />;

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className={[
                'print-image h-full w-full rounded-[10px] border border-[#d1d5db] object-cover',
                primary ? 'min-h-[260px]' : 'min-h-[125px]',
            ].join(' ')}
        />
    );
};

PhotoTile.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    primary: PropTypes.bool,
};

PhotoTile.defaultProps = {
    src: '',
    primary: false,
};

const Section = ({ title, children, className }) => (
    <div
        className={[
            'print-avoid-break rounded-[12px] border border-[#d1d5db] bg-white px-[14px] py-[11px]',
            className,
        ]
            .filter(Boolean)
            .join(' ')}
    >
        <h3 className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111827]">
            {title}
        </h3>
        <div className="mt-[7px]">{children}</div>
    </div>
);

const StatusPill = ({ label }) => {
    if (!label) return null;
    return (
        <span
            className={
                'inline-flex items-center rounded-full border border-[#0f766e] '
                + 'bg-[#ecfdf5] px-[9px] py-[3px] text-[9px] font-semibold '
                + 'uppercase tracking-[0.08em] text-[#0f766e]'
            }
        >
            {label}
        </span>
    );
};

StatusPill.propTypes = {
    label: PropTypes.string,
};

StatusPill.defaultProps = {
    label: '',
};

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

Section.defaultProps = {
    className: '',
};

const PrintablePropertySheet = ({
    property,
    stopNumber,
    showingStatus,
    scheduledTime,
    note,
    agentContact,
}) => {
    const photos = getPrintablePropertyImages(property);
    const addressLine = formatAddressLine(property);
    const cityStateZip = formatCityStateZip(property);
    const price = formatPrice(property);
    const timeLabel = formatStopTime(scheduledTime);
    const statusMeta = getStatusMeta(showingStatus);
    const mapUnavailable = !hasPrintableCoords(property);
    const hasAgentDetails = hasPrintableAgentDetails(agentContact);
    const beds = formatNumber(property?.bedrooms);
    const baths = formatNumber(property?.bathrooms);
    const sqft = formatNumber(property?.sqft_raw || property?.sqft);
    const bedroomLabel = beds ? `${beds} bd` : '';
    const bathroomLabel = baths ? `${baths} ba` : '';
    const sqftLabel = sqft ? `${sqft} sqft` : '';
    const propertyType = property?.property_sub_type || property?.property_type;
    const hoaFee = formatHoaFee(property);
    const listingAgentName = getFirstValue(property, [
        'list_agent_name',
        'list_agent_full_name',
        'listing_agent_name',
        'agent_name',
    ]);
    const listingAgentPhone = getFirstValue(property, [
        'list_agent_phone',
        'list_agent_direct_phone',
        'listing_agent_phone',
        'agent_phone',
        'list_agent_mobile_phone',
    ]);
    const listingOffice = getFirstValue(property, [
        'list_office_name',
        'listing_office_name',
        'office_name',
        'brokerage_name',
    ]);
    const listingAgentEmail = getFirstValue(property, [
        'list_agent_email',
        'listing_agent_email',
        'agent_email',
    ]);
    const showingInstructions = getFirstValue(property, [
        'showing_instructions',
        'showing_instruction',
        'showing_remarks',
    ]);
    const privateRemarks = getFirstValue(property, ['private_remarks', 'private_remark']);
    const hasTourDetails = Boolean(showingStatus || timeLabel || note || mapUnavailable);
    const detailRows = [
        { label: 'Property Type', value: propertyType },
        { label: 'Stories', value: formatStories(property) },
        { label: 'Lot Size', value: formatLotSize(property) },
        { label: 'MLS Number', value: property?.mls_number },
        { label: 'HOA Fee', value: hoaFee },
    ].filter((row) => row.value);
    const accessRows = [
        { label: 'Occupant Type', value: property?.occupant_type },
        { label: 'Listing Agent', value: listingAgentName },
        { label: 'Listing Contact', value: listingAgentPhone || listingOffice },
        { label: 'Listing Agent Email', value: listingAgentEmail },
        { label: 'Showing Instructions', value: showingInstructions, longText: true },
        { label: 'Private Remarks', value: privateRemarks, longText: true },
    ].filter(Boolean).filter((row) => row.value);

    return (
        <section className="print-page flex min-h-[9.8in] flex-col p-[18px] text-[#111827]">
            <header className="flex items-center justify-between border-b border-[#d1d5db] pb-[10px]">
                <img
                    src="/IRG-Main-Logo.png"
                    alt="Ice Realty Group"
                    className="h-[32px] w-auto object-contain print-image"
                />
                <div className="flex items-center gap-[8px] text-right">
                    <StatusPill label={showingStatus ? statusMeta.label : ''} />
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">
                        {stopNumber ? `Showing Stop ${stopNumber}` : 'Property Listing Sheet'}
                    </div>
                </div>
            </header>

            <div className="mt-[12px] grid grid-cols-[1.5fr_1fr] gap-[10px]">
                <PhotoTile src={photos[0]} alt={addressLine} primary />
                <div className="grid grid-rows-2 gap-[10px]">
                    <PhotoTile src={photos[1]} alt={`${addressLine} secondary photo`} />
                    <PhotoTile src={photos[2]} alt={`${addressLine} additional photo`} />
                </div>
            </div>

            <section
                className={
                    'print-avoid-break mt-[12px] rounded-[14px] border border-[#d1d5db] '
                    + 'bg-[#f8fafc] p-[14px]'
                }
            >
                <div className="flex items-start justify-between gap-[18px]">
                    <div className="min-w-0">
                        <h2 className="m-0 text-[24px] font-semibold leading-tight text-[#111827]">
                            {addressLine}
                        </h2>
                        {cityStateZip && (
                            <div className="mt-[3px] text-[12px] text-[#4b5563]">
                                {cityStateZip}
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 text-right text-[23px] font-semibold text-[#111827]">
                        {price || 'Price not available'}
                    </div>
                </div>
                <div
                    className={
                        'mt-[8px] flex flex-wrap gap-x-[12px] gap-y-[3px] '
                        + 'text-[11px] font-semibold text-[#374151]'
                    }
                >
                    {[bedroomLabel, bathroomLabel, sqftLabel, propertyType]
                        .filter(Boolean)
                        .map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                </div>
                <div className="mt-[12px] grid grid-cols-4 gap-[8px]">
                    <Stat label="Beds" value={beds} />
                    <Stat label="Baths" value={baths} />
                    <Stat label="Sq Ft" value={sqft} />
                    <Stat label="Year Built" value={property?.year_built} />
                </div>
            </section>

            {detailRows.length > 0 && (
                <Section title="Additional Details" className="mt-[10px]">
                    <div className="grid grid-cols-2 gap-x-[20px]">
                        {detailRows.map((row) => (
                            <DetailRow key={row.label} label={row.label} value={row.value} />
                        ))}
                    </div>
                </Section>
            )}

            {hasTourDetails && (
                <Section title="Showing Plan" className="mt-[10px]">
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-[8px]">
                        <div className="rounded-[10px] bg-[#f8fafc] px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Time
                            </div>
                            <div className="mt-[2px] text-[12px] font-semibold text-[#111827]">
                                {timeLabel || 'Not set'}
                            </div>
                        </div>
                        <div className="rounded-[10px] bg-[#f8fafc] px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Status
                            </div>
                            <div className="mt-[2px] text-[12px] font-semibold text-[#111827]">
                                {showingStatus ? statusMeta.label : 'Pending'}
                            </div>
                        </div>
                        <div className="rounded-[10px] bg-[#f8fafc] px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Map
                            </div>
                            <div className="mt-[2px] text-[12px] font-semibold text-[#111827]">
                                {mapUnavailable ? 'Needs review' : 'Available'}
                            </div>
                        </div>
                    </div>
                    {note && (
                        <div className="mt-[8px] rounded-[10px] border border-[#e5e7eb] bg-white px-[10px] py-[8px]">
                            <div className="text-[9px] uppercase tracking-[0.08em] text-[#6b7280]">
                                Tour Note
                            </div>
                            <div className="mt-[2px] text-[11px] leading-[1.45] text-[#374151]">
                                {note}
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {accessRows.length > 0 && (
                <Section title="Agent / Access / Listing Info" className="mt-[10px]">
                    <div className="grid grid-cols-2 gap-x-[20px]">
                        {accessRows.map((row) => (
                            <DetailRow
                                key={row.label}
                                label={row.label}
                                value={row.value}
                                longText={row.longText}
                            />
                        ))}
                    </div>
                </Section>
            )}

            {hasAgentDetails && (
                <PrintableAgentCard
                    agent={agentContact}
                    className="mt-[10px]"
                />
            )}

            <div className="print-avoid-break mt-auto pt-[10px]">
                <div className="rounded-[12px] border border-dashed border-[#9ca3af] p-[10px]">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                        Client Notes
                    </div>
                    <div className="mt-[12px] space-y-[26px]">
                        <div className="h-[26px] border-b border-[#d1d5db]" />
                        <div className="h-[26px] border-b border-[#d1d5db]" />
                        <div className="h-[26px] border-b border-[#d1d5db]" />
                        <div className="h-[26px] border-b border-[#d1d5db]" />
                    </div>
                </div>
            </div>
        </section>
    );
};

PrintablePropertySheet.propTypes = {
    property: PropTypes.shape({
        mls_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        address: PropTypes.string,
        unit_number: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip_code: PropTypes.string,
        price: PropTypes.string,
        price_raw: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft_raw: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        year_built: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        property_sub_type: PropTypes.string,
        property_type: PropTypes.string,
        levels: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lot_size_acres: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lot_size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lot_sqft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        association_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        hoa_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        occupant_type: PropTypes.string,
        list_agent_name: PropTypes.string,
        list_agent_email: PropTypes.string,
        showing_instructions: PropTypes.string,
        private_remarks: PropTypes.string,
        coordinates: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        listing_pictures: PropTypes.arrayOf(PropTypes.shape({
            media_url: PropTypes.string,
            large_url: PropTypes.string,
            thumb_webp: PropTypes.string,
        })),
        listing_pics: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ]),
    }),
    stopNumber: PropTypes.number,
    showingStatus: PropTypes.string,
    scheduledTime: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    note: PropTypes.string,
    agentContact: PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
        title: PropTypes.string,
        display_email: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        dre_license: PropTypes.string,
    }),
};

PrintablePropertySheet.defaultProps = {
    property: {},
    stopNumber: null,
    showingStatus: '',
    scheduledTime: null,
    note: '',
    agentContact: null,
};

export default PrintablePropertySheet;
