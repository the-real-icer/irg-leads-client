const formatCommas = (val) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('en-US');
};

const MobileFilterDrawer = ({ visible, filters, onFilterChange, onSearch, onReset, onClose }) => {
    if (!visible) return null;

    const handlePriceChange = (field) => (e) => {
        onFilterChange(field, formatCommas(e.target.value));
    };

    const handleNumChange = (field) => (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        onFilterChange(field, val);
    };

    const handleSearch = () => {
        onSearch();
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <>
            <div className="mobile-filter-drawer__backdrop" onClick={onClose} />
            <div className="mobile-filter-drawer__panel">
                <div className="mobile-filter-drawer__header">
                    <span className="mobile-filter-drawer__title">Filters</span>
                    <button
                        className="mobile-filter-drawer__close"
                        onClick={onClose}
                        type="button"
                    >
                        <i className="pi pi-times" />
                    </button>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Price</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="$ Min"
                            value={filters.minPrice ? `$${filters.minPrice}` : ''}
                            onChange={handlePriceChange('minPrice')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="$ Max"
                            value={filters.maxPrice ? `$${filters.maxPrice}` : ''}
                            onChange={handlePriceChange('maxPrice')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Beds</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Min"
                            value={filters.minBeds}
                            onChange={handleNumChange('minBeds')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Max"
                            value={filters.maxBeds}
                            onChange={handleNumChange('maxBeds')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Baths</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Min"
                            value={filters.minBaths}
                            onChange={handleNumChange('minBaths')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Max"
                            value={filters.maxBaths}
                            onChange={handleNumChange('maxBaths')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Lot Size (acres)</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Min"
                            value={filters.minLotSize}
                            onChange={handleNumChange('minLotSize')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Max"
                            value={filters.maxLotSize}
                            onChange={handleNumChange('maxLotSize')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Year Built</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Min"
                            value={filters.minYearBuilt}
                            onChange={handleNumChange('minYearBuilt')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Max"
                            value={filters.maxYearBuilt}
                            onChange={handleNumChange('maxYearBuilt')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Garage Spaces</div>
                    <div className="mobile-filter-drawer__row">
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Min"
                            value={filters.minGarageSpaces}
                            onChange={handleNumChange('minGarageSpaces')}
                        />
                        <input
                            className="mobile-filter-drawer__input"
                            placeholder="Max"
                            value={filters.maxGarageSpaces}
                            onChange={handleNumChange('maxGarageSpaces')}
                        />
                    </div>
                </div>

                <div className="mobile-filter-drawer__group">
                    <div className="mobile-filter-drawer__label">Property Features</div>
                    <label className="mobile-filter-drawer__checkbox">
                        <input
                            type="checkbox"
                            checked={filters.singleStory || false}
                            onChange={() => onFilterChange('singleStory', !filters.singleStory)}
                        />
                        Single Story Only
                    </label>
                    <label className="mobile-filter-drawer__checkbox">
                        <input
                            type="checkbox"
                            checked={filters.hasPool || false}
                            onChange={() => onFilterChange('hasPool', !filters.hasPool)}
                        />
                        Must Have Pool
                    </label>
                    <label className="mobile-filter-drawer__checkbox">
                        <input
                            type="checkbox"
                            checked={filters.includeSeniorCommunities || false}
                            onChange={() => onFilterChange('includeSeniorCommunities', !filters.includeSeniorCommunities)}
                        />
                        Include Senior Communities
                    </label>
                    <span className="mobile-filter-drawer__checkbox-note">
                        Senior communities are excluded by default
                    </span>
                </div>

                <div className="mobile-filter-drawer__actions">
                    <button
                        className="mobile-filter-drawer__btn mobile-filter-drawer__btn--primary"
                        onClick={handleSearch}
                        type="button"
                    >
                        Search
                    </button>
                    <button
                        className="mobile-filter-drawer__btn mobile-filter-drawer__btn--secondary"
                        onClick={handleReset}
                        type="button"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </>
    );
};

export default MobileFilterDrawer;
