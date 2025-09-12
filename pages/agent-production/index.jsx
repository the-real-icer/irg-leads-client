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

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
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
    const cities = [
        { name: 'Active Listings', code: 'NY' },
        { name: 'Current Year', code: 'RM' },
        { name: 'Last Year', code: 'LDN' },
        // { name: 'Istanbul', code: 'IST' },
        // { name: 'Paris', code: 'PRS' },
    ];

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
            <div>AgentProduction</div>
            <div className="flex flex-row m-auto">
                <form onSubmit={onFormSubmit}>
                    <InputText value={value} onChange={(e) => setValue(e.target.value)} />
                    <Dropdown
                        value={selectedProduction}
                        options={cities}
                        onChange={onProductionChange}
                        optionLabel="name"
                        placeholder="Select Production"
                        // required
                    />
                    <Button label="Submit" type="submit" />
                </form>
            </div>
            <div className="flex flex-row">
                {results && (
                    <div>
                        <h2>Number of Listings: {results.numberOfListings}</h2>
                        {results?.numberOfBuyers && (
                            <h2>Number of Buyers: {results.numberOfBuyers}</h2>
                        )}
                        <h2>Listing Production Volume: {agentProduction(results.listedHomes)}</h2>
                        {results?.numberOfBuyers && (
                            <h2>Buyer Production Volume: {agentProduction(results.soldHomes)}</h2>
                        )}
                        {/* <h2>
                            Total Volume:{' '}
                            {agentProduction([...results.listedHomes, ...results.soldHomes])}
                        </h2> */}
                    </div>
                )}
                {/* {results?.length && selectedProduction === 'Active Listings' && (
                    <div>
                        <h2>Number of Listings: {results.numberOfListings}</h2>
                        <h2>Listing Production Volume: {agentProduction(results.listedHomes)}</h2>
                    </div>
                )} */}
            </div>
        </MainLayout>
    );
};

export default AgentProduction;
