const EXACT_TIMESTAMP_FORMAT = {
    dateStyle: 'medium',
    timeStyle: 'short',
};

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en-US', {
    numeric: 'auto',
});

const formatRelativeTime = (diffMs) => {
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    if (Math.abs(diffMinutes) < 1) {
        return 'Just now';
    }

    if (Math.abs(diffMinutes) < 60) {
        return RELATIVE_TIME_FORMATTER.format(-diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return RELATIVE_TIME_FORMATTER.format(-diffHours, 'hour');
};

const formatExactTime = (date) => date.toLocaleString('en-US', EXACT_TIMESTAMP_FORMAT);

const formatAgentLastLogin = (value) => {
    if (!value) {
        return {
            primary: 'Never logged in',
            secondary: null,
            isNever: true,
        };
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return {
            primary: 'Never logged in',
            secondary: null,
            isNever: true,
        };
    }

    const now = new Date();
    const diffMs = now - parsed;
    const isRecent = diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
    const exactTime = formatExactTime(parsed);

    if (isRecent) {
        return {
            primary: formatRelativeTime(diffMs),
            secondary: exactTime,
            isNever: false,
        };
    }

    return {
        primary: exactTime,
        secondary: null,
        isNever: false,
    };
};

export default formatAgentLastLogin;
