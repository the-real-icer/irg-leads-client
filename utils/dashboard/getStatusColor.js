const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'hot':
            return { bg: '#ffcdd2', text: '#c63737' };
        case 'qualify':
            return { bg: '#c8e6c9', text: '#256029' };
        case 'watch':
            return { bg: '#feedaf', text: '#8a5340' };
        case 'nurture':
            return { bg: '#eccfff', text: '#694382' };
        case 'new':
            return { bg: '#b3e5fc', text: '#23547b' };
        case 'closed':
            return { bg: '#ffd8b2', text: '#805b36' };
        default:
            return { bg: 'hsl(var(--muted))', text: 'hsl(var(--foreground))' };
    }
};

export default getStatusColor;
