const getDateUrgency = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (dateOnly.getTime() === today.getTime()) {
        return {
            label: 'Today',
            badge: 'Today',
            bg: 'hsl(var(--danger) / 0.12)',
            border: 'hsl(var(--danger) / 0.35)',
            textColor: 'hsl(var(--danger))',
            dateColor: 'hsl(var(--danger))',
            badgeBg: 'hsl(var(--danger) / 0.2)',
            badgeColor: 'hsl(var(--danger))',
        };
    }

    if (dateOnly.getTime() === tomorrow.getTime()) {
        return {
            label: 'Tomorrow',
            badge: 'Tomorrow',
            bg: 'hsl(var(--warning) / 0.12)',
            border: 'hsl(var(--warning) / 0.35)',
            textColor: 'hsl(var(--warning))',
            dateColor: 'hsl(var(--warning))',
            badgeBg: 'hsl(var(--warning) / 0.2)',
            badgeColor: 'hsl(var(--warning))',
        };
    }

    if (dateOnly < nextWeek) {
        return {
            label: formatted,
            badge: 'Soon',
            bg: 'hsl(var(--warning) / 0.08)',
            border: 'hsl(var(--warning) / 0.25)',
            textColor: 'hsl(var(--foreground))',
            dateColor: 'hsl(var(--warning))',
            badgeBg: 'hsl(var(--warning) / 0.15)',
            badgeColor: 'hsl(var(--warning))',
        };
    }

    return {
        label: formatted,
        badge: null,
        bg: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        textColor: 'hsl(var(--foreground))',
        dateColor: 'hsl(var(--foreground-muted))',
        badgeBg: null,
        badgeColor: null,
    };
};

export default getDateUrgency;
