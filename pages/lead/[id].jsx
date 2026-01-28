// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Redux
import {
    useSelector,
    // useDispatch
} from 'react-redux';

// Dynamically Import Third Party Components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const TabView = dynamic(() => import('primereact/tabview').then((mod) => mod.TabView), {
    ssr: false,
});
const TabPanel = dynamic(() => import('primereact/tabview').then((mod) => mod.TabPanel), {
    ssr: false,
});
const Avatar = dynamic(() => import('primereact/avatar').then((mod) => mod.Avatar), {
    ssr: false,
});
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});
const SplitButton = dynamic(() => import('primereact/splitbutton').then((mod) => mod.SplitButton), {
    ssr: false,
});
const Toast = dynamic(() => import('primereact/toast').then((mod) => mod.Toast), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const Badge = dynamic(() => import('primereact/badge').then((mod) => mod.Badge), { ssr: false });
const Chip = dynamic(() => import('primereact/chip').then((mod) => mod.Chip), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import PrpCard from '../../components/prpCard/PrpCard';

const Lead = () => {
    // __________________Redux State______________________\\
    const leads = useSelector((state) => state.allLeadsPage);

    const [lead, setLead] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [category, setCategory] = useState('');
    const [showViewedHomesDialog, setShowViewedHomesDialog] = useState(false);
    const [showFavoritedHomesDialog, setShowFavoritedHomesDialog] = useState(false);
    const [showSavedSearchesDialog, setShowSavedSearchesDialog] = useState(false);
    const [showSearchHistoryDialog, setShowSearchHistoryDialog] = useState(false);

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
            label: 'Nurture',
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

    const getStatusSeverity = (status) => {
        const statusMap = {
            new: 'info',
            nurture: 'secondary',
            watch: 'warning',
            qualify: 'success',
            pending: 'warning',
            closed: 'danger',
            hot: 'danger',
            archive: null,
            trash: null,
        };
        return statusMap[status?.toLowerCase()] || 'info';
    };

    const getInitials = () => {
        const first = lead?.first_name?.[0] || '';
        const last = lead?.last_name?.[0] || '';
        return `${first}${last}`.toUpperCase();
    };

    return (
        <MainLayout>
            <Toast ref={toast} position="top-right" />
            <div className="lead-profile-page">
                {/* Header Section */}
                <div className="lead-profile-header">
                    <Card className="lead-profile-header-card">
                        <div className="lead-profile-header-content">
                            <div className="lead-profile-avatar-section">
                                <Avatar
                                    label={getInitials()}
                                    className="lead-profile-avatar"
                                    size="xlarge"
                                    shape="circle"
                                />
                                <div className="lead-profile-info">
                                    <div className="lead-profile-name-row">
                                        <h2 className="lead-profile-name">
                                            {lead?.first_name} {lead?.last_name}
                                        </h2>
                                        <Chip
                                            label={category}
                                            className={`lead-status-chip status-${lead?.backend_profile?.lead_category}`}
                                        />
                                    </div>
                                    <div className="lead-profile-contact">
                                        <div className="contact-item">
                                            <i className="pi pi-phone"></i>
                                            <span>{lead?.phone_number || 'No phone'}</span>
                                        </div>
                                        <div className="contact-item">
                                            <i className="pi pi-envelope"></i>
                                            <span>{lead?.email || 'No email'}</span>
                                        </div>
                                        {lead?.user_location?.city && (
                                            <div className="contact-item">
                                                <i className="pi pi-map-marker"></i>
                                                <span>
                                                    {lead.user_location.city}
                                                    {lead.user_location.state &&
                                                        `, ${lead.user_location.state}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lead-profile-meta">
                                        <span>
                                            <strong>Lead Type:</strong>{' '}
                                            {lead?.backend_profile?.lead_type || 'Not set'}
                                        </span>
                                        <span className="meta-divider">•</span>
                                        <span>
                                            <strong>Source:</strong>{' '}
                                            {lead?.backend_profile?.lead_source || 'Unknown'}
                                        </span>
                                        <span className="meta-divider">•</span>
                                        <span>
                                            <strong>Created:</strong>{' '}
                                            {lead?.date_created
                                                ? formatDate(lead.date_created)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="lead-profile-actions">
                                <Button
                                    icon="pi pi-phone"
                                    label="Call"
                                    className="p-button-rounded p-button-success mr-2"
                                    onClick={() =>
                                        window.open(`tel:${lead?.phone_number}`, '_self')
                                    }
                                />
                                <Button
                                    icon="pi pi-envelope"
                                    label="Email"
                                    className="p-button-rounded p-button-info mr-2"
                                    onClick={() => window.open(`mailto:${lead?.email}`, '_self')}
                                />
                                <SplitButton
                                    label="Change Status"
                                    model={items}
                                    className="p-button-rounded"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Statistics Cards */}
                <div className="lead-profile-stats">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowViewedHomesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-home stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.viewed_homes?.length || 0}
                                        </span>
                                        <span className="stat-label">Homes Viewed</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowFavoritedHomesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-heart stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.favorited_homes?.length || 0}
                                        </span>
                                        <span className="stat-label">Favorited Homes</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowSearchHistoryDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-search stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.searches_performed?.length || 0}
                                        </span>
                                        <span className="stat-label">Searches Performed</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowSavedSearchesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-bookmark stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.saved_searches?.length || 0}
                                        </span>
                                        <span className="stat-label">Saved Searches</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="lead-profile-content">
                    <Card>
                        <TabView
                            activeIndex={activeIndex}
                            onTabChange={(e) => setActiveIndex(e.index)}
                        >
                            <TabPanel header="Activity & Notes" leftIcon="pi pi-comments mr-2">
                                <div className="activity-timeline">
                                    {lead?.agent_actions?.length ? (
                                        lead.agent_actions.map((item, index) => (
                                            <div className="activity-item" key={item._id || index}>
                                                <div className="activity-marker"></div>
                                                <div className="activity-card">
                                                    <div className="activity-header">
                                                        <div className="activity-type">
                                                            <i className="pi pi-comment"></i>
                                                            <span>{item.type}</span>
                                                        </div>
                                                        <span className="activity-date">
                                                            {item.date
                                                                ? formatDate(item.date)
                                                                : 'Recent'}
                                                        </span>
                                                    </div>
                                                    <div className="activity-content">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="pi pi-inbox"></i>
                                            <p>No activity recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
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
                                <div className="saved-searches-list">
                                    {lead?.saved_searches?.length ? (
                                        lead.saved_searches.map((search, index) => (
                                            <Card
                                                key={search.searchId || index}
                                                className="search-card"
                                            >
                                                <div className="search-content">
                                                    <div className="search-header">
                                                        <i className="pi pi-bookmark"></i>
                                                        <h4>{search.searchName}</h4>
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
                                    )}
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
                        </TabView>
                    </Card>
                </div>

                {/* Viewed Homes Dialog */}
                <Dialog
                    header="Viewed Homes"
                    visible={showViewedHomesDialog}
                    style={{ width: '90vw', maxWidth: '1200px' }}
                    onHide={() => setShowViewedHomesDialog(false)}
                    maximizable
                >
                    <div className="dialog-properties-grid">
                        {lead?.viewed_homes?.filter((home) => home?.property_viewed).length > 0 ? (
                            lead.viewed_homes
                                .filter((home) => home?.property_viewed)
                                .map((home) => (
                                    <PrpCard key={home._id} property={home.property_viewed} />
                                ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-home"></i>
                                <p>No homes viewed yet</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Favorited Homes Dialog */}
                <Dialog
                    header="Favorited Homes"
                    visible={showFavoritedHomesDialog}
                    style={{ width: '90vw', maxWidth: '1200px' }}
                    onHide={() => setShowFavoritedHomesDialog(false)}
                    maximizable
                >
                    <div className="dialog-properties-grid">
                        {lead?.favorited_homes?.filter((home) => home?.property_favorited).length >
                        0 ? (
                            lead.favorited_homes
                                .filter((home) => home?.property_favorited)
                                .map((home) => (
                                    <PrpCard key={home._id} property={home.property_favorited} />
                                ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-heart"></i>
                                <p>No favorited homes</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Search History Dialog */}
                <Dialog
                    header="Search History"
                    visible={showSearchHistoryDialog}
                    style={{ width: '80vw', maxWidth: '900px' }}
                    onHide={() => setShowSearchHistoryDialog(false)}
                    maximizable
                >
                    <div className="search-history-list">
                        {lead?.searches_performed?.length ? (
                            lead.searches_performed.map((search, index) => (
                                <Card key={search.date_viewed || index} className="history-card">
                                    <div className="history-content">
                                        <div className="history-main">
                                            <i className="pi pi-search"></i>
                                            <div className="history-details">
                                                <h4>{search.searchTerm}</h4>
                                                <Badge value={search.searchType} severity="info" />
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
                </Dialog>

                {/* Saved Searches Dialog */}
                <Dialog
                    header="Saved Searches"
                    visible={showSavedSearchesDialog}
                    style={{ width: '80vw', maxWidth: '900px' }}
                    onHide={() => setShowSavedSearchesDialog(false)}
                    maximizable
                >
                    <div className="saved-searches-list">
                        {lead?.saved_searches?.length ? (
                            lead.saved_searches.map((search, index) => (
                                <Card key={search.searchId || index} className="search-card">
                                    <div className="search-content">
                                        <div className="search-header">
                                            <i className="pi pi-bookmark"></i>
                                            <h4>{search.searchName}</h4>
                                        </div>
                                        <p className="search-frequency">
                                            <strong>Frequency:</strong> {search.searchFrequency}
                                        </p>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-bookmark"></i>
                                <p>No saved searches</p>
                            </div>
                        )}
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default Lead;
