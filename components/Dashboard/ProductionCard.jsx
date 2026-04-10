const ProductionCard = ({ icon, value, label, format }) => {
    const displayValue = () => {
        const n = value || 0;
        if (format === 'currency') {
            if (n === 0) return '$0';
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
            return `$${n.toLocaleString()}`;
        }
        return n.toLocaleString();
    };

    return (
        <div
            className="production-card"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
        >
            <div style={{ fontSize: '22px', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'hsl(var(--foreground))', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    {displayValue()}
                </div>
                <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '5px', lineHeight: 1.3 }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

export default ProductionCard;
