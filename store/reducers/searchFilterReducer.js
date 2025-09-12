import {
    ADD_MIN_PRICE,
    ADD_MAX_PRICE,
    ADD_MIN_SQFT,
    ADD_MAX_SQFT,
    ADD_MIN_BATHS,
    ADD_MIN_BEDS,
    ADD_MIN_YEAR,
    ADD_MAX_YEAR,
    ADD_MIN_ACRES,
    ADD_MAX_ACRES,
    ADD_STORIES,
    AGE_RESTRICT,
    ADD_MIN_GARAGE,
    SINGLE_FAMILY,
    TOWN_HOUSE,
    CONDO,
    HAS_POOL,
    SINGLE_STORY,
    RESET_FILTERS,
} from '../actions/types';

const initialState = {
    minPriceFilter: 0,
    maxPriceFilter: 200000000,
    minSqFtFilter: 0,
    maxSqFtFilter: 100000,
    minBedsFilter: 0,
    minBathsFilter: 0,
    minYearFilter: 0,
    maxYearFilter: 2100,
    minAcresFilter: 0,
    maxAcresFilter: 10000,
    storiesFilter: 5,
    ageRestrictFilter: false,
    singleFamily: 'Single Family Residence',
    townHomes: 'Townhouse',
    condos: 'Condominium',
    minGarageFilter: 0,
    poolFilter: false,
    singleStoryFilter: 'No',
    newConstructionFilter: 'No',
    noHoaFilter: false,
    maxHoaFilter: 2000000,
    daysOnMarketFilter: 20000000,
    hasACFilter: false,
    openHouseFilter: false,
    rvParkingFilter: [''],
};

const searchFilter = (state = initialState, action) => {
    switch (action.type) {
        case RESET_FILTERS:
            return initialState;
        case ADD_MIN_PRICE:
            return { ...state, minPriceFilter: action.minPrice * 1 };
        case ADD_MAX_PRICE:
            return { ...state, maxPriceFilter: action.maxPrice * 1 };
        case ADD_MIN_SQFT:
            return { ...state, minSqFtFilter: action.minSqFt * 1 };
        case ADD_MAX_SQFT:
            return { ...state, maxSqFtFilter: action.maxSqFt * 1 };
        case ADD_MIN_BEDS:
            return { ...state, minBedsFilter: action.minBeds * 1 };
        case ADD_MIN_BATHS:
            return { ...state, minBathsFilter: action.minBaths * 1 };
        case ADD_MIN_YEAR:
            return { ...state, minYearFilter: action.minYear * 1 };
        case ADD_MAX_YEAR:
            return { ...state, maxYearFilter: action.maxYear * 1 };
        case ADD_MIN_ACRES:
            return { ...state, minAcresFilter: action.minAcres * 1 };
        case ADD_MAX_ACRES:
            return { ...state, maxAcresFilter: action.maxAcres * 1 };
        case ADD_STORIES:
            return { ...state, storiesFilter: action.maxStories * 1 };
        case AGE_RESTRICT:
            return { ...state, ageRestrictFilter: action.payload };
        case SINGLE_FAMILY:
            return { ...state, singleFamily: action.payload };
        case TOWN_HOUSE:
            return { ...state, townHomes: action.payload };
        case CONDO:
            return { ...state, condos: action.payload };
        case ADD_MIN_GARAGE:
            return { ...state, minGarageFilter: action.payload };
        case HAS_POOL:
            return { ...state, poolFilter: action.payload };
        case SINGLE_STORY:
            return { ...state, singleStoryFilter: action.payload };
        default:
            return state;
    }
};

export default searchFilter;
