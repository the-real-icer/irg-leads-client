import ProductionCard from './ProductionCard';

const ProductionGrid = ({ metrics, loading, error, onRetry }) => {
    if (loading) {
        return (
            <div className="production-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'hsl(var(--muted))', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ width: '60%', height: '22px', borderRadius: '4px', background: 'hsl(var(--muted))', marginBottom: '8px' }} />
                            <div style={{ width: '80%', height: '13px', borderRadius: '4px', background: 'hsl(var(--muted))' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--foreground-muted))' }}>
                <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', color: 'hsl(var(--danger))' }}></i>
                <p style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Failed to load transaction data</p>
                <button
                    onClick={onRetry}
                    style={{ padding: '0.4rem 1.25rem', borderRadius: '6px', border: '1px solid hsl(var(--primary))', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="production-grid">
            <ProductionCard icon="🏠" value={metrics?.closedCountYTD ?? 0} label="YTD Closed Transactions" format="number" />
            <ProductionCard icon="💰" value={metrics?.closedVolumeYTD} label="YTD Closed Volume" format="currency" />
            <ProductionCard icon="📋" value={metrics?.currentTransactions ?? 0} label="Transactions In Escrow" format="number" />
            <ProductionCard icon="📊" value={metrics?.escrowVolume} label="Volume In Escrow" format="currency" />
            <ProductionCard icon="✅" value={metrics?.earnedCommissionsYTD} label="Commissions Earned YTD" format="currency" />
            <ProductionCard icon="⏳" value={metrics?.pendingCommissions} label="Commissions In Escrow" format="currency" />
        </div>
    );
};

export default ProductionGrid;
