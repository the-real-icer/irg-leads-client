import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const LeadStatsGrid = ({
    lead,
    averagePrice,
    lastVisitLabel,
    areasSearchedLabel,
    lastContactedLabel,
    onViewedHomesClick,
    onFavoritedHomesClick,
    onSearchHistoryClick,
    onSavedSearchesClick,
}) => (
    <div className="lead-profile-stats">
        <div className="grid">
            <div className="col-12 md:col-3">
                <Card
                    className="stat-card clickable"
                    onClick={onViewedHomesClick}
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
                    onClick={onFavoritedHomesClick}
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
                    onClick={onSearchHistoryClick}
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
                    onClick={onSavedSearchesClick}
                >
                    <div className="stat-content">
                        <i className="pi pi-bookmark stat-icon"></i>
                        <div className="stat-details">
                            <span className="stat-value">
                                {(lead?.saved_searches?.length || 0) + (lead?.e_alerts?.length || 0)}
                            </span>
                            <span className="stat-label">Saved Searches</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>

        {/* Second Row of Stats */}
        <div className="grid" style={{ marginTop: '1rem' }}>
            <div className="col-12 md:col-3">
                <Card className="stat-card">
                    <div className="stat-content">
                        <i className="pi pi-dollar stat-icon"></i>
                        <div className="stat-details">
                            <span className="stat-value">{averagePrice}</span>
                            <span className="stat-label">Average Price</span>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="stat-card">
                    <div className="stat-content">
                        <i className="pi pi-clock stat-icon"></i>
                        <div className="stat-details">
                            <span className="stat-value">
                                {lastVisitLabel}
                            </span>
                            <span className="stat-label">Last Visit</span>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="stat-card">
                    <div className="stat-content">
                        <i className="pi pi-map-marker stat-icon"></i>
                        <div className="stat-details">
                            <span className="stat-value" style={{ fontSize: '1.2rem' }}>
                                {areasSearchedLabel}
                            </span>
                            <span className="stat-label">Areas Searched</span>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="stat-card">
                    <div className="stat-content">
                        <i className="pi pi-comment stat-icon"></i>
                        <div className="stat-details">
                            <span className="stat-value">{lastContactedLabel}</span>
                            <span className="stat-label">Last Contacted</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
);

export default LeadStatsGrid;
