import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import getLeadDisplayName from '../../utils/getLeadDisplayName';

const FREQUENCY_OPTIONS = [
    { value: 'Instantly', label: 'Instantly' },
    { value: 'Daily', label: 'Daily' },
    { value: 'Twice A Week', label: 'Twice A Week' },
    { value: 'Weekly', label: 'Weekly' },
];

// Format price for display in pills: 500000 → "$500K", 1200000 → "$1.2M"
const formatShortPrice = (raw) => {
    const num = Number(raw);
    if (!num) return '';
    if (num >= 1000000) {
        const m = num / 1000000;
        return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
    }
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num}`;
};

const buildAutoName = (appliedFilters, activeAreas) => {
    const parts = [];
    if (appliedFilters.minBeds) parts.push(`${appliedFilters.minBeds}+ Beds`);
    const minP = appliedFilters.minPrice.replace(/,/g, '');
    const maxP = appliedFilters.maxPrice.replace(/,/g, '');
    if (minP && maxP) {
        parts.push(`${formatShortPrice(minP)}\u2013${formatShortPrice(maxP)}`);
    } else if (minP) {
        parts.push(`${formatShortPrice(minP)}+`);
    } else if (maxP) {
        parts.push(`Up to ${formatShortPrice(maxP)}`);
    }
    if (activeAreas.length === 1) {
        parts.push(`in ${activeAreas[0].name}`);
    } else if (activeAreas.length > 1) {
        parts.push(`in ${activeAreas.length} areas`);
    }
    return parts.join(', ') || 'Property Search';
};

const buildSearchFilter = (f) => ({
    minPriceFilter: Number(f.minPrice.replace(/,/g, '')) || 0,
    maxPriceFilter: Number(f.maxPrice.replace(/,/g, '')) || 999999999,
    minSqFtFilter: Number(f.minSqft) || 0,
    maxSqFtFilter: Number(f.maxSqft) || 0,
    minBedsFilter: Number(f.minBeds) || 0,
    minBathsFilter: Number(f.minBaths) || 0,
    minYearFilter: Number(f.minYearBuilt) || 0,
    maxYearFilter: Number(f.maxYearBuilt) || 9999,
    minGarageFilter: Number(f.minGarageSpaces) || 0,
    minAcresFilter: Number(f.minLotSize) || 0,
    maxAcresFilter: Number(f.maxLotSize) || 10000,
    ageRestrictFilter: f.includeSeniorCommunities || false,
    poolFilter: f.hasPool || false,
    singleStoryFilter: f.singleStory ? 'Yes' : undefined,
    singleFamily: f.singleFamily ? 'Single Family Residence' : '',
    townHomes: f.townHomes ? 'Townhouse' : '',
    condos: f.condos ? 'Condominium' : '',
});

const SaveSearchDialog = ({ visible, onClose, appliedFilters, activeAreas = [], drawnPolygonGeoJSON, mapBounds }) => {
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    const [selectedLead, setSelectedLead] = useState(null);
    const [leadQuery, setLeadQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [frequency, setFrequency] = useState('Instantly');
    const [searchName, setSearchName] = useState('');
    const [saving, setSaving] = useState(false);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Reset state when dialog opens
    useEffect(() => {
        if (visible) {
            setSelectedLead(null);
            setLeadQuery('');
            setDropdownOpen(false);
            setFrequency('Instantly');
            setSearchName('');
            setSaving(false);
        }
    }, [visible]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    // Recent leads (sorted by last_visit desc)
    const recentLeads = useMemo(() => {
        return [...allLeads]
            .sort((a, b) => {
                const da = a.last_visit ? new Date(a.last_visit) : new Date(0);
                const db = b.last_visit ? new Date(b.last_visit) : new Date(0);
                return db - da;
            })
            .slice(0, 5);
    }, [allLeads]);

    // Filtered leads based on query
    const filteredLeads = useMemo(() => {
        const q = leadQuery.toLowerCase().trim();
        if (!q) return recentLeads;
        return allLeads
            .filter((lead) => {
                const displayName = getLeadDisplayName(lead).toLowerCase();
                const email = (lead.email || '').toLowerCase();
                return displayName.includes(q) || email.includes(q);
            })
            .slice(0, 10);
    }, [leadQuery, allLeads, recentLeads]);

    // Build search summary pills
    const summaryPills = useMemo(() => {
        const pills = [];
        const f = appliedFilters;

        // Areas
        if (activeAreas.length > 0) {
            activeAreas.forEach((area) => {
                pills.push({ label: area.name, type: area.type });
            });
        } else if (drawnPolygonGeoJSON) {
            pills.push({ label: 'Custom Drawn Area', type: 'Polygon' });
        } else {
            pills.push({ label: 'Current Map View', type: 'Bounds' });
        }

        // Price
        const minP = f.minPrice.replace(/,/g, '');
        const maxP = f.maxPrice.replace(/,/g, '');
        if (minP && maxP) {
            pills.push({ label: `${formatShortPrice(minP)} \u2013 ${formatShortPrice(maxP)}`, type: 'Price' });
        } else if (minP) {
            pills.push({ label: `${formatShortPrice(minP)}+`, type: 'Price' });
        } else if (maxP) {
            pills.push({ label: `Up to ${formatShortPrice(maxP)}`, type: 'Price' });
        }

        // Beds
        if (f.minBeds && f.maxBeds) {
            pills.push({ label: `${f.minBeds}\u2013${f.maxBeds} Beds`, type: 'Beds' });
        } else if (f.minBeds) {
            pills.push({ label: `${f.minBeds}+ Beds`, type: 'Beds' });
        } else if (f.maxBeds) {
            pills.push({ label: `Up to ${f.maxBeds} Beds`, type: 'Beds' });
        }

        // Baths
        if (f.minBaths && f.maxBaths) {
            pills.push({ label: `${f.minBaths}\u2013${f.maxBaths} Baths`, type: 'Baths' });
        } else if (f.minBaths) {
            pills.push({ label: `${f.minBaths}+ Baths`, type: 'Baths' });
        } else if (f.maxBaths) {
            pills.push({ label: `Up to ${f.maxBaths} Baths`, type: 'Baths' });
        }

        // More filters
        if (f.minLotSize || f.maxLotSize) {
            const parts = [];
            if (f.minLotSize) parts.push(`${f.minLotSize}+`);
            if (f.maxLotSize) parts.push(f.minLotSize ? `\u2013${f.maxLotSize}` : `Up to ${f.maxLotSize}`);
            pills.push({ label: `${parts.join('')} Acres`, type: 'Lot' });
        }
        if (f.minYearBuilt || f.maxYearBuilt) {
            if (f.minYearBuilt && f.maxYearBuilt) {
                pills.push({ label: `Built ${f.minYearBuilt}\u2013${f.maxYearBuilt}`, type: 'Year' });
            } else if (f.minYearBuilt) {
                pills.push({ label: `Built ${f.minYearBuilt}+`, type: 'Year' });
            } else {
                pills.push({ label: `Built before ${f.maxYearBuilt}`, type: 'Year' });
            }
        }
        if (f.minGarageSpaces || f.maxGarageSpaces) {
            pills.push({ label: `${f.minGarageSpaces || '0'}+ Garage`, type: 'Garage' });
        }
        if (f.minSqft || f.maxSqft) {
            if (f.minSqft && f.maxSqft) {
                pills.push({ label: `${Number(f.minSqft).toLocaleString()}\u2013${Number(f.maxSqft).toLocaleString()} SqFt`, type: 'SqFt' });
            } else if (f.minSqft) {
                pills.push({ label: `${Number(f.minSqft).toLocaleString()}+ SqFt`, type: 'SqFt' });
            } else {
                pills.push({ label: `Up to ${Number(f.maxSqft).toLocaleString()} SqFt`, type: 'SqFt' });
            }
        }
        {
            const types = [];
            if (f.singleFamily) types.push('SFR');
            if (f.townHomes) types.push('TH');
            if (f.condos) types.push('Condo');
            if (types.length > 0) pills.push({ label: types.join(', '), type: 'Type' });
        }
        if (f.singleStory) pills.push({ label: 'Single Story', type: 'Feature' });
        if (f.hasPool) pills.push({ label: 'Pool Required', type: 'Feature' });
        if (f.includeSeniorCommunities) pills.push({ label: 'Incl. Senior', type: 'Feature' });

        return pills;
    }, [appliedFilters, activeAreas, drawnPolygonGeoJSON]);

    const handleSelectLead = useCallback((lead) => {
        setSelectedLead(lead);
        setLeadQuery(getLeadDisplayName(lead));
        setDropdownOpen(false);
    }, []);

    const handleClearLead = useCallback(() => {
        setSelectedLead(null);
        setLeadQuery('');
        inputRef.current?.focus();
    }, []);

    const handleSave = useCallback(async () => {
        if (!selectedLead || saving) return;
        setSaving(true);

        const name = searchName.trim() || buildAutoName(appliedFilters, activeAreas);

        const savedSearch = {
            searchId: crypto.randomUUID(),
            searchName: name,
            searchFrequency: frequency,
            searchFilter: buildSearchFilter(appliedFilters),
        };

        // Areas
        if (activeAreas.length > 0) {
            savedSearch.areaName = activeAreas[0].name;
            savedSearch.areaType = activeAreas[0].type;
            savedSearch.areas = activeAreas.map((a) => ({ areaName: a.name, areaType: a.type }));
        }

        // Custom polygon
        if (drawnPolygonGeoJSON) {
            savedSearch.customPolygon = drawnPolygonGeoJSON;
        }

        // Map bounds (always include as reference/fallback)
        if (mapBounds) {
            savedSearch.bounds = { ...mapBounds };
        }

        try {
            await IrgApi.post(
                `/users/save-client-search?userId=${selectedLead.user_id}`,
                { savedSearch },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            showToast('success', `Search saved for ${getLeadDisplayName(selectedLead)}`, 'Search Saved!', 'top-right');
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save search. Please try again.';
            showToast('error', msg, 'Error', 'top-right');
        }

        setSaving(false);
    }, [selectedLead, saving, searchName, frequency, appliedFilters, activeAreas, drawnPolygonGeoJSON, mapBounds, isLoggedIn, onClose]);

    if (!visible) return null;

    return (
        <>
            <button
                className="save-search-dialog__backdrop"
                onClick={onClose}
                type="button"
                aria-label="Close save search dialog"
            />
            <div className="save-search-dialog__panel">
                {/* Header */}
                <div className="save-search-dialog__header">
                    <span className="save-search-dialog__title">Save Search</span>
                    <button
                        className="save-search-dialog__close"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        <i className="pi pi-times" />
                    </button>
                </div>

                <div className="save-search-dialog__body">
                    {/* Section 1: Search Summary */}
                    <div className="save-search-dialog__section">
                        <div className="save-search-dialog__section-label">Search Summary</div>
                        <div className="save-search-dialog__pills">
                            {summaryPills.map((pill) => (
                                <span key={`${pill.type}-${pill.label}`} className={`save-search-dialog__pill save-search-dialog__pill--${pill.type === 'Bounds' || pill.type === 'Polygon' || pill.type === 'Neighborhood' || pill.type === 'City' || pill.type === 'Zip' || pill.type === 'CondoBuilding' ? 'area' : 'filter'}`}>
                                    {pill.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Assign to Lead */}
                    <div className="save-search-dialog__section">
                        <div className="save-search-dialog__section-label">
                            Assign to Lead <span className="save-search-dialog__required">*</span>
                        </div>
                        <div className="save-search-dialog__lead-picker" ref={dropdownRef}>
                            {selectedLead ? (
                                <div className="save-search-dialog__lead-selected">
                                    <i className="pi pi-user" />
                                    <span>{getLeadDisplayName(selectedLead)}</span>
                                    <button type="button" onClick={handleClearLead} aria-label="Remove lead">
                                        <i className="pi pi-times" />
                                    </button>
                                </div>
                            ) : (
                                <div className="save-search-dialog__lead-input-wrap">
                                    <i className="pi pi-search save-search-dialog__lead-icon" />
                                    <input
                                        ref={inputRef}
                                        className="save-search-dialog__lead-input"
                                        placeholder="Search for a lead..."
                                        value={leadQuery}
                                        onChange={(e) => {
                                            setLeadQuery(e.target.value);
                                            setDropdownOpen(true);
                                        }}
                                        onFocus={() => setDropdownOpen(true)}
                                    />
                                </div>
                            )}
                            {dropdownOpen && !selectedLead && (
                                <div className="save-search-dialog__lead-dropdown">
                                    {filteredLeads.length === 0 ? (
                                        <div className="save-search-dialog__lead-empty">No leads found</div>
                                    ) : (
                                        filteredLeads.map((lead) => (
                                            <button
                                                key={lead._id}
                                                type="button"
                                                className="save-search-dialog__lead-option"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handleSelectLead(lead)}
                                            >
                                                <span className="save-search-dialog__lead-name">
                                                    {getLeadDisplayName(lead)}
                                                </span>
                                                {lead.email && getLeadDisplayName(lead) !== lead.email && (
                                                    <span className="save-search-dialog__lead-email">
                                                        {lead.email}
                                                    </span>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Alert Frequency */}
                    <div className="save-search-dialog__section">
                        <div className="save-search-dialog__section-label">Send Alert Emails</div>
                        <div className="save-search-dialog__frequency">
                            {FREQUENCY_OPTIONS.map((opt) => (
                                <label key={opt.value} className="save-search-dialog__radio">
                                    <input
                                        type="radio"
                                        name="save-search-frequency"
                                        value={opt.value}
                                        checked={frequency === opt.value}
                                        onChange={() => setFrequency(opt.value)}
                                    />
                                    <span className="save-search-dialog__radio-dot" />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Search Name */}
                    <div className="save-search-dialog__section">
                        <div className="save-search-dialog__section-label">Search Name (optional)</div>
                        <input
                            className="save-search-dialog__name-input"
                            placeholder="eg. John's 3BR Search in Clairemont"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="save-search-dialog__actions">
                    <button
                        className="save-search-dialog__btn save-search-dialog__btn--secondary"
                        onClick={onClose}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="save-search-dialog__btn save-search-dialog__btn--primary"
                        onClick={handleSave}
                        type="button"
                        disabled={!selectedLead || saving}
                    >
                        {saving ? (
                            <><i className="pi pi-spin pi-spinner" style={{ marginRight: '0.375rem' }} />Saving...</>
                        ) : (
                            'Save Search'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SaveSearchDialog;
