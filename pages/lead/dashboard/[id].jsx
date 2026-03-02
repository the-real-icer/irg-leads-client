import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

import MainLayout from '../../../components/layout/MainLayout';
import LeadDashboard from '../../../components/LeadDashboard/LeadDashboard';
import getLeadDisplayName from '../../../utils/getLeadDisplayName';

const LeadDashboardPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const leads = useSelector((state) => state.allLeadsPage.leads);

    const lead = leads?.find((l) => l._id === id);
    const leadName = lead ? getLeadDisplayName(lead) : '';

    if (!id || !isLoggedIn) return null;

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Button
                        icon="pi pi-arrow-left"
                        label="Back to Lead"
                        className="p-button-text"
                        onClick={() => router.push(`/lead/${id}`)}
                    />
                    {leadName && (
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                            {leadName}&apos;s Dashboard
                        </h2>
                    )}
                </div>
                <LeadDashboard leadId={id} isLoggedIn={isLoggedIn} />
            </div>
        </MainLayout>
    );
};

export default LeadDashboardPage;
