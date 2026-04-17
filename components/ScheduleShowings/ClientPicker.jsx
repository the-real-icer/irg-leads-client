import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { filterLeadsByQuery } from './tourHelpers';

const FILTER_DEBOUNCE_MS = 150;
const MAX_RESULTS = 20;

const formatLeadName = (lead) => {
    if (!lead) return '';
    const first = lead.first_name || '';
    const last = lead.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || lead.email || 'Unnamed lead';
};

const ClientPicker = ({ value, onChange }) => {
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const leadsLoading = useSelector((state) => state.allLeadsPage.loading);
    const lastFetched = useSelector((state) => state.allLeadsPage.lastFetched);

    const ready = Boolean(lastFetched);

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // 150ms debounce on the filter input — not a network call, just keeps
    // large lists (hundreds of leads) from re-filtering on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), FILTER_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
    };

    const handleSelect = (lead) => {
        onChange(lead);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
        setOpen(false);
        inputRef.current?.focus();
    };

    // If a client is selected, render a compact "pill" view with a clear button.
    if (value) {
        return (
            <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] text-foreground/70">Client (optional)</label>
                <div
                    className={
                        'flex items-center gap-[8px] w-full '
                        + 'rounded-[12px] border border-border bg-surface '
                        + 'text-foreground text-[14px] px-[16px] py-[12px]'
                    }
                >
                    <i className="pi pi-user text-foreground/50" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-foreground truncate">
                            {formatLeadName(value)}
                        </div>
                        {value.email && (
                            <div className="text-[12px] text-foreground/70 truncate">
                                {value.email}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear selected client"
                        className={
                            'text-foreground/50 hover:text-foreground '
                            + 'p-[4px] rounded-[4px]'
                        }
                    >
                        <i className="pi pi-times" aria-hidden="true" />
                    </button>
                </div>
            </div>
        );
    }

    const filtered = ready
        ? filterLeadsByQuery(allLeads, debouncedQuery).slice(0, MAX_RESULTS)
        : [];

    const showDropdown = open && ready && filtered.length > 0;

    return (
        <div ref={containerRef} className="relative flex flex-col gap-[6px]">
            <label htmlFor="tour-client-picker" className="text-[12px] text-foreground/70">
                Client (optional)
            </label>

            <div className="relative">
                <i
                    className={
                        'pi pi-user absolute left-[14px] top-1/2 '
                        + '-translate-y-1/2 text-foreground/50 pointer-events-none'
                    }
                    aria-hidden="true"
                />
                <input
                    ref={inputRef}
                    id="tour-client-picker"
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={ready ? 'Search by name or email' : 'Loading leads…'}
                    disabled={!ready}
                    autoComplete="off"
                    aria-label="Search for a client"
                    className={
                        'w-full rounded-[12px] border border-border '
                        + 'bg-surface text-foreground placeholder:text-foreground/50 '
                        + 'text-[14px] pl-[40px] pr-[16px] py-[12px] '
                        + 'focus:outline-none focus:ring-2 focus:ring-primary/40 '
                        + 'disabled:opacity-60 disabled:cursor-not-allowed'
                    }
                />
            </div>

            {showDropdown && (
                <ul
                    className={
                        'absolute left-0 right-0 top-[calc(100%+4px)] '
                        + 'z-[1000] max-h-[280px] overflow-y-auto '
                        + 'bg-surface border border-border rounded-[12px] '
                        + 'shadow-dropdown p-[8px] list-none m-0'
                    }
                >
                    {filtered.map((lead) => (
                        <li key={lead._id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(lead)}
                                className={
                                    'w-full text-left flex flex-col '
                                    + 'px-[12px] py-[10px] rounded-[8px] '
                                    + 'hover:bg-background transition-colors'
                                }
                            >
                                <span className="text-[14px] font-medium text-foreground truncate">
                                    {formatLeadName(lead)}
                                </span>
                                {lead.email && (
                                    <span className="text-[12px] text-foreground/70 truncate">
                                        {lead.email}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {open && ready && filtered.length === 0 && debouncedQuery && (
                <div
                    className={
                        'absolute left-0 right-0 top-[calc(100%+4px)] '
                        + 'z-[1000] bg-surface border border-border rounded-[12px] '
                        + 'shadow-dropdown px-[12px] py-[10px] '
                        + 'text-[13px] text-foreground/70'
                    }
                >
                    No matching leads
                </div>
            )}

            {leadsLoading && !ready && (
                <span className="text-[11px] text-foreground/50">
                    Fetching your leads…
                </span>
            )}
        </div>
    );
};

ClientPicker.propTypes = {
    value: PropTypes.shape({
        _id: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        email: PropTypes.string,
    }),
    onChange: PropTypes.func.isRequired,
};

ClientPicker.defaultProps = {
    value: null,
};

export default ClientPicker;
