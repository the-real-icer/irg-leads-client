import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

import PrpCard from '../prpCard/PrpCard';
import IrgApi from '../../assets/irgApi';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const AutoComplete = dynamic(
    () => import('primereact/autocomplete').then((mod) => mod.AutoComplete || mod.default),
    { ssr: false },
);
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const limitOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
];

const timeOptions = [
    { label: 'Last 6 hours', value: 6 },
    { label: 'Last 24 hours', value: 24 },
    { label: 'Last 48 hours', value: 48 },
    { label: 'Last 7 days', value: 168 },
];

const countyNames = ['San Diego', 'Orange', 'Riverside', 'Los Angeles'];

const DashboardHotsheet = () => {
    const irgAreas = useSelector((state) => state.irgAreas);

    // Filter controls
    const [selectedArea, setSelectedArea] = useState({ label: 'San Diego County', name: 'San Diego', type: 'county' });
    const [areaInput, setAreaInput] = useState('San Diego County');
    const [limit, setLimit] = useState(10);
    const [hours, setHours] = useState(24);

    // Data
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resultCount, setResultCount] = useState(0);

    // View mode
    const [expanded, setExpanded] = useState(false);
    const scrollRef = useRef(null);

    // Scroll arrow visibility
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Autocomplete
    const [suggestions, setSuggestions] = useState([]);

    // Cache
    const cache = useRef({});
    const debounceTimer = useRef(null);

    // Build autocomplete options from irgAreas Redux state
    const allSuggestions = useMemo(() => {
        const items = [];

        // Add county options
        countyNames.forEach((name) => {
            items.push({ label: `${name} County`, name, type: 'county' });
        });

        // Cities
        if (irgAreas?.City?.length) {
            irgAreas.City.forEach((area) => {
                items.push({ label: area.name, name: area.name, type: 'city' });
            });
        }

        // Neighborhoods
        if (irgAreas?.Neighborhood?.length) {
            irgAreas.Neighborhood.forEach((area) => {
                items.push({ label: area.name, name: area.search_name || area.name, type: 'neighborhood' });
            });
        }

        // ZIP codes
        if (irgAreas?.Zip?.length) {
            irgAreas.Zip.forEach((area) => {
                items.push({ label: area.name, name: area.name, type: 'zip' });
            });
        }

        return items;
    }, [irgAreas]);

    // Build cache key from current params
    const getCacheKey = useCallback((area, areaType, lim, hrs) => {
        return `${areaType}:${area}:${lim}:${hrs}`;
    }, []);

    // Fetch properties from API
    const fetchProperties = useCallback(async (area, areaType, lim, hrs) => {
        const key = getCacheKey(area, areaType, lim, hrs);

        // Check cache
        const cached = cache.current[key];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            setProperties(cached.data);
            setResultCount(cached.data.length);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const days = hrs / 24;
            const areaParam = area.toLowerCase().replace(/\s/g, '-');

            let queryString = `days=${days}&limit=${lim}`;
            if (areaType === 'county') queryString += `&county=${areaParam}`;
            else if (areaType === 'city') queryString += `&city=${areaParam}`;
            else if (areaType === 'zip') queryString += `&zip=${area}`;
            else if (areaType === 'neighborhood') queryString += `&hood=${areaParam}`;

            const response = await IrgApi.get(`/mlsproperties/hotsheet?${queryString}`);
            const results = Array.isArray(response.data?.data?.properties)
                ? response.data.data.properties
                : [];

            // Cache the result
            cache.current[key] = { data: results, timestamp: Date.now() };

            setProperties(results);
            setResultCount(results.length);
        } catch (err) {
            console.error('Hotsheet fetch error:', err.message); // eslint-disable-line
            setError('Failed to load listings.');
        } finally {
            setLoading(false);
        }
    }, [getCacheKey]);

    // Initial fetch
    useEffect(() => {
        fetchProperties(selectedArea.name, selectedArea.type, limit, hours);
    }, []); // eslint-disable-line

    // Fetch when controls change (debounced)
    const triggerFetch = useCallback((area, areaType, lim, hrs) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchProperties(area, areaType, lim, hrs);
        }, 300);
    }, [fetchProperties]);

    // Area selection handler
    const onAreaSelect = useCallback((e) => {
        const item = e.value;
        if (item && item.type) {
            setSelectedArea(item);
            setAreaInput(item.label);
            triggerFetch(item.name, item.type, limit, hours);
        }
    }, [limit, hours, triggerFetch]);

    // Limit change handler
    const onLimitChange = useCallback((e) => {
        setLimit(e.value);
        triggerFetch(selectedArea.name, selectedArea.type, e.value, hours);
    }, [selectedArea, hours, triggerFetch]);

    // Time window change handler
    const onHoursChange = useCallback((e) => {
        setHours(e.value);
        triggerFetch(selectedArea.name, selectedArea.type, limit, e.value);
    }, [selectedArea, limit, triggerFetch]);

    // Autocomplete search
    const searchAreas = useCallback((event) => {
        const query = (event.query || '').toLowerCase().trim();
        if (!query) {
            setSuggestions(allSuggestions.slice(0, 30));
            return;
        }
        const filtered = allSuggestions.filter((item) =>
            item.label.toLowerCase().includes(query)
        );
        setSuggestions(filtered.slice(0, 20));
    }, [allSuggestions]);

    // Autocomplete item template
    const suggestionTemplate = (item) => (
        <div className="dashboard-hotsheet__suggestion">
            <span className="dashboard-hotsheet__suggestion-type">{item.type}</span>
            <span className="dashboard-hotsheet__suggestion-label">{item.label}</span>
        </div>
    );

    // Time window label for empty state
    const timeLabel = timeOptions.find((t) => t.value === hours)?.label || `${hours}h`;

    // Check if a property is "new" (listed within last 6 hours)
    const isNewListing = (property) => {
        if (!property.date_created) return false;
        const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
        return new Date(property.date_created).getTime() > sixHoursAgo;
    };

    // Format time since listing
    const getTimeSinceListed = (dateCreated) => {
        if (!dateCreated) return '';
        const diff = Date.now() - new Date(dateCreated).getTime();
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Listed just now';
        if (diffHours < 24) return `Listed ${diffHours}h ago`;
        if (diffDays === 1) return 'Listed 1 day ago';
        return `Listed ${diffDays} days ago`;
    };

    // Retry handler
    const handleRetry = () => {
        fetchProperties(selectedArea.name, selectedArea.type, limit, hours);
    };

    // Scroll state updater
    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    // Attach scroll listener and update on property/view changes
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || expanded) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        return () => el.removeEventListener('scroll', updateScrollState);
    }, [properties, expanded, updateScrollState]);

    // Scroll handlers — setTimeout ensures state refreshes after smooth scroll completes
    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
            setTimeout(updateScrollState, 350);
        }
    };
    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
            setTimeout(updateScrollState, 350);
        }
    };

    // Render skeleton loading cards
    const renderSkeletons = () => (
        <div className="dashboard-hotsheet__slider">
            <div className="dashboard-hotsheet__slider-track">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="dashboard-hotsheet__skeleton">
                        <div className="dashboard-hotsheet__skeleton-img" />
                        <div className="dashboard-hotsheet__skeleton-body">
                            <div className="dashboard-hotsheet__skeleton-body-line dashboard-hotsheet__skeleton-body-line--price" />
                            <div className="dashboard-hotsheet__skeleton-body-line dashboard-hotsheet__skeleton-body-line--details" />
                            <div className="dashboard-hotsheet__skeleton-body-line dashboard-hotsheet__skeleton-body-line--address" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Card title="Hotsheet Properties" className="dashboard-hotsheet" style={{ width: '100%' }}>
            {/* Controls */}
            <div className="dashboard-hotsheet__controls">
                <AutoComplete
                    value={areaInput}
                    suggestions={suggestions}
                    completeMethod={searchAreas}
                    onChange={(e) => setAreaInput(e.value)}
                    onSelect={onAreaSelect}
                    itemTemplate={suggestionTemplate}
                    field="label"
                    placeholder="Search city, zip, neighborhood..."
                    className="dashboard-hotsheet__search"
                    panelClassName="dashboard-hotsheet__search-panel"
                    delay={100}
                    minLength={0}
                    dropdown
                />
                <Dropdown
                    value={limit}
                    options={limitOptions}
                    onChange={onLimitChange}
                    className="dashboard-hotsheet__dropdown"
                    placeholder="Results"
                />
                <Dropdown
                    value={hours}
                    options={timeOptions}
                    onChange={onHoursChange}
                    className="dashboard-hotsheet__dropdown"
                />
                {!loading && !error && (
                    <span className="dashboard-hotsheet__count">
                        {resultCount} {resultCount === 1 ? 'property' : 'properties'}
                    </span>
                )}
            </div>

            {/* Content */}
            {loading && properties.length === 0 ? (
                renderSkeletons()
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))' }}>
                    <i className="pi pi-exclamation-triangle" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block', color: 'hsl(var(--danger))' }}></i>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{error}</p>
                    <button
                        onClick={handleRetry}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '6px',
                            border: '1px solid hsl(var(--primary))',
                            background: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            ) : properties.length > 0 ? (
                <>
                    {expanded ? (
                        <div className="dashboard-hotsheet__grid">
                            {properties.map((property) => (
                                <div key={property._id || property.mls_number} className="dashboard-hotsheet__card-wrapper">
                                    {isNewListing(property) && (
                                        <span className="dashboard-hotsheet__new-badge">NEW</span>
                                    )}
                                    <PrpCard property={property} handleOpenMapDialog={() => {}} />
                                    <div className="dashboard-hotsheet__card-meta">
                                        {property.property_sub_type && (
                                            <span className="dashboard-hotsheet__card-meta-type">
                                                {property.property_sub_type}
                                            </span>
                                        )}
                                        {property.date_created && (
                                            <span className="dashboard-hotsheet__card-meta-time">
                                                {getTimeSinceListed(property.date_created)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="dashboard-hotsheet__slider">
                            <button
                                className="dashboard-hotsheet__slider-arrow dashboard-hotsheet__slider-arrow--left"
                                onClick={scrollLeft}
                                aria-label="Scroll left"
                                style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
                            >
                                <i className="pi pi-chevron-left" />
                            </button>
                            <div className="dashboard-hotsheet__slider-track" ref={scrollRef}>
                                {properties.map((property) => (
                                    <div key={property._id || property.mls_number} className="dashboard-hotsheet__card-wrapper">
                                        {isNewListing(property) && (
                                            <span className="dashboard-hotsheet__new-badge">NEW</span>
                                        )}
                                        <PrpCard property={property} handleOpenMapDialog={() => {}} />
                                        <div className="dashboard-hotsheet__card-meta">
                                            {property.property_sub_type && (
                                                <span className="dashboard-hotsheet__card-meta-type">
                                                    {property.property_sub_type}
                                                </span>
                                            )}
                                            {property.date_created && (
                                                <span className="dashboard-hotsheet__card-meta-time">
                                                    {getTimeSinceListed(property.date_created)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="dashboard-hotsheet__slider-arrow dashboard-hotsheet__slider-arrow--right"
                                onClick={scrollRight}
                                aria-label="Scroll right"
                                style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
                            >
                                <i className="pi pi-chevron-right" />
                            </button>
                        </div>
                    )}
                    {properties.length > 3 && (
                        <div className="dashboard-hotsheet__toggle">
                            <button className="dashboard-hotsheet__toggle-btn" onClick={() => setExpanded(!expanded)}>
                                <i className={`pi ${expanded ? 'pi-chevron-up' : 'pi-th-large'}`} />
                                {expanded ? 'Collapse' : 'Show All'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))' }}>
                    <i className="pi pi-home" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        No new listings found in {selectedArea.label || areaInput} in the {timeLabel.toLowerCase()}.
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>Try expanding your search area or time window.</p>
                </div>
            )}
        </Card>
    );
};

export default DashboardHotsheet;
