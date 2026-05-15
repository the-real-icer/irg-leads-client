const bannerStyles = {
    warning: 'border-warning/30 bg-warning/10 text-foreground',
    danger: 'border-danger/30 bg-danger/10 text-foreground',
};

const dismissButtonClassName =
    'rounded-[8px] p-[4px] text-foreground/60 transition-colors hover:text-foreground '
    + 'focus:outline-none focus:ring-2 focus:ring-ring';

const getBannerCopy = (error) => {
    if (!error) return null;

    if (error.kind === 'not-configured' || /not configured/i.test(error.message || '')) {
        return {
            tone: 'warning',
            message: 'Ask Doc is connected in the CRM, but the Doc Bridge is not configured yet.',
        };
    }

    if (error.kind === 'unavailable') {
        return {
            tone: 'warning',
            message: 'Doc is taking longer than expected. Try again in a minute.',
        };
    }

    return {
        tone: 'danger',
        message: error.message || 'Ask Doc could not complete that request.',
    };
};

const AskDocErrorBanner = ({ error, onDismiss }) => {
    const banner = getBannerCopy(error);
    if (!banner) return null;

    const iconClassName = `pi ${
        banner.tone === 'warning' ? 'pi-exclamation-triangle' : 'pi-times-circle'
    } mt-[2px] text-[15px]`;

    return (
        <div
            className={`rounded-[12px] border px-[16px] py-[12px] shadow-sm ${bannerStyles[banner.tone]}`}
            role="status"
        >
            <div className="flex items-start gap-[12px]">
                <i className={iconClassName} aria-hidden="true" />
                <p className="m-0 flex-1 text-[14px] leading-[1.45]">{banner.message}</p>
                {onDismiss && (
                    <button
                        type="button"
                        className={dismissButtonClassName}
                        aria-label="Dismiss Ask Doc alert"
                        onClick={onDismiss}
                    >
                        <i className="pi pi-times text-[12px]" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AskDocErrorBanner;
