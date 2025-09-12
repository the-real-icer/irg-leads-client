// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

// Redux
import {
    useSelector,
    // useDispatch
} from 'react-redux';

import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SplitButton } from 'primereact/splitbutton';
import { Toast } from 'primereact/toast';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import PrpCard from '../../components/prpCard/PrpCard';

const Lead = () => {
    // __________________Redux State______________________\\
    const leads = useSelector((state) => state.allLeadsPage);

    const [lead, setLead] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [category, setCategory] = useState('');

    const router = useRouter();

    const leadId = router.asPath.replace(/\/lead\//, '');

    useEffect(() => {
        const ld = leads.filter((l) => {
            if (l._id === leadId) {
                return l;
            }
            return null;
        });
        setLead(ld[0]);
        return () => setLead({});
    }, []); // eslint-disable-line

    useEffect(() => {
        if (lead?.backend_profile?.lead_category) {
            const cat =
                lead.backend_profile.lead_category.charAt(0).toUpperCase() +
                lead.backend_profile.lead_category.slice(1);
            setCategory(cat);
        }
    }, [lead]);

    const formatDate = (val) => {
        const properDate = new Date(val);

        return properDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const toast = useRef(null);

    const updateStatus = (newStatus) => {
        toast.current.show({
            severity: 'success',
            summary: 'Updated',
            detail: `New Status: ${newStatus}`,
        });
    };

    const items = [
        {
            label: 'New',
            command: () => updateStatus('New'),
        },
        {
            label: 'Nuture',
            command: () => updateStatus('Nurture'),
        },
        {
            label: 'Watch',
            command: () => updateStatus('Watch'),
        },
        {
            label: 'Qualify',
            command: () => updateStatus('Qualify'),
        },
        {
            label: 'Pending',
            command: () => updateStatus('Pending'),
        },
        {
            label: 'Closed',
            command: () => updateStatus('Closed'),
        },
        {
            label: 'Hot',
            command: () => updateStatus('Hot'),
        },
        {
            label: 'Archive',
            command: () => updateStatus('Archive'),
        },
        {
            label: 'Trash',
            command: () => updateStatus('Trash'),
        },
    ];

    return (
        <MainLayout>
            <Toast ref={toast}></Toast>
            <Card className="my-3 mx-3">
                <div className="flex flex-column">
                    {/* <Card>{lead.first_name}</Card> */}
                    <div>
                        <Avatar
                            icon="pi pi-user"
                            className="mr-2"
                            size="xlarge"
                            shape="circle"
                            style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                        />
                        <h2>
                            {lead.first_name} {lead.last_name}
                        </h2>
                        <h6>{lead.phone_number}</h6>
                        <h6>{lead.email}</h6>
                        <SplitButton
                            label={category}
                            model={items}
                            className="p-button-raised mr-2 mb-2"
                        ></SplitButton>
                    </div>
                    <Divider />
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Communication">
                            <div className="flex flex-column">
                                {lead?.agent_actions?.length &&
                                    lead?.agent_actions.map((item) => (
                                        <div
                                            className="surface-card p-4 shadow-2 border-round"
                                            key={item._id}
                                        >
                                            <div className="mb-3 flex align-items-center justify-content-between">
                                                <div className="flex align-items-center">
                                                    <i className="pi pi-map-marker text-500 mr-2 text-xl"></i>
                                                    <span className="text-xl font-medium text-900">
                                                        {item.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                style={{ height: ' 150px' }}
                                                className="border-2 border-dashed surface-border"
                                            >
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </TabPanel>
                        <TabPanel header="Viewed Homes">
                            <ScrollPanel style={{ width: '100%', height: '525px' }}>
                                <div className="flex flex-row flex-wrap">
                                    {lead?.viewed_homes?.length &&
                                        lead?.viewed_homes.map((home) => (
                                            <PrpCard
                                                key={home._id}
                                                property={home.property_viewed}
                                            />
                                        ))}
                                </div>
                            </ScrollPanel>
                        </TabPanel>
                        <TabPanel header="User Saved Searches">
                            <div>
                                {lead?.saved_searches?.length &&
                                    lead?.saved_searches.map((search) => (
                                        <div key={search.searchId} style={{ marginBottom: '2rem' }}>
                                            <h6>Search Name: {search.searchName}</h6>
                                            <p>Search Frequency: {search.searchFrequency}</p>
                                        </div>
                                    ))}
                            </div>
                        </TabPanel>
                        <TabPanel header="User Searches Performed">
                            <div>
                                {lead?.searches_performed?.length &&
                                    lead?.searches_performed.map((search) => (
                                        <div
                                            key={search.date_viewed}
                                            style={{ marginBottom: '2rem' }}
                                        >
                                            <h6>Area Name: {search.searchTerm}</h6>
                                            <p>Search Type: {search.searchType}</p>
                                            <p>Date Searched: {formatDate(search.date_viewed)}</p>
                                        </div>
                                    ))}
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </Card>
        </MainLayout>
    );
};

export default Lead;
