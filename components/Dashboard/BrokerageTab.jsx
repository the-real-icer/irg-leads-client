import dynamic from 'next/dynamic';
import LeadSourceConversionCard from './LeadSourceConversionCard';
import ProductionGrid from './ProductionGrid';
import UpcomingDatesList from './UpcomingDatesList';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const BrokerageTab = ({
    stats,
    upcomingDates,
    loading,
    leadSourceReport,
    leadSourceReportLoading,
    leadSourceReportError,
}) => {
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                <p style={{ marginTop: '1rem' }}>Loading brokerage data...</p>
            </div>
        );
    }

    return (
        <>
            <Card title="Brokerage Production" style={{ marginBottom: '1.5rem' }}>
                {stats ? (
                    <div>
                        <ProductionGrid metrics={stats} />
                        <UpcomingDatesList
                            title="Upcoming Important Dates — All Agents"
                            dates={upcomingDates}
                            loading={false}
                            showAgentName
                        />
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                        No brokerage data available
                    </div>
                )}
            </Card>
            <LeadSourceConversionCard
                data={leadSourceReport}
                loading={leadSourceReportLoading}
                error={leadSourceReportError}
            />
        </>
    );
};

export default BrokerageTab;
