// React & NextJS
import { useSelector } from 'react-redux';

// Components
import MainLayout from '../../components/layout/MainLayout';
import GoogleConnectButton from '../../components/GoogleConnectButton';

const Profile = () => {
    const agent = useSelector((state) => state.agent);

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '0.5rem',
                    }}>
                        Agent Settings
                    </h1>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                        Manage your integrations and preferences
                    </p>
                </div>

                {/* Agent Info */}
                <div style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '1rem' }}>
                        Profile Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Name</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Email</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Phone</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.phone || 'N/A'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>DRE License</div>
                            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>{agent?.dre_license || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Google Integration */}
                <GoogleConnectButton />
            </div>
        </MainLayout>
    );
};

export default Profile;
