import {
    CLIENT_ADD_MIN_PRICE,
    CLIENT_ADD_MAX_PRICE,
    CLIENT_ADD_MIN_SQFT,
    CLIENT_ADD_MAX_SQFT,
    CLIENT_ADD_MIN_BATHS,
    CLIENT_ADD_MIN_BEDS,
    CLIENT_ADD_MIN_YEAR,
    CLIENT_ADD_MAX_YEAR,
    CLIENT_ADD_MIN_ACRES,
    CLIENT_ADD_MAX_ACRES,
    CLIENT_ADD_STORIES,
    CLIENT_AGE_RESTRICT,
    CLIENT_ADD_MIN_GARAGE,
    CLIENT_SINGLE_FAMILY,
    CLIENT_TOWN_HOUSE,
    CLIENT_CONDO,
    CLIENT_HAS_POOL,
    CLIENT_SINGLE_STORY,
    CLIENT_RESET_FILTERS,
} from './types';

export const addMinPrice = (minPrice) => {
    return {
        type: CLIENT_ADD_MIN_PRICE,
        minPrice,
    };
};

export const addMaxPrice = (maxPrice) => {
    return {
        type: CLIENT_ADD_MAX_PRICE,
        maxPrice,
    };
};

export const addMinSqFt = (minSqFt) => {
    return {
        type: CLIENT_ADD_MIN_SQFT,
        minSqFt,
    };
};

export const addMaxSqFt = (maxSqFt) => {
    return {
        type: CLIENT_ADD_MAX_SQFT,
        maxSqFt,
    };
};

export const addMinBeds = (minBeds) => {
    return {
        type: CLIENT_ADD_MIN_BEDS,
        minBeds,
    };
};

export const addMinBaths = (minBaths) => {
    return {
        type: CLIENT_ADD_MIN_BATHS,
        minBaths,
    };
};

export const addMinYear = (minYear) => {
    return {
        type: CLIENT_ADD_MIN_YEAR,
        minYear,
    };
};

export const addMaxYear = (maxYear) => {
    return {
        type: CLIENT_ADD_MAX_YEAR,
        maxYear,
    };
};

export const addMinAcres = (minAcres) => {
    return {
        type: CLIENT_ADD_MIN_ACRES,
        minAcres,
    };
};

export const addMaxAcres = (maxAcres) => {
    return {
        type: CLIENT_ADD_MAX_ACRES,
        maxAcres,
    };
};

export const addStories = (maxStories) => {
    return {
        type: CLIENT_ADD_STORIES,
        maxStories,
    };
};

export const ageRestrict = (value) => {
    return {
        type: CLIENT_AGE_RESTRICT,
        payload: value,
    };
};

export const singleFamily = (value) => {
    return {
        type: CLIENT_SINGLE_FAMILY,
        payload: value,
    };
};

export const townHomes = (value) => {
    return {
        type: CLIENT_TOWN_HOUSE,
        payload: value,
    };
};

export const condos = (value) => {
    return {
        type: CLIENT_CONDO,
        payload: value,
    };
};

export const addMinGarage = (cars) => {
    return {
        type: CLIENT_ADD_MIN_GARAGE,
        payload: cars,
    };
};

export const hasPool = (value) => {
    return {
        type: CLIENT_HAS_POOL,
        payload: value,
    };
};

export const singleStory = (value) => {
    return {
        type: CLIENT_SINGLE_STORY,
        payload: value,
    };
};

export const resetFilters = (bool) => {
    return {
        type: CLIENT_RESET_FILTERS,
        payload: bool,
    };
};
