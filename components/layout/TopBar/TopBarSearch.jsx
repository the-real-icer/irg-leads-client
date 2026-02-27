import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import IrgApi from '../../../assets/irgApi';

const TopBarSearch = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // Detect if we're on the search page with existing area pills
    const isOnSearchPage = router.pathname === '/search';
    const hasExistingAreas = isOnSearchPage && !!router.query.area;
    const existingAreaNames = hasExistingAreas
        ? (Array.isArray(router.query.area) ? router.query.area : [router.query.area])
        : [];

    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ leads: [], properties: [], areas: [] });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mobileExpanded, setMobileExpanded] = useState(false);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const mobileInputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Flatten results in display order for keyboard navigation.
    // Order: address queries (start with digit) → properties first;
    //        name queries (start with letter)  → areas first.
    // Spread FIRST so our discriminator `type` is never overwritten by a field
    // from the API response (areas have their own `type` like "City", "Zip", etc.)
    const flatResults = useMemo(() => {
        // When on search page with existing areas, only show unselected areas
        if (hasExistingAreas) {
            const filtered = (results.areas || []).filter(
                (a) => !existingAreaNames.includes(a.searchName)
            );
            return filtered.map((item) => ({ ...item, type: 'area' }));
        }

        const addressQuery = /^\d/.test(query.trim());
        const sections = addressQuery
            ? [
                { data: results.properties, type: 'property' },
                { data: results.leads, type: 'lead' },
                { data: results.areas || [], type: 'area' },
            ]
            : [
                { data: results.areas || [], type: 'area' },
                { data: results.leads, type: 'lead' },
                { data: results.properties, type: 'property' },
            ];
        const items = [];
        for (const { data, type } of sections) {
            data.forEach((item) => items.push({ ...item, type }));
        }
        return items;
    }, [results, query, hasExistingAreas, existingAreaNames]);

    const hasResults = flatResults.length > 0;
    const hasQuery = query.trim().length >= 2;

    // Close on click-outside
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setOpen(false);
                setMobileExpanded(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on route change
    useEffect(() => {
        const handleRoute = () => {
            setOpen(false);
            setMobileExpanded(false);
        };
        router.events.on('routeChangeStart', handleRoute);
        return () => router.events.off('routeChangeStart', handleRoute);
    }, [router.events]);

    // Focus mobile input when expanded
    useEffect(() => {
        if (mobileExpanded && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [mobileExpanded]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => clearTimeout(debounceTimer.current);
    }, []);

    const handleSearch = useCallback(
        (searchValue) => {
            clearTimeout(debounceTimer.current);

            if (searchValue.trim().length < 2) {
                setResults({ leads: [], properties: [], areas: [] });
                setOpen(false);
                setLoading(false);
                return;
            }

            setLoading(true);
            setOpen(true);

            debounceTimer.current = setTimeout(async () => {
                try {
                    const res = await IrgApi.get(
                        `/search?q=${encodeURIComponent(searchValue.trim())}`,
                        { headers: { Authorization: `Bearer ${isLoggedIn}` } }
                    );
                    if (res.data.status === 'success') {
                        setResults(res.data.data);
                    }
                } catch (err) {
                    // Error handled — search results remain empty
                }
                setLoading(false);
            }, 250);
        },
        [isLoggedIn]
    );

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIndex(-1);
        handleSearch(value);
    };

    const navigateToResult = useCallback(
        (item) => {
            if (item.type === 'lead') {
                router.push(`/lead/${item.id}`);
            } else if (item.type === 'property') {
                router.push(`/property/${item.propertyUrl}`);
            } else if (item.type === 'area') {
                if (hasExistingAreas) {
                    // Append to existing area params
                    const params = [...existingAreaNames, item.searchName]
                        .map((a) => `area=${encodeURIComponent(a)}`)
                        .join('&');
                    router.push(`/search?${params}`);
                } else {
                    router.push(`/search?area=${encodeURIComponent(item.searchName)}`);
                }
            }
            setQuery('');
            setResults({ leads: [], properties: [], areas: [] });
            setOpen(false);
            setMobileExpanded(false);
            setActiveIndex(-1);
        },
        [router, hasExistingAreas, existingAreaNames]
    );

    const handleKeyDown = (e) => {
        if (!open || flatResults.length === 0) {
            if (e.key === 'Escape') {
                setOpen(false);
                setMobileExpanded(false);
                e.target.blur();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev < flatResults.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev > 0 ? prev - 1 : flatResults.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < flatResults.length) {
                    navigateToResult(flatResults[activeIndex]);
                }
                break;
            case 'Escape':
                setOpen(false);
                setMobileExpanded(false);
                setActiveIndex(-1);
                e.target.blur();
                break;
            default:
                break;
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults({ leads: [], properties: [], areas: [] });
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
        mobileInputRef.current?.focus();
    };

    const handleMobileOpen = () => {
        setMobileExpanded(true);
    };

    const handleMobileClose = () => {
        setMobileExpanded(false);
        setQuery('');
        setResults({ leads: [], properties: [], areas: [] });
        setOpen(false);
        setActiveIndex(-1);
    };

    const capitalizeStatus = (s) =>
        s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    // Render a single result item (lead, property, or area)
    const renderResultItem = (item, type, globalIdx) => {
        if (type === 'lead') {
            return (
                <button
                    key={item.id}
                    className={`topbar-search__item${activeIndex === globalIdx ? ' topbar-search__item--active' : ''}`}
                    onClick={() => navigateToResult({ ...item, type: 'lead' })}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    type="button"
                >
                    <div className="topbar-search__item-content">
                        <div className="topbar-search__item-row">
                            <span className="topbar-search__item-name">
                                {item.name || 'Unknown'}
                            </span>
                            <span
                                className="topbar-search__item-status"
                                style={{
                                    backgroundColor: `hsl(var(--status-${item.status}) / 0.15)`,
                                    color: `hsl(var(--status-${item.status}))`,
                                }}
                            >
                                {capitalizeStatus(item.status)}
                            </span>
                        </div>
                        {item.email && (
                            <span className="topbar-search__item-meta">
                                {item.email}
                            </span>
                        )}
                    </div>
                </button>
            );
        }
        if (type === 'property') {
            return (
                <button
                    key={item.id}
                    className={`topbar-search__item${activeIndex === globalIdx ? ' topbar-search__item--active' : ''}`}
                    onClick={() => navigateToResult({ ...item, type: 'property' })}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    type="button"
                >
                    <div className="topbar-search__item-content">
                        <div className="topbar-search__item-row">
                            <span className="topbar-search__item-name">
                                {item.address}
                            </span>
                        </div>
                        <div className="topbar-search__item-row">
                            <span className="topbar-search__item-meta">
                                {item.price}
                            </span>
                            <span className="topbar-search__item-meta">
                                {item.status}
                            </span>
                        </div>
                    </div>
                </button>
            );
        }
        if (type === 'area') {
            return (
                <button
                    key={item.id}
                    className={`topbar-search__item${activeIndex === globalIdx ? ' topbar-search__item--active' : ''}`}
                    onClick={() => navigateToResult({ ...item, type: 'area' })}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    type="button"
                >
                    <div className="topbar-search__item-content">
                        <div className="topbar-search__item-row">
                            <span className="topbar-search__item-name">
                                {item.name}
                            </span>
                            <span
                                className="topbar-search__item-status"
                                style={{
                                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                                    color: 'hsl(var(--primary))',
                                }}
                            >
                                {item.type}
                            </span>
                        </div>
                    </div>
                </button>
            );
        }
        return null;
    };

    // Render the dropdown content — section order matches flatResults
    const renderDropdown = () => {
        if (!open) return null;

        return (
            <div className="topbar-search__dropdown animate-slide-down">
                {loading ? (
                    <div className="topbar-search__loading">
                        <i className="pi pi-spin pi-spinner" />
                        <span>Searching...</span>
                    </div>
                ) : !hasResults && hasQuery ? (
                    <div className="topbar-search__empty">
                        <i className="pi pi-search" />
                        <span>No results found</span>
                    </div>
                ) : (
                    <>{renderSections()}</>
                )}
            </div>
        );
    };

    // Build ordered section list and render with correct globalIdx offsets
    const renderSections = () => {
        // Context-aware: only show areas when on search page with pills
        if (hasExistingAreas) {
            const filteredAreas = (results.areas || []).filter(
                (a) => !existingAreaNames.includes(a.searchName)
            );
            if (filteredAreas.length === 0) return null;
            return (
                <div key="areas" className="topbar-search__section">
                    <div className="topbar-search__section-label">
                        <i className="pi pi-map-marker" />
                        Areas
                    </div>
                    {filteredAreas.map((item, idx) => renderResultItem(item, 'area', idx))}
                </div>
            );
        }

        const addressQuery = /^\d/.test(query.trim());
        const defs = addressQuery
            ? [
                { key: 'properties', items: results.properties, label: 'Properties', icon: 'pi-home', type: 'property' },
                { key: 'leads', items: results.leads, label: 'Leads', icon: 'pi-users', type: 'lead' },
                { key: 'areas', items: results.areas || [], label: 'Areas', icon: 'pi-map-marker', type: 'area' },
            ]
            : [
                { key: 'areas', items: results.areas || [], label: 'Areas', icon: 'pi-map-marker', type: 'area' },
                { key: 'leads', items: results.leads, label: 'Leads', icon: 'pi-users', type: 'lead' },
                { key: 'properties', items: results.properties, label: 'Properties', icon: 'pi-home', type: 'property' },
            ];

        // Precompute globalIdx offsets
        const offsets = {};
        let offset = 0;
        for (const def of defs) {
            offsets[def.key] = offset;
            offset += (def.items?.length || 0);
        }

        return defs.map(({ key, items, label, icon, type }) => {
            if (!items || items.length === 0) return null;
            return (
                <div key={key} className="topbar-search__section">
                    <div className="topbar-search__section-label">
                        <i className={`pi ${icon}`} />
                        {label}
                    </div>
                    {items.map((item, idx) => renderResultItem(item, type, offsets[key] + idx))}
                </div>
            );
        });
    };

    return (
        <div className="topbar-search" ref={searchRef}>
            {/* ── Desktop search ── */}
            <div className="topbar-search__desktop">
                <div className="topbar-search__input-wrap">
                    <i className="pi pi-search topbar-search__icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (hasQuery && hasResults) setOpen(true);
                        }}
                        placeholder={hasExistingAreas ? 'Add another area...' : 'Search leads, properties, areas...'}
                        className="topbar-search__input"
                        autoComplete="off"
                    />
                    {query.length > 0 && (
                        <button
                            className="topbar-search__clear"
                            onClick={handleClear}
                            type="button"
                            aria-label="Clear search"
                        >
                            <i className="pi pi-times" />
                        </button>
                    )}
                </div>
                {renderDropdown()}
            </div>

            {/* ── Mobile trigger ── */}
            <button
                className="topbar-search__mobile-trigger"
                onClick={handleMobileOpen}
                type="button"
                aria-label="Open search"
            >
                <i className="pi pi-search" />
            </button>

            {/* ── Mobile expanded overlay ── */}
            {mobileExpanded && (
                <div className="topbar-search__mobile-overlay">
                    <div className="topbar-search__mobile-bar">
                        <button
                            className="topbar-search__mobile-back"
                            onClick={handleMobileClose}
                            type="button"
                            aria-label="Close search"
                        >
                            <i className="pi pi-arrow-left" />
                        </button>
                        <div className="topbar-search__input-wrap topbar-search__input-wrap--mobile">
                            <i className="pi pi-search topbar-search__icon" />
                            <input
                                ref={mobileInputRef}
                                type="text"
                                value={query}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder={hasExistingAreas ? 'Add another area...' : 'Search leads, properties, areas...'}
                                className="topbar-search__input"
                                autoComplete="off"
                            />
                            {query.length > 0 && (
                                <button
                                    className="topbar-search__clear"
                                    onClick={handleClear}
                                    type="button"
                                    aria-label="Clear search"
                                >
                                    <i className="pi pi-times" />
                                </button>
                            )}
                        </div>
                    </div>
                    {renderDropdown()}
                </div>
            )}
        </div>
    );
};

export default TopBarSearch;
