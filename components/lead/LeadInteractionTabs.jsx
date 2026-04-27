import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import PrpCard from '../prpCard/PrpCard';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const TabView = dynamic(() => import('primereact/tabview').then((mod) => mod.TabView), {
    ssr: false,
});
const TabPanel = dynamic(() => import('primereact/tabview').then((mod) => mod.TabPanel), {
    ssr: false,
});
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});
const Badge = dynamic(() => import('primereact/badge').then((mod) => mod.Badge), { ssr: false });
const Accordion = dynamic(() => import('primereact/accordion').then((mod) => mod.Accordion), {
    ssr: false,
});
const AccordionTab = dynamic(() => import('primereact/accordion').then((mod) => mod.AccordionTab), {
    ssr: false,
});

const LeadInteractionTabs = ({
    lead,
    emails,
    loadingEmails,
    activeIndex,
    onTabChange,
    formatDate,
}) => (
    <div className="lead-profile-content">
        <Card>
            <TabView
                activeIndex={activeIndex}
                onTabChange={onTabChange}
            >
                <TabPanel header="Viewed Homes" leftIcon="pi pi-home mr-2">
                    <ScrollPanel className="viewed-homes-scroll">
                        <div className="properties-grid">
                            {lead?.viewed_homes?.filter((home) => home?.property_viewed)
                                .length > 0 ? (
                                lead.viewed_homes
                                    .filter((home) => home?.property_viewed)
                                    .map((home) => (
                                        <PrpCard
                                            key={home._id}
                                            property={home.property_viewed}
                                        />
                                    ))
                            ) : (
                                <div className="empty-state">
                                    <i className="pi pi-home"></i>
                                    <p>No homes viewed yet</p>
                                </div>
                            )}
                        </div>
                    </ScrollPanel>
                </TabPanel>
                <TabPanel header="Saved Searches" leftIcon="pi pi-bookmark mr-2">
                    {lead?.email_preferences?.saved_searches === false && (
                        <div style={{
                            marginBottom: '12px',
                            display: 'inline-block',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'hsl(var(--danger) / 0.1)',
                            color: 'hsl(var(--danger))',
                        }}>
                            Opted Out of Property Alerts
                        </div>
                    )}
                    <div className="saved-searches-list">
                        {(() => {
                            const allSearches = [
                                ...(lead?.saved_searches || []),
                                ...(lead?.e_alerts || []),
                            ];
                            return allSearches.length ? (
                                allSearches.map((search, index) => (
                                    <Card
                                        key={search._id || search.searchId || index}
                                        className="search-card"
                                    >
                                        <div className="search-content">
                                            <div className="search-header">
                                                <i className="pi pi-bookmark"></i>
                                                <h4>{search.searchName || 'Unnamed Search'}</h4>
                                            </div>
                                            <p className="search-frequency">
                                                <strong>Frequency:</strong>{' '}
                                                {search.searchFrequency}
                                            </p>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="pi pi-bookmark"></i>
                                    <p>No saved searches</p>
                                </div>
                            );
                        })()}
                    </div>
                </TabPanel>
                <TabPanel header="Search History" leftIcon="pi pi-search mr-2">
                    <div className="search-history-list">
                        {lead?.searches_performed?.length ? (
                            lead.searches_performed.map((search, index) => (
                                <Card
                                    key={search.date_viewed || index}
                                    className="history-card"
                                >
                                    <div className="history-content">
                                        <div className="history-main">
                                            <i className="pi pi-search"></i>
                                            <div className="history-details">
                                                <h4>{search.searchTerm}</h4>
                                                <Badge
                                                    value={search.searchType}
                                                    severity="info"
                                                />
                                            </div>
                                        </div>
                                        <span className="history-date">
                                            {formatDate(search.date_viewed)}
                                        </span>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-search"></i>
                                <p>No search history</p>
                            </div>
                        )}
                    </div>
                </TabPanel>
                <TabPanel header="Email History" leftIcon="pi pi-envelope mr-2">
                    <div className="email-history-container">
                        {loadingEmails ? (
                            <div className="empty-state">
                                <i className="pi pi-spin pi-spinner"></i>
                                <p>Loading emails...</p>
                            </div>
                        ) : emails.length > 0 ? (
                            <Accordion>
                                {emails.map((email, index) => (
                                    <AccordionTab
                                        key={email.id || index}
                                        header={
                                            <div className="email-header">
                                                <div className="email-header-left">
                                                    <i
                                                        className={`pi ${
                                                            email.direction === 'sent'
                                                                ? 'pi-send'
                                                                : 'pi-inbox'
                                                        }`}
                                                    ></i>
                                                    <span className="email-subject">
                                                        {email.subject || '(No Subject)'}
                                                    </span>
                                                </div>
                                                <span className="email-date">
                                                    {formatDate(email.date)}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <div className="email-content">
                                            <div className="email-meta">
                                                <div className="email-meta-row">
                                                    <strong>From:</strong>{' '}
                                                    <span>{email.from}</span>
                                                </div>
                                                <div className="email-meta-row">
                                                    <strong>To:</strong>{' '}
                                                    <span>{email.to}</span>
                                                </div>
                                                <div className="email-meta-row">
                                                    <strong>Date:</strong>{' '}
                                                    <span>
                                                        {new Date(
                                                            email.date
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="email-body"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(email.body || email.textBody || ''),
                                                }}
                                            />
                                        </div>
                                    </AccordionTab>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-envelope"></i>
                                <p>No email history found</p>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </TabView>
        </Card>
    </div>
);

export default LeadInteractionTabs;
