const DashboardTabBar = ({ activeTab, onTabChange }) => (
    <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '1.5rem',
        borderBottom: '2px solid hsl(var(--border))',
    }}>
        <button
            type="button"
            onClick={() => onTabChange('my')}
            style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'my' ? '600' : '400',
                color: activeTab === 'my' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'my' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            My Production
        </button>
        <button
            type="button"
            onClick={() => onTabChange('brokerage')}
            style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'brokerage' ? '600' : '400',
                color: activeTab === 'brokerage' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'brokerage' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            Brokerage
        </button>
    </div>
);

export default DashboardTabBar;
