import { useCallback } from 'react';

const formatCommas = (val) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('en-US');
};

const SearchToolbar = ({ filters, onFilterChange, onSearch, onReset, isDrawing, onToggleDrawing, moreFiltersCount, onOpenMoreFilters, hasActiveFilters, onOpenSaveSearch }) => {
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

            {/* Save Search */}
            <button
                className={`ps-toolbar__btn ps-toolbar__btn--save-search${!hasActiveFilters ? ' ps-toolbar__btn--disabled' : ''}`}
                onClick={onOpenSaveSearch}
                type="button"
                disabled={!hasActiveFilters}
                title={!hasActiveFilters ? 'Apply at least one filter to save this search' : 'Save this search for a lead'}
            >
                <i className="pi pi-bookmark" style={{ marginRight: '0.375rem' }} />
                Save Search
            </button>

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
