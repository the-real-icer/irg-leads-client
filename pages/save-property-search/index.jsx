// React & NextJS
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const AutoComplete = dynamic(
    () => import('primereact/autocomplete').then((mod) => mod.AutoComplete || mod.default),
    { ssr: false },
);
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});
const RadioButton = dynamic(() => import('primereact/radiobutton').then((mod) => mod.RadioButton), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), {
    ssr: false,
});

import showToast from '../../utils/showToast';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// ── Formatting helpers ──────────────────────────────────────────────
const formatWithCommas = (val) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('en-US');
};

const formatPrice = (val) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return '$' + Number(num).toLocaleString('en-US');
};

const stripFormatting = (val) => val.replace(/[^0-9.]/g, '');

// ── Validation helpers ──────────────────────────────────────────────
const validatePrice = (val) => {
    if (!val) return '';
    const raw = stripFormatting(val);
    if (!raw || isNaN(Number(raw)) || Number(raw) <= 0) return 'Please enter a valid price';
    return '';
};

const validateWholeNumber = (val) => {
    if (!val) return '';
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw || isNaN(Number(raw)) || Number(raw) < 0) return 'Please enter a whole number';
    if (val.includes('.')) return 'Please enter a whole number';
    return '';
};

const validateBathrooms = (val) => {
    if (!val) return '';
    const raw = val.trim();
    const num = Number(raw);
    if (isNaN(num) || num < 0) return 'Please enter a valid number';
    // Accept whole numbers and .5 increments
    const decimal = num % 1;
    if (decimal !== 0 && decimal !== 0.5) return 'Use whole numbers or .5 increments';
    return '';
};

const validateSqft = (val) => {
    if (!val) return '';
    const raw = stripFormatting(val);
    if (!raw || isNaN(Number(raw)) || Number(raw) <= 0) return 'Please enter a valid number';
    if (raw.includes('.')) return 'Please enter a whole number';
    return '';
};

// ── Shared inline style helpers (using CSS vars for dark mode) ──────
const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: 'hsl(var(--foreground))',
};

const sectionTitleStyle = {
    fontSize: '0.8125rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'hsl(var(--foreground-muted))',
    marginBottom: '1rem',
};

const errorStyle = {
    fontSize: '0.75rem',
    color: 'hsl(var(--danger))',
    marginTop: '0.25rem',
};

const pairGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
};

const pairGridMobileStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.75rem',
};

// ── Lead suggestion template ────────────────────────────────────────
const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Never visited';
    const now = new Date();
    const visitDate = new Date(lastVisit);
    const diffMs = now - visitDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
};


const SavePropertySearch = () => {
    // ── Redux State ──
    const allLeads = useSelector((state) => state.allLeadsPage);
    const irgAreas = useSelector((state) => state.irgAreas);

    // ── Responsive helper for pair grids ──
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        setIsMobile(mq.matches);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // ── Lead search state ──
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadInput, setLeadInput] = useState('');
    const [leadSuggestions, setLeadSuggestions] = useState([]);

    // ── Areas multi-select state ──
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [areaSuggestions, setAreaSuggestions] = useState([]);

    // ── Search criteria state ──
    const [searchCriteria, setSearchCriteria] = useState({
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        maxBedrooms: '',
        minBathrooms: '',
        maxBathrooms: '',
        minSqFt: '',
        maxSqFt: '',
        minLotSize: null,
        maxLotSize: null,
    });

    // ── Validation errors ──
    const [errors, setErrors] = useState({});

    // ── Checkbox state ──
    const [searchOptions, setSearchOptions] = useState({
        singleStoryOnly: false,
        exclude55Plus: true,
        mustHavePool: false,
        hasADU: false,
    });

    // ── Dialog state ──
    const [showDialog, setShowDialog] = useState(false);
    const [emailFrequency, setEmailFrequency] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // ── Lot size dropdown options ──
    const lotSizeOptions = [
        { label: '2,000 sqft', value: 2000 },
        { label: '3,000 sqft', value: 3000 },
        { label: '4,000 sqft', value: 4000 },
        { label: '5,000 sqft', value: 5000 },
        { label: '7,500 sqft', value: 7500 },
        { label: '10,000 sqft', value: 10000 },
        { label: '1/4 Acre', value: 10890 },
        { label: '1/2 Acre', value: 21780 },
        { label: '1 Acre', value: 43560 },
        { label: '2+ Acres', value: 87120 },
    ];

    // ══════════════════════════════════════════════════════════════
    // SECTION 1 — LEAD AUTOCOMPLETE
    // ══════════════════════════════════════════════════════════════

    // Sort leads by most recent visit for default suggestions
    const recentLeads = useMemo(() => {
        return [...allLeads]
            .sort((a, b) => {
                const da = a.last_visit ? new Date(a.last_visit) : new Date(0);
                const db = b.last_visit ? new Date(b.last_visit) : new Date(0);
                return db - da;
            })
            .slice(0, 5);
    }, [allLeads]);

    const handleLeadSearch = useCallback((event) => {
        const query = (event.query || '').toLowerCase().trim();
        if (!query) {
            // Show 5 most recently active leads
            setLeadSuggestions(recentLeads);
            return;
        }
        const filtered = allLeads.filter((lead) => {
            const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase();
            return fullName.includes(query);
        });
        setLeadSuggestions(filtered.slice(0, 10));
    }, [allLeads, recentLeads]);

    const leadItemTemplate = (lead) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0.125rem 0' }}>
            <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))', fontSize: '0.9rem' }}>
                {lead.first_name} {lead.last_name}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                {lead.email || formatLastVisit(lead.last_visit)}
            </span>
        </div>
    );

    const handleLeadSelect = useCallback((e) => {
        const lead = e.value;
        if (lead && lead._id) {
            setSelectedLead(lead);
            setLeadInput(`${lead.first_name} ${lead.last_name}`);
        }
    }, []);

    const handleLeadInputChange = useCallback((e) => {
        const val = e.value;
        // If the user clears the input, also clear selection
        if (typeof val === 'string') {
            setLeadInput(val);
            if (!val) setSelectedLead(null);
        } else {
            // It's a lead object from selection
            setLeadInput(`${val.first_name} ${val.last_name}`);
        }
    }, []);

    // ══════════════════════════════════════════════════════════════
    // SECTION 3 — AREAS MULTI-SELECT
    // ══════════════════════════════════════════════════════════════

    const allAreaOptions = useMemo(() => {
        const items = [];
        if (irgAreas?.City?.length) {
            irgAreas.City.forEach((area) => {
                items.push({ label: area.name, name: area.search_name || area.name, type: 'City', _id: area._id });
            });
        }
        if (irgAreas?.Neighborhood?.length) {
            irgAreas.Neighborhood.forEach((area) => {
                items.push({ label: area.name, name: area.search_name || area.name, type: 'Neighborhood', _id: area._id });
            });
        }
        if (irgAreas?.Zip?.length) {
            irgAreas.Zip.forEach((area) => {
                items.push({ label: area.name, name: area.name, type: 'Zip', _id: area._id });
            });
        }
        return items;
    }, [irgAreas]);

    const handleAreaSearch = useCallback((event) => {
        const query = (event.query || '').toLowerCase().trim();
        // Exclude already-selected areas
        const selectedIds = new Set(selectedAreas.map((a) => a._id));
        const pool = allAreaOptions.filter((a) => !selectedIds.has(a._id));

        if (!query) {
            setAreaSuggestions(pool.slice(0, 8));
            return;
        }
        const filtered = pool.filter((item) => item.label.toLowerCase().includes(query));
        setAreaSuggestions(filtered.slice(0, 15));
    }, [allAreaOptions, selectedAreas]);

    const areaItemTemplate = (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.125rem 0' }}>
            <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'hsl(var(--primary))',
                background: 'hsl(var(--primary) / 0.1)',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
            }}>
                {item.type}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>{item.label}</span>
        </div>
    );

    // ══════════════════════════════════════════════════════════════
    // SECTION 4 — PROPERTY CHARACTERISTICS HANDLERS
    // ══════════════════════════════════════════════════════════════

    const handleCriteriaChange = (field, value) => {
        setSearchCriteria((prev) => ({ ...prev, [field]: value }));
        // Clear error on change
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handlePriceChange = (field, raw) => {
        handleCriteriaChange(field, formatPrice(raw));
    };

    const handleSqftChange = (field, raw) => {
        handleCriteriaChange(field, formatWithCommas(raw));
    };

    const handleBlur = (field, validator) => {
        const val = searchCriteria[field];
        const err = validator(val);
        setErrors((prev) => ({ ...prev, [field]: err }));
    };

    const handleCheckboxChange = (field, value) => {
        setSearchOptions((prev) => ({ ...prev, [field]: value }));
    };

    // ══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ══════════════════════════════════════════════════════════════

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowDialog(true);
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setEmailFrequency('');
        setEmailSubject('');
        setEmailBody('');
    };

    const resetForm = () => {
        setSelectedLead(null);
        setLeadInput('');
        setSelectedAreas([]);
        setSearchCriteria({
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            maxBedrooms: '',
            minBathrooms: '',
            maxBathrooms: '',
            minSqFt: '',
            maxSqFt: '',
            minLotSize: null,
            maxLotSize: null,
        });
        setErrors({});
        setSearchOptions({
            singleStoryOnly: false,
            exclude55Plus: true,
            mustHavePool: false,
            hasADU: false,
        });
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();

        if (!emailFrequency) {
            showToast('warn', 'Please select an email frequency', 'Email Frequency Required', 'top-right');
            return;
        }

        const formData = {
            lead: selectedLead,
            areas: selectedAreas,
            criteria: searchCriteria,
            options: searchOptions,
            emailFrequency,
            emailSubject,
            emailBody,
        };

        console.log('Form submitted:', formData); // eslint-disable-line

        showToast('success', 'Property Search has been saved!', 'Saved!', 'top-right');
        handleDialogClose();
        resetForm();
    };

    // ══════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════

    const currentPairGrid = isMobile ? pairGridMobileStyle : pairGridStyle;

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
                        Save A Property Search
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'hsl(var(--foreground-muted))' }}>
                        Create and save custom property searches for your leads
                    </p>
                </div>

                <form onSubmit={handleInitialSubmit}>

                    {/* ═══ CARD 1: Lead Information ═══════════════════════ */}
                    <Card title="Lead Information" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <label htmlFor="lead-search" style={labelStyle}>
                                Link To A Lead
                            </label>
                            <AutoComplete
                                id="lead-search"
                                value={leadInput}
                                suggestions={leadSuggestions}
                                completeMethod={handleLeadSearch}
                                onChange={handleLeadInputChange}
                                onSelect={handleLeadSelect}
                                itemTemplate={leadItemTemplate}
                                field="first_name"
                                placeholder="Search for a lead by name..."
                                emptyMessage="No leads found"
                                style={{ width: '100%' }}
                                inputStyle={{ width: '100%' }}
                                panelStyle={{ zIndex: 1100 }}
                                delay={100}
                                minLength={0}
                                dropdown
                            />
                            {selectedLead && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '6px',
                                    background: 'hsl(var(--primary) / 0.1)',
                                    color: 'hsl(var(--primary))',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                }}>
                                    <i className="pi pi-user" style={{ fontSize: '0.75rem' }} />
                                    {selectedLead.first_name} {selectedLead.last_name}
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedLead(null); setLeadInput(''); }}
                                        style={{
                                            marginLeft: '0.25rem',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            color: 'hsl(var(--primary))',
                                            lineHeight: 1,
                                        }}
                                        aria-label="Remove lead"
                                    >
                                        <i className="pi pi-times" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* ═══ CARD 2: Search Criteria ═══════════════════════ */}
                    <Card title="Search Criteria" style={{ marginBottom: '1.5rem' }}>
                        {/* Areas autocomplete */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="area-search" style={labelStyle}>
                                Areas
                            </label>
                            <div style={{ position: 'relative' }}>
                                <i
                                    className="pi pi-search"
                                    style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '0.85rem',
                                        zIndex: 1,
                                        color: 'hsl(var(--foreground-muted))',
                                        fontSize: '0.875rem',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <AutoComplete
                                    id="area-search"
                                    value={selectedAreas}
                                    suggestions={areaSuggestions}
                                    completeMethod={handleAreaSearch}
                                    onChange={(e) => setSelectedAreas(e.value)}
                                    itemTemplate={areaItemTemplate}
                                    field="label"
                                    placeholder={selectedAreas.length ? '' : 'Search city, zip, neighborhood...'}
                                    emptyMessage="No areas found"
                                    multiple
                                    className="areas-autocomplete"
                                    style={{ width: '100%' }}
                                    inputStyle={{ width: '100%' }}
                                    panelStyle={{ zIndex: 1100 }}
                                    delay={100}
                                    minLength={0}
                                />
                            </div>
                        </div>

                        {/* ── Property Characteristics sub-section ── */}
                        <div style={sectionTitleStyle}>Property Characteristics</div>

                        {/* Price */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.375rem' }}>Price</label>
                            <div style={currentPairGrid}>
                                <div>
                                    <InputText
                                        value={searchCriteria.minPrice}
                                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                        onBlur={() => handleBlur('minPrice', validatePrice)}
                                        placeholder="Min Price"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.minPrice && <div style={errorStyle}>{errors.minPrice}</div>}
                                </div>
                                <div>
                                    <InputText
                                        value={searchCriteria.maxPrice}
                                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                        onBlur={() => handleBlur('maxPrice', validatePrice)}
                                        placeholder="Max Price"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.maxPrice && <div style={errorStyle}>{errors.maxPrice}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.375rem' }}>Bedrooms</label>
                            <div style={currentPairGrid}>
                                <div>
                                    <InputText
                                        value={searchCriteria.minBedrooms}
                                        onChange={(e) => handleCriteriaChange('minBedrooms', e.target.value)}
                                        onBlur={() => handleBlur('minBedrooms', validateWholeNumber)}
                                        placeholder="Min Beds"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.minBedrooms && <div style={errorStyle}>{errors.minBedrooms}</div>}
                                </div>
                                <div>
                                    <InputText
                                        value={searchCriteria.maxBedrooms}
                                        onChange={(e) => handleCriteriaChange('maxBedrooms', e.target.value)}
                                        onBlur={() => handleBlur('maxBedrooms', validateWholeNumber)}
                                        placeholder="Max Beds"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.maxBedrooms && <div style={errorStyle}>{errors.maxBedrooms}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Bathrooms */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.375rem' }}>Bathrooms</label>
                            <div style={currentPairGrid}>
                                <div>
                                    <InputText
                                        value={searchCriteria.minBathrooms}
                                        onChange={(e) => handleCriteriaChange('minBathrooms', e.target.value)}
                                        onBlur={() => handleBlur('minBathrooms', validateBathrooms)}
                                        placeholder="Min Baths"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.minBathrooms && <div style={errorStyle}>{errors.minBathrooms}</div>}
                                </div>
                                <div>
                                    <InputText
                                        value={searchCriteria.maxBathrooms}
                                        onChange={(e) => handleCriteriaChange('maxBathrooms', e.target.value)}
                                        onBlur={() => handleBlur('maxBathrooms', validateBathrooms)}
                                        placeholder="Max Baths"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.maxBathrooms && <div style={errorStyle}>{errors.maxBathrooms}</div>}
                                </div>
                            </div>
                        </div>

                        {/* SqFt */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.375rem' }}>Square Footage</label>
                            <div style={currentPairGrid}>
                                <div>
                                    <InputText
                                        value={searchCriteria.minSqFt}
                                        onChange={(e) => handleSqftChange('minSqFt', e.target.value)}
                                        onBlur={() => handleBlur('minSqFt', validateSqft)}
                                        placeholder="Min SqFt"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.minSqFt && <div style={errorStyle}>{errors.minSqFt}</div>}
                                </div>
                                <div>
                                    <InputText
                                        value={searchCriteria.maxSqFt}
                                        onChange={(e) => handleSqftChange('maxSqFt', e.target.value)}
                                        onBlur={() => handleBlur('maxSqFt', validateSqft)}
                                        placeholder="Max SqFt"
                                        style={{ width: '100%' }}
                                    />
                                    {errors.maxSqFt && <div style={errorStyle}>{errors.maxSqFt}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Lot Size */}
                        <div>
                            <label style={{ ...labelStyle, marginBottom: '0.375rem' }}>Lot Size</label>
                            <div style={currentPairGrid}>
                                <div>
                                    <Dropdown
                                        value={searchCriteria.minLotSize}
                                        options={lotSizeOptions}
                                        onChange={(e) => handleCriteriaChange('minLotSize', e.value)}
                                        placeholder="Min Lot Size"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <Dropdown
                                        value={searchCriteria.maxLotSize}
                                        options={lotSizeOptions}
                                        onChange={(e) => handleCriteriaChange('maxLotSize', e.value)}
                                        placeholder="Max Lot Size"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ═══ CARD 3: Additional Options ═════════════════════ */}
                    <Card title="Additional Options" style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="single-story"
                                    checked={searchOptions.singleStoryOnly}
                                    onChange={(e) => handleCheckboxChange('singleStoryOnly', e.checked)}
                                />
                                <label htmlFor="single-story" style={{ fontWeight: '500', color: 'hsl(var(--foreground))', cursor: 'pointer' }}>
                                    Single Story Only
                                </label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="exclude-55"
                                    checked={searchOptions.exclude55Plus}
                                    onChange={(e) => handleCheckboxChange('exclude55Plus', e.checked)}
                                />
                                <label htmlFor="exclude-55" style={{ fontWeight: '500', color: 'hsl(var(--foreground))', cursor: 'pointer' }}>
                                    Exclude 55+ Communities
                                </label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="must-have-pool"
                                    checked={searchOptions.mustHavePool}
                                    onChange={(e) => handleCheckboxChange('mustHavePool', e.checked)}
                                />
                                <label htmlFor="must-have-pool" style={{ fontWeight: '500', color: 'hsl(var(--foreground))', cursor: 'pointer' }}>
                                    Must Have Pool
                                </label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="has-adu"
                                    checked={searchOptions.hasADU}
                                    onChange={(e) => handleCheckboxChange('hasADU', e.checked)}
                                />
                                <label htmlFor="has-adu" style={{ fontWeight: '500', color: 'hsl(var(--foreground))', cursor: 'pointer' }}>
                                    Has ADU?
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button
                            label="Save Search As"
                            icon="pi pi-bell"
                            type="submit"
                            style={{
                                padding: '0.75rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                background: 'hsl(var(--primary))',
                                border: 'none',
                                color: 'hsl(var(--primary-foreground))',
                            }}
                        />
                    </div>
                </form>
            </div>

            {/* ═══ Email Configuration Dialog ═══════════════════════ */}
            <Dialog
                header="Email Notification Settings"
                visible={showDialog}
                onHide={handleDialogClose}
                style={{ width: '600px', maxWidth: '90vw' }}
                contentStyle={{ padding: '1.5rem' }}
            >
                <form onSubmit={handleFinalSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'hsl(var(--foreground))', marginBottom: '1rem' }}>
                            Email Frequency
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { id: 'freq-instantly', value: 'instantly', label: 'Instantly' },
                                { id: 'freq-twice-week', value: 'twice-weekly', label: 'Twice A Week' },
                                { id: 'freq-daily', value: 'daily', label: 'Daily' },
                                { id: 'freq-weekly', value: 'weekly', label: 'Weekly' },
                            ].map((opt) => (
                                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <RadioButton
                                        inputId={opt.id}
                                        name="frequency"
                                        value={opt.value}
                                        onChange={(e) => setEmailFrequency(e.value)}
                                        checked={emailFrequency === opt.value}
                                    />
                                    <label htmlFor={opt.id} style={{ fontWeight: '500', color: 'hsl(var(--foreground))', cursor: 'pointer' }}>
                                        {opt.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email-subject" style={labelStyle}>Email Subject</label>
                        <InputText
                            id="email-subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter email subject"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email-body" style={labelStyle}>Email Body</label>
                        <InputTextarea
                            id="email-body"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Enter email message"
                            rows={6}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={handleDialogClose}
                            type="button"
                            style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                        />
                        <Button
                            label="Save Search & Notify"
                            icon="pi pi-check"
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontWeight: '600',
                                background: 'hsl(var(--primary))',
                                border: 'none',
                                color: 'hsl(var(--primary-foreground))',
                            }}
                        />
                    </div>
                </form>
            </Dialog>
        </MainLayout>
    );
};

export default SavePropertySearch;
