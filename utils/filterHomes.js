const filteringHomes = (homes, searchFilter) => {
    const filters = {
        price_raw: (price_raw) =>
            price_raw >= searchFilter.minPriceFilter && price_raw <= searchFilter.maxPriceFilter,
        sqft_raw: (sqft_raw) =>
            sqft_raw >= searchFilter.minSqFtFilter && sqft_raw <= searchFilter.maxSqFtFilter,
        bedrooms: (bedrooms) => bedrooms >= searchFilter.minBedsFilter,
        bathrooms: (bathrooms) => bathrooms >= searchFilter.minBathsFilter,
        year_built: (year_built) =>
            year_built >= searchFilter.minYearFilter && year_built <= searchFilter.maxYearFilter,
        garage_spaces: (garage_spaces) => garage_spaces >= searchFilter.minGarageFilter,
        lot_size_acres: (lot_size_acres) => {
            if (searchFilter.minAcresFilter !== 0) {
                return (
                    lot_size_acres >= searchFilter.minAcresFilter &&
                    lot_size_acres <= searchFilter.maxAcresFilter
                );
            }
            if (searchFilter.maxAcresFilter !== 10000) {
                return (
                    lot_size_acres >= searchFilter.minAcresFilter &&
                    lot_size_acres <= searchFilter.maxAcresFilter
                );
            }
            return lot_size_acres || !lot_size_acres;
        },
        senior_community_y_n: (senior_community_y_n) => {
            if (searchFilter.ageRestrictFilter === false) {
                return !senior_community_y_n;
            }
            return !senior_community_y_n || senior_community_y_n;
        },
        property_sub_type: (property_sub_type) =>
            property_sub_type === searchFilter.singleFamily ||
            property_sub_type === searchFilter.townHomes ||
            property_sub_type === searchFilter.condos,
        pool_private: (pool_private) => {
            if (searchFilter.poolFilter === true) {
                return pool_private;
            }
            return pool_private || !pool_private;
        },
        levels: (levels) => {
            if (searchFilter.singleStoryFilter === 'Yes') {
                return levels === 'A';
            }
            return levels || !levels;
        },
    };

    const filterKeys = Object.keys(filters);
    return homes.filter((home) => {
        return filterKeys.every((key) => {
            if (typeof filters[key] !== 'function') return true;
            return filters[key](home[key]);
        });
    });
};

export default filteringHomes;
