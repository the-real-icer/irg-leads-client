import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import IrgApi from '../../assets/irgApi';
import {
    formatBedsBaths,
    formatSqft,
    hasValidCoords,
    isAlreadyInTour,
    stopFromSuggestResult,
} from './tourHelpers';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

const PropertySearch = ({ stops, onAdd }) => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    // Track thumbnail URLs that have failed to load so we can swap them
    // out for the placeholder instead of showing a broken-image icon.
    const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
    const isBroken = (url) => brokenThumbs.has(url);
    const markBroken = (url) => setBrokenThumbs((prev) => {
        const next = new Set(prev);
        next.add(url);
        return next;
    });

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const handleClear = () => {
        setQuery('');
        setOpen(false);
        inputRef.current?.focus();
    };

    // Debounced fetch with AbortController — cancels in-flight requests
    // whenever the query changes or the component unmounts.
    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed.length < MIN_QUERY_LENGTH) {
            setResults([]);
            setLoading(false);
            setError(null);
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            setError(null);

            IrgApi.get('/mlsproperties/suggest', {
                params: { q: trimmed, limit: 10 },
                headers: { Authorization: `Bearer ${isLoggedIn}` },
                signal: controller.signal,
            })
                .then((res) => {
                    const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
                    // Defense: drop any result missing finite coordinates
                    setResults(raw.filter(hasValidCoords));
                    setLoading(false);
                })
                .catch((err) => {
                    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
                    setError(err?.response?.data?.message || err?.message || 'Search failed');
                    setResults([]);
                    setLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, isLoggedIn]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close dropdown on Escape
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
    };

    const showDropdown = open
        && query.trim().length >= MIN_QUERY_LENGTH
        && (loading || error || results.length > 0);

    return (
        <div ref={containerRef} className="relative w-full">
            <label htmlFor="schedule-showings-search" className="sr-only">
                Search properties by address or MLS number
            </label>

            {/* Input wrapper — relative so the icon + clear button anchor
                to the input, not to the outer container (which also hosts
                the absolutely-positioned dropdown below). */}
            <div className="relative">
                <i
                    className={
                        'pi pi-search absolute left-[14px] top-1/2 '
                        + '-translate-y-1/2 text-foreground/50 pointer-events-none'
                    }
                    aria-hidden="true"
                />
                <input
                    ref={inputRef}
                    id="schedule-showings-search"
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by address or MLS number"
                    aria-label="Search properties by address or MLS number"
                    autoComplete="off"
                    className={
                        'w-full rounded-[12px] border border-border '
                        + 'bg-surface text-foreground placeholder:text-foreground/50 '
                        + 'text-[14px] pl-[40px] pr-[40px] py-[12px] '
                        + 'focus:outline-none focus:ring-2 focus:ring-primary/40'
                    }
                />
                {query.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className={
                            'absolute right-[10px] top-1/2 -translate-y-1/2 '
                            + 'text-foreground/50 hover:text-foreground '
                            + 'p-[4px] rounded-[4px]'
                        }
                    >
                        <i className="pi pi-times" aria-hidden="true" />
                    </button>
                )}
            </div>

            {showDropdown && (
                <ul
                    className={
                        'absolute left-0 right-0 top-[calc(100%+4px)] '
                        + 'z-[1000] max-h-[420px] overflow-y-auto '
                        + 'bg-surface border border-border rounded-[12px] '
                        + 'shadow-dropdown p-[8px] list-none m-0'
                    }
                >
                    {loading && (
                        <li className="px-[12px] py-[10px] text-[13px] text-foreground/70">
                            Searching…
                        </li>
                    )}
                    {error && !loading && (
                        <li className="px-[12px] py-[10px] text-[13px] text-danger">
                            {error}
                        </li>
                    )}
                    {!loading && !error && results.length === 0 && (
                        <li className="px-[12px] py-[10px] text-[13px] text-foreground/70">
                            No matching properties
                        </li>
                    )}
                    {!loading && !error && results.map((result) => {
                        const stop = stopFromSuggestResult(result);
                        const alreadyAdded = isAlreadyInTour(stops, stop.mls_number);
                        return (
                            <li
                                key={stop.mls_number}
                                className={
                                    'flex items-center gap-[12px] px-[12px] py-[10px] '
                                    + 'rounded-[8px] hover:bg-background transition-colors'
                                }
                            >
                                {stop.thumbnail && !isBroken(stop.thumbnail) ? (
                                    <img
                                        src={stop.thumbnail}
                                        onError={() => markBroken(stop.thumbnail)}
                                        alt=""
                                        className="w-[64px] h-[64px] rounded-[8px] object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div
                                        className={
                                            'w-[64px] h-[64px] rounded-[8px] bg-background '
                                            + 'flex-shrink-0'
                                        }
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-medium text-foreground truncate">
                                        {stop.address}
                                        {stop.unit_number ? ` #${stop.unit_number}` : ''}
                                    </div>
                                    <div className="text-[12px] text-foreground/70 truncate">
                                        {stop.city}, {stop.state} {stop.zip_code}
                                    </div>
                                    <div className="text-[12px] text-foreground/70 truncate">
                                        {stop.price}
                                        {formatBedsBaths(stop) && ` · ${formatBedsBaths(stop)}`}
                                        {formatSqft(stop.sqft_raw) && ` · ${formatSqft(stop.sqft_raw)}`}
                                    </div>
                                </div>

                                {alreadyAdded ? (
                                    <span
                                        className={
                                            'text-[12px] font-semibold text-foreground/60 '
                                            + 'px-[10px] py-[6px] rounded-[6px] bg-background '
                                            + 'flex-shrink-0'
                                        }
                                    >
                                        Added
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => onAdd(stop)}
                                        className={
                                            'text-[12px] font-semibold text-white '
                                            + 'bg-primary hover:bg-primary/90 '
                                            + 'px-[10px] py-[6px] rounded-[6px] flex-shrink-0 '
                                            + 'transition-colors'
                                        }
                                    >
                                        Add to tour
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

PropertySearch.propTypes = {
    stops: PropTypes.array.isRequired,
    onAdd: PropTypes.func.isRequired,
};

export default PropertySearch;
