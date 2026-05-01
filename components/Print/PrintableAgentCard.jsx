import { useState } from 'react';
import PropTypes from 'prop-types';

const getAgentName = (agent) => {
    if (!agent) return '';
    const name = agent.name || agent.fullName;
    if (name) return name;
    return `${agent.first_name || ''} ${agent.last_name || ''}`.trim();
};

const getInitials = (name, email) => {
    const source = name || email || '';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return source ? source[0].toUpperCase() : '?';
};

const getAgentPhoto = (agent) => (
    agent?.image
    || agent?.photo
    || agent?.headshot
    || agent?.profile_photo
    || ''
);

const getAgentTitle = (agent) => (
    agent?.title
    || agent?.brokerage
    || agent?.company
    || agent?.office_name
    || ''
);

export const hasPrintableAgentDetails = (agent) => Boolean(
    getAgentName(agent)
    || agent?.display_email
    || agent?.email
    || agent?.phone
    || agent?.phone_number
    || getAgentTitle(agent)
    || getAgentPhoto(agent),
);

const PrintableAgentCard = ({ agent, compact, className }) => {
    const [photoFailed, setPhotoFailed] = useState(false);
    const name = getAgentName(agent);
    const email = agent?.display_email || agent?.email || '';
    const phone = agent?.phone || agent?.phone_number || '';
    const title = getAgentTitle(agent);
    const dreLicense = agent?.dre_license || agent?.dreLicense || agent?.license || '';
    const photo = photoFailed ? '' : getAgentPhoto(agent);
    const initials = getInitials(name, email);

    if (!hasPrintableAgentDetails(agent)) return null;

    if (!compact) {
        return (
            <div
                className={[
                    'print-avoid-break rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] p-[14px]',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className="flex items-center justify-between gap-[18px]">
                    <div className="flex min-w-0 items-center gap-[12px]">
                        {photo ? (
                            <img
                                src={photo}
                                alt={name || 'Agent'}
                                onError={() => setPhotoFailed(true)}
                                className={
                                    'h-[58px] w-[58px] rounded-full border border-[#d1d5db] '
                                    + 'object-cover print-image'
                                }
                            />
                        ) : (
                            <div
                                className={
                                    'flex h-[58px] w-[58px] items-center justify-center rounded-full '
                                    + 'border border-[#d1d5db] bg-[#111827] text-[16px] '
                                    + 'font-semibold text-white'
                                }
                            >
                                {initials}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-[9px] uppercase tracking-[0.14em] text-[#6b7280]">
                                Presented By
                            </div>
                            <div className="mt-[2px] text-[16px] font-semibold leading-tight text-[#111827]">
                                {name || 'Agent Contact'}
                            </div>
                            {title && (
                                <div className="mt-[2px] text-[11px] text-[#4b5563]">
                                    {title}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[210px] text-right text-[11px] leading-[1.5] text-[#374151]">
                        {phone && <div>{phone}</div>}
                        {email && <div className="break-all">{email}</div>}
                        {dreLicense && (
                            <div className="mt-[2px] text-[10px] uppercase tracking-[0.08em] text-[#6b7280]">
                                DRE {dreLicense}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={[
                'print-avoid-break rounded-[10px] border border-[#d1d5db] bg-white',
                compact ? 'p-[10px]' : 'p-[12px]',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex items-center gap-[10px]">
                {photo ? (
                    <img
                        src={photo}
                        alt={name || 'Agent'}
                        onError={() => setPhotoFailed(true)}
                        className={
                            'h-[48px] w-[48px] rounded-full border border-[#d1d5db] '
                            + 'object-cover print-image'
                        }
                    />
                ) : (
                    <div
                        className={
                            'flex h-[48px] w-[48px] items-center justify-center rounded-full '
                            + 'border border-[#d1d5db] bg-[#111827] text-[14px] '
                            + 'font-semibold text-white'
                        }
                    >
                        {initials}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b7280]">
                        Agent Contact
                    </div>
                    <div className="mt-[2px] truncate text-[13px] font-semibold text-[#111827]">
                        {name || 'Agent Contact'}
                    </div>
                    {title && (
                        <div className="mt-[1px] truncate text-[10px] text-[#4b5563]">
                            {title}
                        </div>
                    )}
                </div>
            </div>
            {(phone || email) && (
                <div className="mt-[8px] flex flex-col gap-[2px] text-[10px] text-[#374151]">
                    {phone && <div>{phone}</div>}
                    {email && <div className="break-all">{email}</div>}
                </div>
            )}
        </div>
    );
};

PrintableAgentCard.propTypes = {
    agent: PropTypes.shape({
        name: PropTypes.string,
        fullName: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        image: PropTypes.string,
        photo: PropTypes.string,
        headshot: PropTypes.string,
        profile_photo: PropTypes.string,
        title: PropTypes.string,
        brokerage: PropTypes.string,
        company: PropTypes.string,
        office_name: PropTypes.string,
        display_email: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        phone_number: PropTypes.string,
        dre_license: PropTypes.string,
        dreLicense: PropTypes.string,
        license: PropTypes.string,
    }),
    compact: PropTypes.bool,
    className: PropTypes.string,
};

PrintableAgentCard.defaultProps = {
    agent: null,
    compact: false,
    className: '',
};

export default PrintableAgentCard;
