import { useState, useRef, useEffect, useCallback } from 'react';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'Active' },
    { label: 'Under Contract', value: 'Active Under Contract' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Sold', value: 'Closed' },
];

const formatCommas = (val) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('en-US');
};

const SearchToolbar = ({ filters, onFilterChange, onSearch, onReset, isDrawing, onToggleDrawing, moreFiltersCount, onOpenMoreFilters, hasActiveFilters, onOpenSaveSearch, isSaveSearchBlocked }) => {
    // ── Status dropdown state ──
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef(null);

    useEffect(() => {
        if (!statusOpen) return;
        const handleClick = (e) => {
            if (statusRef.current && !statusRef.current.contains(e.target)) {
                setStatusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [statusOpen]);

    const handlePriceChange = useCallback(
        (field) => (e) => {
            onFilterChange(field, formatCommas(e.target.value));
        },
        [onFilterChange]
    );

    const handleNumChange = useCallback(
        (field) => (e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '');
            onFilterChange(field, val);
        },
        [onFilterChange]
    );

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSearch();
    };

    // ── Status helpers ──
    const statuses = filters.statuses || ['Active'];

    const getStatusLabel = () => {
        if (statuses.length === STATUS_OPTIONS.length) return 'All Statuses';
        const first = STATUS_OPTIONS.find((o) => o.value === statuses[0]);
        const label = first?.label || statuses[0];
        return statuses.length > 1 ? `${label} +${statuses.length - 1}` : label;
    };

    const handleStatusToggle = (value) => {
        if (statuses.includes(value)) {
            // Prevent deselecting the last item
            if (statuses.length > 1) {
                onFilterChange('statuses', statuses.filter((s) => s !== value));
            }
        } else {
            onFilterChange('statuses', [...statuses, value]);
        }
    };

    const saveDisabled = !hasActiveFilters || isSaveSearchBlocked;
    const saveTitle = isSaveSearchBlocked
        ? 'Save Search is only available for Active listings'
        : !hasActiveFilters
            ? 'Apply at least one filter to save this search'
            : 'Save this search for a lead';

    return (
        <div className="property-search__toolbar">
            {/* Price */}
            <div className="ps-toolbar__group">
                <span className="ps-toolbar__label">Price</span>
                <input
                    className="ps-toolbar__input ps-toolbar__input--price"
                    placeholder="$ Min"
                    value={filters.minPrice ? `$${filters.minPrice}` : ''}
                    onChange={handlePriceChange('minPrice')}
                    onKeyDown={handleKeyDown}
                />
                <span style={{ color: 'hsl(var(--foreground-muted))' }}>–</span>
                <input
                    className="ps-toolbar__input ps-toolbar__input--price"
                    placeholder="$ Max"
                    value={filters.maxPrice ? `$${filters.maxPrice}` : ''}
                    onChange={handlePriceChange('maxPrice')}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="ps-toolbar__divider" />

            {/* Beds */}
            <div className="ps-toolbar__group">
                <span className="ps-toolbar__label">Beds</span>
                <input
                    className="ps-toolbar__input"
                    placeholder="Min"
                    value={filters.minBeds}
                    onChange={handleNumChange('minBeds')}
                    onKeyDown={handleKeyDown}
                />
                <span style={{ color: 'hsl(var(--foreground-muted))' }}>–</span>
                <input
                    className="ps-toolbar__input"
                    placeholder="Max"
                    value={filters.maxBeds}
                    onChange={handleNumChange('maxBeds')}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="ps-toolbar__divider" />

            {/* Baths */}
            <div className="ps-toolbar__group">
                <span className="ps-toolbar__label">Baths</span>
                <input
                    className="ps-toolbar__input"
                    placeholder="Min"
                    value={filters.minBaths}
                    onChange={handleNumChange('minBaths')}
                    onKeyDown={handleKeyDown}
                />
                <span style={{ color: 'hsl(var(--foreground-muted))' }}>–</span>
                <input
                    className="ps-toolbar__input"
                    placeholder="Max"
                    value={filters.maxBaths}
                    onChange={handleNumChange('maxBaths')}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="ps-toolbar__divider" />

            {/* Status */}
            <div className="ps-toolbar__group ps-toolbar__group--status" ref={statusRef}>
                <span className="ps-toolbar__label">Status</span>
                <button
                    className={`ps-toolbar__status-btn${statusOpen ? ' ps-toolbar__status-btn--open' : ''}`}
                    onClick={() => setStatusOpen(!statusOpen)}
                    type="button"
                >
                    {getStatusLabel()}
                    <i
                        className={`pi pi-chevron-${statusOpen ? 'up' : 'down'}`}
                        style={{ marginLeft: '0.375rem', fontSize: '0.75rem' }}
                    />
                </button>
                {statusOpen && (
                    <div className="ps-toolbar__status-panel">
                        {STATUS_OPTIONS.map((opt) => (
                            <label key={opt.value} className="ps-toolbar__status-option">
                                <input
                                    type="checkbox"
                                    checked={statuses.includes(opt.value)}
                                    onChange={() => handleStatusToggle(opt.value)}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="ps-toolbar__divider" />

            {/* Save Search */}
            <div className="ps-toolbar__save-wrap">
                <button
                    className={`ps-toolbar__btn ps-toolbar__btn--save-search${saveDisabled ? ' ps-toolbar__btn--disabled' : ''}`}
                    onClick={saveDisabled ? undefined : onOpenSaveSearch}
                    type="button"
                    disabled={saveDisabled}
                >
                    <i className="pi pi-bookmark" style={{ marginRight: '0.375rem' }} />
                    Save Search
                </button>
                {isSaveSearchBlocked && (
                    <div className="ps-toolbar__save-tooltip">
                        Only Active listings can be saved
                    </div>
                )}
            </div>

            <div className="ps-toolbar__divider" />

            {/* More Filters */}
            <button
                className={`ps-toolbar__btn ps-toolbar__btn--more-filters${moreFiltersCount > 0 ? ' ps-toolbar__btn--more-filters-active' : ''}`}
                onClick={onOpenMoreFilters}
                type="button"
            >
                <i className="pi pi-sliders-h" style={{ marginRight: '0.375rem' }} />
                More Filters{moreFiltersCount > 0 ? ` (${moreFiltersCount})` : ''}
            </button>

            {/* Actions */}
            <div className="ps-toolbar__actions">
                <button
                    className={`ps-toolbar__btn ps-toolbar__btn--draw${isDrawing ? ' ps-toolbar__btn--draw-active' : ''}`}
                    onClick={onToggleDrawing}
                    type="button"
                    title={isDrawing ? 'Cancel drawing' : 'Draw a custom search area'}
                >
                    <i className="pi pi-pencil" style={{ marginRight: '0.375rem' }} />
                    {isDrawing ? 'Cancel' : 'Draw Area'}
                </button>
                <button
                    className="ps-toolbar__btn ps-toolbar__btn--primary"
                    onClick={onSearch}
                    type="button"
                >
                    Search
                </button>
                <button
                    className="ps-toolbar__btn ps-toolbar__btn--secondary"
                    onClick={onReset}
                    type="button"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default SearchToolbar;
