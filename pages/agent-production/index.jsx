import { useState, useCallback } from 'react';

import dynamic from 'next/dynamic';
// Redux
import { useSelector } from 'react-redux';

// Dynamically import Third Party Components
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import PrpCard from '../../components/prpCard/PrpCard';
import MapDialog from '@/components/Shared/MapDialog';
import showToast from '../../utils/showToast';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../../assets/irgApi';
import agentProduction from '../../utils/agentProduction';

const AgentProduction = () => {
    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // ________________Component State_________________\\
    const [selectedProduction, setSelectedProduction] = useState(null);
    const [value, setValue] = useState('');
    const [results, setResults] = useState(null);
    const [showMapDialog, setShowMapDialog] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState({});

    const cities = [
        { name: 'Active Listings', code: 'NY' },
        { name: 'Current Year', code: 'RM' },
        { name: 'Last Year', code: 'LDN' },
        // { name: 'Istanbul', code: 'IST' },
        // { name: 'Paris', code: 'PRS' },
    ];

    // Open Map Dialog
    const handleOpenMapDialog = (property) => {
        setShowMapDialog(true);
        setSelectedProperty(property);
    };

    // Close Map Dialog
    const handleCloseMapDialog = () => {
        setShowMapDialog(false);
        setSelectedProperty({});
    };

    const onProductionChange = useCallback((e) => {
        setSelectedProduction(e.value);
    }, []);

    const onFormSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (!value || !selectedProduction?.name) {
                showToast(
                    'error',
                    'Agent name and production type are required.',
                    'Validation Error',
                    'top-left',
                );
                return;
            }

            if (results) {
                setResults(null);
            }

            let url = '';
            switch (selectedProduction.name) {
                case 'Active Listings':
                    url = '/brokers/get-agent-current-listings';
                    break;
                case 'Current Year':
                    url = '/brokers/get-agent-current-production';
                    break;
                case 'Last Year':
                    url = '/brokers/get-agent-previous-year-production';
                    break;
                default:
                    showToast('error', 'Invalid production type.', 'Error', 'top-left');
                    return;
            }

            const agentName = value.replace(/\s/g, '%20');

            try {
                const res = await IrgApi.get(`${url}?agentName=${agentName}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (res.data.data) {
                    setResults(res.data.data);
                    showToast(
                        'success',
                        'Production data fetched successfully!',
                        'Success',
                        'top-left',
                    );
                } else {
                    showToast('warn', 'No production data found.', 'No Results', 'top-left');
                }
            } catch (error) {
                showToast(
                    'error',
                    error.message || 'Failed to fetch production data.',
                    'Error',
                    'top-left',
                );
            }
        },
        [value, selectedProduction, results, isLoggedIn],
    );

    return (
        <MainLayout>
            <MapDialog
                showMapDialog={showMapDialog}
                handleCloseMapDialog={handleCloseMapDialog}
                property={selectedProperty}
            />
            <div style={{ padding: '1.5rem' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Agent Production
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                        Search for agent production data and view property listings
                    </p>
                </div>

                {/* Search Form */}
                <Card
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <form onSubmit={onFormSubmit}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 1fr',
                                gap: '1rem',
                                alignItems: 'end',
                            }}
                        >
                            <div>
                                <label
                                    htmlFor="agent-name"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Agent Name
                                </label>
                                <InputText
                                    id="agent-name"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Enter agent name"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="production-type"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Production Type
                                </label>
                                <Dropdown
                                    id="production-type"
                                    value={selectedProduction}
                                    options={cities}
                                    onChange={onProductionChange}
                                    optionLabel="name"
                                    placeholder="Select Production"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <Button
                                label="Search"
                                icon="pi pi-search"
                                type="submit"
                                style={{
                                    padding: '0.75rem 2rem',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                }}
                            />
                        </div>
                    </form>
                </Card>

                {/* Results Summary */}
                {results && (
                    <Card
                        title="Production Summary"
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: '0.875rem',
                                        color: '#6c757d',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    Number of Listings
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}>
                                    {results.numberOfListings}
                                </div>
                            </div>
                            {results?.numberOfBuyers && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            color: '#6c757d',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        Number of Buyers
                                    </div>
                                    <div
                                        style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}
                                    >
                                        {results.numberOfBuyers}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div
                                    style={{
                                        fontSize: '0.875rem',
                                        color: '#6c757d',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    Listing Production Volume
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}>
                                    {agentProduction(results.listedHomes)}
                                </div>
                            </div>
                            {results?.numberOfBuyers && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            color: '#6c757d',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        Buyer Production Volume
                                    </div>
                                    <div
                                        style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50' }}
                                    >
                                        {agentProduction(results.soldHomes)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Property Cards - Listed Homes */}
                {results && results.listedHomes && results.listedHomes.length > 0 && (
                    <Card
                        title={`Listed Properties (${results.listedHomes.length})`}
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <ScrollPanel style={{ width: '100%', height: '600px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1.5rem',
                                    padding: '1rem 0',
                                }}
                            >
                                {results.listedHomes.map((property) => (
                                    <PrpCard
                                        key={property._id || property.mls_number}
                                        property={property}
                                        handleOpenMapDialog={handleOpenMapDialog}
                                    />
                                ))}
                            </div>
                        </ScrollPanel>
                    </Card>
                )}

                {/* Property Cards - Sold Homes */}
                {results && results.soldHomes && results.soldHomes.length > 0 && (
                    <Card
                        title={`Sold Properties (${results.soldHomes.length})`}
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <ScrollPanel style={{ width: '100%', height: '600px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1.5rem',
                                    padding: '1rem 0',
                                }}
                            >
                                {results.soldHomes.map((property) => (
                                    <PrpCard
                                        key={property._id || property.mls_number}
                                        property={property}
                                        handleOpenMapDialog={handleOpenMapDialog}
                                    />
                                ))}
                            </div>
                        </ScrollPanel>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
};

export default AgentProduction;
