import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import IrgApi from '../../assets/irgApi';
import PrpCard from '../prpCard/PrpCard';
import MapDialog from '../Shared/MapDialog';
import PropertySearchMap from './PropertySearchMap';
import SearchToolbar from './SearchToolbar';
import MobileFilterDrawer from './MobileFilterDrawer';
import MoreFiltersDialog from './MoreFiltersDialog';
import SaveSearchDialog from './SaveSearchDialog';
import useGoogleMaps from '../../utils/useGoogleMaps';
import { extractPathFromGMPolygon, pathToGeoJSON } from '../../utils/polygonUtils';

const EMPTY_FILTERS = {
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    maxBaths: '',
    minSqft: 0,
    maxSqft: 0,
    minLotSize: '',
    maxLotSize: '',
    minYearBuilt: '',
    maxYearBuilt: '',
    minGarageSpaces: '',
    maxGarageSpaces: '',
    singleStory: false,
    hasPool: false,
    includeSeniorCommunities: false,
    singleFamily: false,
    townHomes: false,
    condos: false,
    statuses: ['Active'],
    minCloseDate: '',
    maxCloseDate: '',
};

const normalizeStatuses = (rawStatuses) => {
    if (Array.isArray(rawStatuses)) {
        const normalized = rawStatuses
            .flatMap((status) => (typeof status === 'string' ? status.split(',') : []))
            .map((status) => status.trim())
            .filter(Boolean);

        return normalized.length > 0 ? normalized : ['Active'];
    }

    if (typeof rawStatuses === 'string') {
        const normalized = rawStatuses
            .split(',')
            .map((status) => status.trim())
            .filter(Boolean);

        return normalized.length > 0 ? normalized : ['Active'];
    }

    return ['Active'];
};

const getDefaultSoldDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);

    return {
        minCloseDate: start.toISOString().split('T')[0],
        maxCloseDate: end.toISOString().split('T')[0],
    };
};

const normalizeFiltersForApply = (rawFilters) => {
    const normalized = {
        ...EMPTY_FILTERS,
        ...rawFilters,
        statuses: normalizeStatuses(rawFilters?.statuses),
    };

    if (!normalized.statuses.includes('Closed')) {
        normalized.minCloseDate = '';
        normalized.maxCloseDate = '';
        return normalized;
    }

    if (!normalized.minCloseDate && !normalized.maxCloseDate) {
        const defaultRange = getDefaultSoldDateRange();
        normalized.minCloseDate = defaultRange.minCloseDate;
        normalized.maxCloseDate = defaultRange.maxCloseDate;
    }

    return normalized;
};

const areAreaNameListsEqual = (left = [], right = []) =>
    left.length === right.length && left.every((value, index) => value === right[index]);

const serializeFiltersToParams = (f) => {
    const params = {};
    if (f.minPrice) params.minPrice = f.minPrice;
    if (f.maxPrice) params.maxPrice = f.maxPrice;
    if (f.minBeds) params.minBeds = f.minBeds;
    if (f.maxBeds) params.maxBeds = f.maxBeds;
    if (f.minBaths) params.minBaths = f.minBaths;
    if (f.maxBaths) params.maxBaths = f.maxBaths;
    if (f.minSqft > 0) params.minSqft = f.minSqft;
    if (f.maxSqft > 0) params.maxSqft = f.maxSqft;
    if (f.minLotSize) params.minLotSize = f.minLotSize;
    if (f.maxLotSize) params.maxLotSize = f.maxLotSize;
    if (f.minYearBuilt) params.minYearBuilt = f.minYearBuilt;
    if (f.maxYearBuilt) params.maxYearBuilt = f.maxYearBuilt;
    if (f.minGarageSpaces) params.minGarageSpaces = f.minGarageSpaces;
    if (f.maxGarageSpaces) params.maxGarageSpaces = f.maxGarageSpaces;
    if (f.singleStory) params.singleStory = 'true';
    if (f.hasPool) params.hasPool = 'true';
    if (f.includeSeniorCommunities) params.seniors = 'true';
    if (f.singleFamily) params.singleFamily = 'true';
    if (f.townHomes) params.townHomes = 'true';
    if (f.condos) params.condos = 'true';
    if (f.statuses && !(f.statuses.length === 1 && f.statuses[0] === 'Active')) {
        params.statuses = f.statuses.join(',');
    }
    if (f.minCloseDate) params.minCloseDate = f.minCloseDate;
    if (f.maxCloseDate) params.maxCloseDate = f.maxCloseDate;
    return params;
};

const deserializeFiltersFromParams = (query) => ({
    minPrice: query.minPrice || '',
    maxPrice: query.maxPrice || '',
    minBeds: query.minBeds || '',
    maxBeds: query.maxBeds || '',
    minBaths: query.minBaths || '',
    maxBaths: query.maxBaths || '',
    minSqft: Number(query.minSqft) || 0,
    maxSqft: Number(query.maxSqft) || 0,
    minLotSize: query.minLotSize || '',
    maxLotSize: query.maxLotSize || '',
    minYearBuilt: query.minYearBuilt || '',
    maxYearBuilt: query.maxYearBuilt || '',
    minGarageSpaces: query.minGarageSpaces || '',
    maxGarageSpaces: query.maxGarageSpaces || '',
    singleStory: query.singleStory === 'true',
    hasPool: query.hasPool === 'true',
    includeSeniorCommunities: query.seniors === 'true' || query.includeSeniorCommunities === 'true',
    singleFamily: query.singleFamily === 'true',
    townHomes: query.townHomes === 'true',
    condos: query.condos === 'true',
    statuses: normalizeStatuses(query.statuses),
    minCloseDate: query.minCloseDate || '',
    maxCloseDate: query.maxCloseDate || '',
});

const buildSearchQuery = (filters, areaNames = []) => {
    const query = serializeFiltersToParams(filters);

    if (areaNames.length === 1) {
        query.area = areaNames[0];
    } else if (areaNames.length > 1) {
        query.area = areaNames;
    }

    return query;
};

const getAreaNamesFromQuery = (query) => {
    if (!query?.area) return [];
    return Array.isArray(query.area) ? query.area : [query.area];
};

const areSearchQueriesEqual = (leftQuery, rightQuery) => {
    const normalizeQuery = (query) => ({
        filters: serializeFiltersToParams(deserializeFiltersFromParams(query)),
        areas: getAreaNamesFromQuery(query),
    });

    const left = normalizeQuery(leftQuery);
    const right = normalizeQuery(rightQuery);

    return (
        JSON.stringify(left.filters) === JSON.stringify(right.filters)
        && JSON.stringify(left.areas) === JSON.stringify(right.areas)
    );
};

const PropertySearchPage = ({ areaParams }) => {
    const router = useRouter();

    // ── Redux ──
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const irgAreas = useSelector((state) => state.irgAreas);
    const agent = useSelector((state) => state.agent);
    const isAdmin = agent?.role === 'admin';

    // ── Google Maps loader ──
    const { isLoaded } = useGoogleMaps();

    // ── Dark mode detection ──
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const html = document.documentElement;
        setIsDark(html.classList.contains('dark'));
        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains('dark'));
        });
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // ── State ──
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [mapBounds, setMapBounds] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    const [mobileView, setMobileView] = useState('list');
    const [activeAreas, setActiveAreas] = useState([]);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
    const [saveSearchOpen, setSaveSearchOpen] = useState(false);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    // Sort state (admin only)
    const [sortOrder, setSortOrder] = useState('desc');

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnPolygon, setDrawnPolygon] = useState(null);
    const [drawnPolygonGeoJSON, setDrawnPolygonGeoJSON] = useState(null);

    // MapDialog state
    const [mapDialogVisible, setMapDialogVisible] = useState(false);
    const [mapDialogProperty, setMapDialogProperty] = useState(null);

    // Card list pagination
    const CARDS_PER_PAGE = 20;
    const [visibleCount, setVisibleCount] = useState(CARDS_PER_PAGE);
    const sentinelRef = useRef(null);

    // Refs for scroll-to-card
    const cardRefs = useRef({});
    const listScrollRef = useRef(null);

    // ── Initialize filters from URL params ──
    useEffect(() => {
        if (!router.isReady || filtersInitialized) return;

        const hasFilterParams = Object.keys(router.query).some((key) => key !== 'area');
        if (hasFilterParams) {
            const parsed = deserializeFiltersFromParams(router.query);
            setFilters(parsed);
            setAppliedFilters(parsed);
        }
        setFiltersInitialized(true);
    }, [router.isReady, router.query, filtersInitialized]);

    // ── Sync applied filters to URL ──
    // ── Look up IrgAreas from URL params ──
    useEffect(() => {
        if (!areaParams || areaParams.length === 0) {
            setActiveAreas((prev) => (prev.length === 0 ? prev : []));
            return;
        }
        if (!irgAreas) return;
        const allAreas = [
            ...(irgAreas.City || []),
            ...(irgAreas.Neighborhood || []),
            ...(irgAreas.Zip || []),
            ...(irgAreas.CondoBuilding || []),
        ];
        const found = areaParams
            .map((param) =>
                allAreas.find(
                    (a) => a.search_name === param || a.search_name === decodeURIComponent(param)
                )
            )
            .filter(Boolean);
        if (found.length > 0) {
            setActiveAreas((prev) => (
                areAreaNameListsEqual(
                    prev.map((area) => area.search_name),
                    found.map((area) => area.search_name)
                )
                    ? prev
                    : found
            ));
            // Mutual exclusivity: clear polygon
            setDrawnPolygon(null);
            setDrawnPolygonGeoJSON(null);
            setIsDrawing(false);
        } else {
            setActiveAreas((prev) => (prev.length === 0 ? prev : []));
        }
    }, [areaParams, irgAreas]);

    // ── Reset visible count when properties change ──
    useEffect(() => {
        setVisibleCount(CARDS_PER_PAGE);
    }, [properties]);

    // ── Intersection observer for infinite scroll ──
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => prev + CARDS_PER_PAGE);
                }
            },
            { root: listScrollRef.current, rootMargin: '200px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [properties, loading]);

    // ── Compute fitBoundsCoords from all activeAreas boundaries ──
    const fitBoundsCoords = useMemo(() => {
        if (activeAreas.length === 0) return null;
        const allCoords = [];
        for (const area of activeAreas) {
            if (area.boundary?.[0]) {
                // boundary[0] is [[lng, lat], ...] — convert to { lat, lng }
                area.boundary[0].forEach((pair) => {
                    allCoords.push({ lat: pair[1], lng: pair[0] });
                });
            }
        }
        return allCoords.length > 0 ? allCoords : null;
    }, [activeAreas]);

    // ── Stable initialCenter for the map (avoids new object ref each render) ──
    const initialCenter = useMemo(() => {
        const coords = activeAreas[0]?.coordinates;
        return coords ? { lat: coords.lat, lng: coords.lng } : null;
    }, [activeAreas]);

    const initialZoom = activeAreas[0]?.zoom || null;

    // ── "More Filters" badge count ──
    const moreFiltersCount = useMemo(() => {
        let count = 0;
        if (appliedFilters.minSqft || appliedFilters.maxSqft) count++;
        if (appliedFilters.minLotSize || appliedFilters.maxLotSize) count++;
        if (appliedFilters.minYearBuilt || appliedFilters.maxYearBuilt) count++;
        if (appliedFilters.minGarageSpaces || appliedFilters.maxGarageSpaces) count++;
        if (appliedFilters.singleStory) count++;
        if (appliedFilters.hasPool) count++;
        if (appliedFilters.includeSeniorCommunities) count++;
        if (appliedFilters.singleFamily || appliedFilters.townHomes || appliedFilters.condos) count++;
        if (appliedFilters.minCloseDate || appliedFilters.maxCloseDate) count++;
        return count;
    }, [appliedFilters]);

    // ── "Save Search" button enabled state ──
    const hasActiveFilters = useMemo(() => {
        if (activeAreas.length > 0 || drawnPolygonGeoJSON) return true;
        const f = appliedFilters;
        return !!(
            f.minPrice || f.maxPrice || f.minBeds || f.maxBeds ||
            f.minBaths || f.maxBaths || f.minLotSize || f.maxLotSize ||
            f.minYearBuilt || f.maxYearBuilt || f.minGarageSpaces || f.maxGarageSpaces ||
            f.singleStory || f.hasPool || f.includeSeniorCommunities ||
            f.minSqft || f.maxSqft || f.singleFamily || f.townHomes || f.condos ||
            f.minCloseDate || f.maxCloseDate
        );
    }, [appliedFilters, activeAreas, drawnPolygonGeoJSON]);

    // ── Block saving when non-Active statuses selected ──
    const isSaveSearchBlocked = useMemo(() => {
        return appliedFilters.statuses.some((s) => s !== 'Active');
    }, [appliedFilters.statuses]);

    // ── Auto-fill close date when Sold selected ──
    // ── Sorted properties (admin only, client-side) ──
    const sortedProperties = useMemo(() => {
        if (!properties?.length) return [];
        if (!isAdmin) return properties;
        return [...properties].sort((a, b) => {
            const dateA = new Date(a.date_created || 0);
            const dateB = new Date(b.date_created || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [properties, sortOrder, isAdmin]);

    // ── Fetch properties when bounds or filters change ──
    useEffect(() => {
        if (!mapBounds || !isLoggedIn || drawnPolygonGeoJSON || isDrawing || activeAreas.length > 0) return;

        const abortController = new AbortController();

        const fetchProperties = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    south: mapBounds.south,
                    west: mapBounds.west,
                    north: mapBounds.north,
                    east: mapBounds.east,
                });
                // Strip commas from price filters before sending
                const minP = appliedFilters.minPrice.replace(/,/g, '');
                const maxP = appliedFilters.maxPrice.replace(/,/g, '');
                if (minP) params.append('minPrice', minP);
                if (maxP) params.append('maxPrice', maxP);
                if (appliedFilters.minBeds) params.append('minBeds', appliedFilters.minBeds);
                if (appliedFilters.maxBeds) params.append('maxBeds', appliedFilters.maxBeds);
                if (appliedFilters.minBaths) params.append('minBaths', appliedFilters.minBaths);
                if (appliedFilters.maxBaths) params.append('maxBaths', appliedFilters.maxBaths);
                if (appliedFilters.minLotSize) params.append('minLotSize', appliedFilters.minLotSize);
                if (appliedFilters.maxLotSize) params.append('maxLotSize', appliedFilters.maxLotSize);
                if (appliedFilters.minYearBuilt) params.append('minYearBuilt', appliedFilters.minYearBuilt);
                if (appliedFilters.maxYearBuilt) params.append('maxYearBuilt', appliedFilters.maxYearBuilt);
                if (appliedFilters.minGarageSpaces) params.append('minGarageSpaces', appliedFilters.minGarageSpaces);
                if (appliedFilters.maxGarageSpaces) params.append('maxGarageSpaces', appliedFilters.maxGarageSpaces);
                if (appliedFilters.singleStory) params.append('singleStory', 'true');
                if (appliedFilters.hasPool) params.append('hasPool', 'true');
                if (appliedFilters.includeSeniorCommunities) params.append('includeSeniorCommunities', 'true');
                if (appliedFilters.minSqft) params.append('minSqft', appliedFilters.minSqft);
                if (appliedFilters.maxSqft) params.append('maxSqft', appliedFilters.maxSqft);
                if (appliedFilters.singleFamily) params.append('singleFamily', 'true');
                if (appliedFilters.townHomes) params.append('townHomes', 'true');
                if (appliedFilters.condos) params.append('condos', 'true');
                appliedFilters.statuses.forEach((s) => params.append('statuses', s));
                if (appliedFilters.minCloseDate) params.append('minCloseDate', appliedFilters.minCloseDate);
                if (appliedFilters.maxCloseDate) params.append('maxCloseDate', appliedFilters.maxCloseDate);

                const res = await IrgApi.get(`/mlsproperties/bounds?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                    signal: abortController.signal,
                });

                if (res.data.status === 'success') {
                    setProperties(res.data.data);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    // Non-critical — property search failed silently
                }
            }
            if (!abortController.signal.aborted) setLoading(false);
        };

        fetchProperties();
        return () => abortController.abort();
    }, [mapBounds, appliedFilters, isLoggedIn, drawnPolygonGeoJSON, isDrawing, activeAreas]);

    // ── Fetch properties when active areas or filters change ──
    useEffect(() => {
        if (activeAreas.length === 0 || !isLoggedIn || isDrawing) return;

        const abortController = new AbortController();

        const fetchAreaProperties = async () => {
            setLoading(true);
            try {
                const polygons = activeAreas
                    .filter((a) => a.boundary?.[0])
                    .map((a) => a.boundary);

                const body = { polygons };
                const minP = appliedFilters.minPrice.replace(/,/g, '');
                const maxP = appliedFilters.maxPrice.replace(/,/g, '');
                if (minP) body.minPrice = minP;
                if (maxP) body.maxPrice = maxP;
                if (appliedFilters.minBeds) body.minBeds = appliedFilters.minBeds;
                if (appliedFilters.maxBeds) body.maxBeds = appliedFilters.maxBeds;
                if (appliedFilters.minBaths) body.minBaths = appliedFilters.minBaths;
                if (appliedFilters.maxBaths) body.maxBaths = appliedFilters.maxBaths;
                if (appliedFilters.minLotSize) body.minLotSize = appliedFilters.minLotSize;
                if (appliedFilters.maxLotSize) body.maxLotSize = appliedFilters.maxLotSize;
                if (appliedFilters.minYearBuilt) body.minYearBuilt = appliedFilters.minYearBuilt;
                if (appliedFilters.maxYearBuilt) body.maxYearBuilt = appliedFilters.maxYearBuilt;
                if (appliedFilters.minGarageSpaces) body.minGarageSpaces = appliedFilters.minGarageSpaces;
                if (appliedFilters.maxGarageSpaces) body.maxGarageSpaces = appliedFilters.maxGarageSpaces;
                if (appliedFilters.singleStory) body.singleStory = true;
                if (appliedFilters.hasPool) body.hasPool = true;
                if (appliedFilters.includeSeniorCommunities) body.includeSeniorCommunities = true;
                if (appliedFilters.minSqft) body.minSqft = appliedFilters.minSqft;
                if (appliedFilters.maxSqft) body.maxSqft = appliedFilters.maxSqft;
                if (appliedFilters.singleFamily) body.singleFamily = true;
                if (appliedFilters.townHomes) body.townHomes = true;
                if (appliedFilters.condos) body.condos = true;
                body.statuses = appliedFilters.statuses;
                if (appliedFilters.minCloseDate) body.minCloseDate = appliedFilters.minCloseDate;
                if (appliedFilters.maxCloseDate) body.maxCloseDate = appliedFilters.maxCloseDate;

                const res = await IrgApi.post('/mlsproperties/withinpolygon', body, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                    signal: abortController.signal,
                });

                if (res.data.status === 'success') {
                    setProperties(res.data.data);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    // Non-critical — multi-area search failed silently
                }
            }
            if (!abortController.signal.aborted) setLoading(false);
        };

        fetchAreaProperties();
        return () => abortController.abort();
    }, [activeAreas, appliedFilters, isLoggedIn, isDrawing]);

    // ── Fetch properties when polygon or filters change ──
    useEffect(() => {
        if (!drawnPolygonGeoJSON || !isLoggedIn) return;

        const abortController = new AbortController();

        const fetchPolygonProperties = async () => {
            setLoading(true);
            try {
                const body = { polygon: drawnPolygonGeoJSON };
                const minP = appliedFilters.minPrice.replace(/,/g, '');
                const maxP = appliedFilters.maxPrice.replace(/,/g, '');
                if (minP) body.minPrice = minP;
                if (maxP) body.maxPrice = maxP;
                if (appliedFilters.minBeds) body.minBeds = appliedFilters.minBeds;
                if (appliedFilters.maxBeds) body.maxBeds = appliedFilters.maxBeds;
                if (appliedFilters.minBaths) body.minBaths = appliedFilters.minBaths;
                if (appliedFilters.maxBaths) body.maxBaths = appliedFilters.maxBaths;
                if (appliedFilters.minLotSize) body.minLotSize = appliedFilters.minLotSize;
                if (appliedFilters.maxLotSize) body.maxLotSize = appliedFilters.maxLotSize;
                if (appliedFilters.minYearBuilt) body.minYearBuilt = appliedFilters.minYearBuilt;
                if (appliedFilters.maxYearBuilt) body.maxYearBuilt = appliedFilters.maxYearBuilt;
                if (appliedFilters.minGarageSpaces) body.minGarageSpaces = appliedFilters.minGarageSpaces;
                if (appliedFilters.maxGarageSpaces) body.maxGarageSpaces = appliedFilters.maxGarageSpaces;
                if (appliedFilters.singleStory) body.singleStory = true;
                if (appliedFilters.hasPool) body.hasPool = true;
                if (appliedFilters.includeSeniorCommunities) body.includeSeniorCommunities = true;
                if (appliedFilters.minSqft) body.minSqft = appliedFilters.minSqft;
                if (appliedFilters.maxSqft) body.maxSqft = appliedFilters.maxSqft;
                if (appliedFilters.singleFamily) body.singleFamily = true;
                if (appliedFilters.townHomes) body.townHomes = true;
                if (appliedFilters.condos) body.condos = true;
                body.statuses = appliedFilters.statuses;
                if (appliedFilters.minCloseDate) body.minCloseDate = appliedFilters.minCloseDate;
                if (appliedFilters.maxCloseDate) body.maxCloseDate = appliedFilters.maxCloseDate;

                const res = await IrgApi.post('/mlsproperties/withinpolygon', body, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                    signal: abortController.signal,
                });

                if (res.data.status === 'success') {
                    setProperties(res.data.data);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    // Non-critical — polygon search failed silently
                }
            }
            if (!abortController.signal.aborted) setLoading(false);
        };

        fetchPolygonProperties();
        return () => abortController.abort();
    }, [drawnPolygonGeoJSON, appliedFilters, isLoggedIn]);

    // ── Handlers ──
    const handleFilterChange = useCallback((field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const syncCommittedSearchToUrl = useCallback((nextFilters, nextAreas = activeAreas) => {
        const nextQuery = buildSearchQuery(
            nextFilters,
            nextAreas.map((area) => area.search_name)
        );

        if (areSearchQueriesEqual(router.query, nextQuery)) return;

        router.replace(
            { pathname: router.pathname, query: nextQuery },
            undefined,
            { shallow: true }
        );
    }, [router, activeAreas]);

    const handleSearch = useCallback(() => {
        const normalized = normalizeFiltersForApply(filters);
        setFilters(normalized);
        setAppliedFilters(normalized);
        syncCommittedSearchToUrl(normalized);
    }, [filters, syncCommittedSearchToUrl]);

    const handleReset = useCallback(() => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setDrawnPolygon(null);
        setDrawnPolygonGeoJSON(null);
        setIsDrawing(false);
        setActiveAreas([]);
        router.replace('/search', undefined, { shallow: true });
    }, [router]);

    const handleApplyMoreFilters = useCallback((moreFilters) => {
        const merged = normalizeFiltersForApply({ ...filters, ...moreFilters });
        setFilters(merged);
        setAppliedFilters(merged);
        setMoreFiltersOpen(false);
        syncCommittedSearchToUrl(merged);
    }, [filters, syncCommittedSearchToUrl]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleBoundsChange = useCallback(
        debounce((bounds) => {
            setMapBounds((prev) => {
                // Only update if values actually changed — prevents infinite
                // fetch loops when onIdle fires with identical coordinates
                if (
                    prev &&
                    prev.south === bounds.south &&
                    prev.west === bounds.west &&
                    prev.north === bounds.north &&
                    prev.east === bounds.east
                ) {
                    return prev;
                }
                return bounds;
            });
        }, 400),
        []
    );

    const handleMarkerClick = useCallback((id) => {
        setHighlightedId(id);
        // Scroll card into view
        const el = cardRefs.current[id];
        if (el && listScrollRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    const handleMarkerHover = useCallback((id) => {
        setHighlightedId(id);
    }, []);

    const handleMarkerLeave = useCallback(() => {
        setHighlightedId(null);
    }, []);

    const handleCardHover = useCallback((id) => {
        setHighlightedId(id);
    }, []);

    const handleCardLeave = useCallback(() => {
        setHighlightedId(null);
    }, []);

    const handleRemoveArea = useCallback((searchName) => {
        setActiveAreas((prev) => {
            const next = prev.filter((a) => a.search_name !== searchName);
            router.replace(
                {
                    pathname: router.pathname,
                    query: buildSearchQuery(
                        appliedFilters,
                        next.map((area) => area.search_name)
                    ),
                },
                undefined,
                { shallow: true }
            );
            return next;
        });
    }, [router, appliedFilters]);

    const handleToggleDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
        } else {
            setDrawnPolygon(null);
            setDrawnPolygonGeoJSON(null);
            setIsDrawing(true);
            if (activeAreas.length > 0) {
                setActiveAreas([]);
                router.replace(
                    {
                        pathname: router.pathname,
                        query: buildSearchQuery(appliedFilters, []),
                    },
                    undefined,
                    { shallow: true }
                );
            }
        }
    }, [isDrawing, activeAreas, router, appliedFilters]);

    const handlePolygonComplete = useCallback((gmPolygon) => {
        const path = extractPathFromGMPolygon(gmPolygon);
        gmPolygon.setMap(null);
        const geoJSON = pathToGeoJSON(path);
        setDrawnPolygon(path);
        setDrawnPolygonGeoJSON(geoJSON);
        setIsDrawing(false);
        if (activeAreas.length > 0) {
            setActiveAreas([]);
            router.replace(
                {
                    pathname: router.pathname,
                    query: buildSearchQuery(appliedFilters, []),
                },
                undefined,
                { shallow: true }
            );
        }
    }, [activeAreas, router, appliedFilters]);

    const handleClearPolygon = useCallback(() => {
        setDrawnPolygon(null);
        setDrawnPolygonGeoJSON(null);
        setIsDrawing(false);
    }, []);

    const handleOpenMapDialog = useCallback((property) => {
        setMapDialogProperty(property);
        setMapDialogVisible(true);
    }, []);

    const handleCloseMapDialog = useCallback(() => {
        setMapDialogVisible(false);
        setMapDialogProperty(null);
    }, []);

    const toggleMobileView = useCallback(() => {
        setMobileView((prev) => (prev === 'list' ? 'map' : 'list'));
    }, []);

    // ── Days on market text ──
    const getDomText = (dom) => {
        if (dom === 0) return 'Listed Today';
        if (dom === 1) return '1 Day on Market';
        return `${dom} Days on Market`;
    };

    // ── Render ──
    return (
        <div className="property-search">
            {/* Drawn polygon label */}
            {drawnPolygon && (
                <div className="property-search__area-label">
                    <i className="pi pi-pencil" />
                    <span>Showing properties in <strong>drawn area</strong></span>
                    <button
                        className="property-search__area-label__clear"
                        onClick={handleClearPolygon}
                        type="button"
                        aria-label="Clear drawn area"
                    >
                        <i className="pi pi-times" />
                    </button>
                </div>
            )}

            {/* Desktop toolbar */}
            <SearchToolbar
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleReset}
                isDrawing={isDrawing}
                onToggleDrawing={handleToggleDrawing}
                moreFiltersCount={moreFiltersCount}
                onOpenMoreFilters={() => setMoreFiltersOpen(true)}
                hasActiveFilters={hasActiveFilters}
                onOpenSaveSearch={() => setSaveSearchOpen(true)}
                isSaveSearchBlocked={isSaveSearchBlocked}
                onOpenFilterDrawer={() => setMobileFilterOpen(true)}
            />

            {/* Area pills */}
            {activeAreas.length > 0 && !drawnPolygon && (
                <div className="property-search__area-pills">
                    {activeAreas.map((area) => (
                        <span key={area.search_name} className="property-search__area-pill">
                            <i className="pi pi-map-marker" />
                            {area.name}
                            <button
                                className="property-search__area-pill__remove"
                                onClick={() => handleRemoveArea(area.search_name)}
                                type="button"
                                aria-label={`Remove ${area.name}`}
                            >
                                <i className="pi pi-times" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Body: map + list */}
            <div className={`property-search__body property-search__body--mobile-${mobileView}`}>
                {/* Map panel */}
                <div className="property-search__map-panel">
                    {isLoaded ? (
                        <PropertySearchMap
                            properties={properties}
                            highlightedId={highlightedId}
                            onBoundsChange={handleBoundsChange}
                            onMarkerClick={handleMarkerClick}
                            onMarkerHover={handleMarkerHover}
                            onMarkerLeave={handleMarkerLeave}
                            initialCenter={initialCenter}
                            initialZoom={initialZoom}
                            fitBoundsCoords={fitBoundsCoords}
                            isDark={isDark}
                            isDrawing={isDrawing}
                            drawnPolygon={drawnPolygon}
                            onPolygonComplete={handlePolygonComplete}
                            activeAreas={activeAreas}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'hsl(var(--muted))',
                            }}
                        >
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }} />
                        </div>
                    )}
                </div>

                {/* List panel */}
                <div className="property-search__list-panel">
                    <div className="property-search__list-header">
                        <span>{loading ? 'Searching...' : `${sortedProperties.length} Properties Found`}</span>
                        {isAdmin && sortedProperties.length > 0 && (
                            <button
                                type="button"
                                className="ps-toolbar__btn ps-toolbar__btn--secondary"
                                style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '12px' }}
                                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                                title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                            >
                                <i className={sortOrder === 'desc' ? 'pi pi-sort-amount-down' : 'pi pi-sort-amount-up'} style={{ marginRight: '4px' }} />
                                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </button>
                        )}
                    </div>
                    <div className="property-search__list-scroll" ref={listScrollRef}>
                        {loading ? (
                            // Skeleton cards
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="ps-skeleton ps-skeleton__card" />
                            ))
                        ) : sortedProperties.length === 0 ? (
                            <div className="property-search__empty">
                                <i className="pi pi-search" />
                                <p>No properties found in this area.</p>
                                <p>Try zooming out or adjusting your filters.</p>
                            </div>
                        ) : (
                            <>
                                {sortedProperties.slice(0, visibleCount).map((p) => (
                                    <div
                                        key={p._id}
                                        ref={(el) => { cardRefs.current[p._id] = el; }}
                                        className={`ps-card-wrapper${highlightedId === p._id ? ' ps-card-wrapper--highlighted' : ''}`}
                                        onMouseEnter={() => handleCardHover(p._id)}
                                        onMouseLeave={handleCardLeave}
                                    >
                                        <PrpCard
                                            property={p}
                                            handleOpenMapDialog={handleOpenMapDialog}
                                        />
                                        {p.days_on_market != null && (
                                            <div className="ps-card-dom">
                                                <i className="pi pi-clock" />
                                                {getDomText(p.days_on_market)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {visibleCount < sortedProperties.length && (
                                    <div ref={sentinelRef} style={{ height: 1 }} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: filter button */}
            <button
                className="mobile-filter-btn"
                onClick={() => setMobileFilterOpen(true)}
                type="button"
            >
                <i className="pi pi-sliders-h" />
                Filters
            </button>

            {/* Mobile: map/list toggle */}
            <button
                className="property-search__mobile-toggle"
                onClick={toggleMobileView}
                type="button"
                aria-label={mobileView === 'list' ? 'Show map' : 'Show list'}
            >
                <i className={`pi ${mobileView === 'list' ? 'pi-map' : 'pi-list'}`} />
            </button>

            {/* Mobile filter drawer */}
            <MobileFilterDrawer
                visible={mobileFilterOpen}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleReset}
                onClose={() => setMobileFilterOpen(false)}
            />

            {/* More Filters dialog */}
            <MoreFiltersDialog
                visible={moreFiltersOpen}
                filters={appliedFilters}
                statuses={filters.statuses}
                onApply={handleApplyMoreFilters}
                onClose={() => setMoreFiltersOpen(false)}
            />

            {/* Save Search dialog */}
            <SaveSearchDialog
                visible={saveSearchOpen}
                onClose={() => setSaveSearchOpen(false)}
                appliedFilters={appliedFilters}
                activeAreas={activeAreas}
                drawnPolygonGeoJSON={drawnPolygonGeoJSON}
                mapBounds={mapBounds}
                isSaveSearchBlocked={isSaveSearchBlocked}
            />

            {/* Map dialog for PrpCard's "Show Map" button */}
            <MapDialog
                showMapDialog={mapDialogVisible}
                handleCloseMapDialog={handleCloseMapDialog}
                property={mapDialogProperty || { coordinates: { lat: 33, lng: -117 } }}
            />
        </div>
    );
};

export default PropertySearchPage;
