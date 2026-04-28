const getTextValue = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const buildAttributionBadge = (lead) => {
    const attribution = lead?.backend_profile?.attribution;

    if (!attribution || typeof attribution !== 'object') return null;

    const utmSource = getTextValue(attribution.utm_source);
    const utmMedium = getTextValue(attribution.utm_medium);
    const utmCampaign = getTextValue(attribution.utm_campaign);
    const firstLandingPage = getTextValue(attribution.first_landing_page);
    const currentPage = getTextValue(attribution.current_page);
    const referrer = getTextValue(attribution.referrer);

    let label = '';

    if (utmSource && utmCampaign) {
        label = `${utmSource} / ${utmCampaign}`;
    } else if (utmSource) {
        label = utmSource;
    } else if (referrer) {
        label = 'Referral';
    } else if (firstLandingPage || currentPage) {
        label = 'Website';
    }

    if (!label) return null;

    const detailParts = [
        utmMedium ? `Medium: ${utmMedium}` : null,
        utmCampaign ? `Campaign: ${utmCampaign}` : null,
        firstLandingPage ? `Landing: ${firstLandingPage}` : null,
        !firstLandingPage && currentPage ? `Page: ${currentPage}` : null,
    ].filter(Boolean);

    return {
        label,
        title: detailParts.length > 0 ? detailParts.join(' | ') : label,
    };
};

const LeadAttributionBadge = ({ lead, compact = false, style = {} }) => {
    const badge = buildAttributionBadge(lead);

    if (!badge) return null;

    return (
        <span
            title={badge.title}
            style={{
                alignItems: 'center',
                background: 'hsl(var(--primary) / 0.1)',
                border: '1px solid hsl(var(--primary) / 0.25)',
                borderRadius: '999px',
                color: 'hsl(var(--primary))',
                display: 'inline-flex',
                fontSize: compact ? '11px' : '12px',
                fontWeight: '700',
                gap: '4px',
                lineHeight: 1.2,
                maxWidth: compact ? '100%' : '180px',
                minWidth: 0,
                padding: compact ? '2px 7px' : '3px 9px',
                verticalAlign: 'middle',
                ...style,
            }}
        >
            <i className="pi pi-chart-line" style={{ flexShrink: 0, fontSize: '10px' }} />
            <span
                style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {badge.label}
            </span>
        </span>
    );
};

export default LeadAttributionBadge;
