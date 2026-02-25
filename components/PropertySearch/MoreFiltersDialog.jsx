import { useState, useEffect } from 'react';

const EMPTY_MORE = {
    minLotSize: '',
    maxLotSize: '',
    minYearBuilt: '',
    maxYearBuilt: '',
    minGarageSpaces: '',
    maxGarageSpaces: '',
    singleStory: false,
    hasPool: false,
    includeSeniorCommunities: false,
};

const MoreFiltersDialog = ({ visible, filters, onApply, onClose }) => {
    const [local, setLocal] = useState(EMPTY_MORE);

    // Sync local state from applied filters when dialog opens
    useEffect(() => {
        if (visible) {
            setLocal({
                minLotSize: filters.minLotSize || '',
                maxLotSize: filters.maxLotSize || '',
                minYearBuilt: filters.minYearBuilt || '',
                maxYearBuilt: filters.maxYearBuilt || '',
                minGarageSpaces: filters.minGarageSpaces || '',
                maxGarageSpaces: filters.maxGarageSpaces || '',
                singleStory: filters.singleStory || false,
                hasPool: filters.hasPool || false,
                includeSeniorCommunities: filters.includeSeniorCommunities || false,
            });
        }
    }, [visible, filters]);

    if (!visible) return null;

    const handleNumChange = (field) => (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setLocal((prev) => ({ ...prev, [field]: val }));
    };

    const handleCheckbox = (field) => () => {
        setLocal((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleApply = () => {
        onApply(local);
    };

    const handleClear = () => {
        setLocal(EMPTY_MORE);
    };

    return (
        <>
            <div className="more-filters-dialog__backdrop" onClick={onClose} />
            <div className="more-filters-dialog__panel">
                <div className="more-filters-dialog__header">
                    <span className="more-filters-dialog__title">More Filters</span>
                    <button
                        className="more-filters-dialog__close"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        <i className="pi pi-times" />
                    </button>
                </div>

                <div className="more-filters-dialog__body">
                    {/* Lot Size */}
                    <div className="more-filters-dialog__group">
                        <div className="more-filters-dialog__label">Lot Size (acres)</div>
                        <div className="more-filters-dialog__row">
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Min"
                                value={local.minLotSize}
                                onChange={handleNumChange('minLotSize')}
                            />
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Max"
                                value={local.maxLotSize}
                                onChange={handleNumChange('maxLotSize')}
                            />
                        </div>
                    </div>

                    {/* Year Built */}
                    <div className="more-filters-dialog__group">
                        <div className="more-filters-dialog__label">Year Built</div>
                        <div className="more-filters-dialog__row">
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Min"
                                value={local.minYearBuilt}
                                onChange={handleNumChange('minYearBuilt')}
                            />
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Max"
                                value={local.maxYearBuilt}
                                onChange={handleNumChange('maxYearBuilt')}
                            />
                        </div>
                    </div>

                    {/* Garage Spaces */}
                    <div className="more-filters-dialog__group">
                        <div className="more-filters-dialog__label">Garage Spaces</div>
                        <div className="more-filters-dialog__row">
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Min"
                                value={local.minGarageSpaces}
                                onChange={handleNumChange('minGarageSpaces')}
                            />
                            <input
                                className="more-filters-dialog__input"
                                placeholder="Max"
                                value={local.maxGarageSpaces}
                                onChange={handleNumChange('maxGarageSpaces')}
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="more-filters-dialog__group">
                        <div className="more-filters-dialog__label">Property Features</div>
                        <label className="more-filters-dialog__checkbox">
                            <input
                                type="checkbox"
                                checked={local.singleStory}
                                onChange={handleCheckbox('singleStory')}
                            />
                            Single Story Only
                        </label>
                        <label className="more-filters-dialog__checkbox">
                            <input
                                type="checkbox"
                                checked={local.hasPool}
                                onChange={handleCheckbox('hasPool')}
                            />
                            Must Have Pool
                        </label>
                        <label className="more-filters-dialog__checkbox">
                            <input
                                type="checkbox"
                                checked={local.includeSeniorCommunities}
                                onChange={handleCheckbox('includeSeniorCommunities')}
                            />
                            Include Senior Communities
                        </label>
                        <span className="more-filters-dialog__checkbox-note">
                            Senior communities are excluded by default
                        </span>
                    </div>
                </div>

                <div className="more-filters-dialog__actions">
                    <button
                        className="more-filters-dialog__btn more-filters-dialog__btn--secondary"
                        onClick={handleClear}
                        type="button"
                    >
                        Clear
                    </button>
                    <button
                        className="more-filters-dialog__btn more-filters-dialog__btn--primary"
                        onClick={handleApply}
                        type="button"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default MoreFiltersDialog;
