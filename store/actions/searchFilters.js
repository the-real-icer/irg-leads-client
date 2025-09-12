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
} from './types';

export const addMinPrice = (minPrice) => {
    return {
        type: ADD_MIN_PRICE,
        minPrice,
    };
};

export const addMaxPrice = (maxPrice) => {
    return {
        type: ADD_MAX_PRICE,
        maxPrice,
    };
};

export const addMinSqFt = (minSqFt) => {
    return {
        type: ADD_MIN_SQFT,
        minSqFt,
    };
};

export const addMaxSqFt = (maxSqFt) => {
    return {
        type: ADD_MAX_SQFT,
        maxSqFt,
    };
};

export const addMinBeds = (minBeds) => {
    return {
        type: ADD_MIN_BEDS,
        minBeds,
    };
};

export const addMinBaths = (minBaths) => {
    return {
        type: ADD_MIN_BATHS,
        minBaths,
    };
};

export const addMinYear = (minYear) => {
    return {
        type: ADD_MIN_YEAR,
        minYear,
    };
};

export const addMaxYear = (maxYear) => {
    return {
        type: ADD_MAX_YEAR,
        maxYear,
    };
};

export const addMinAcres = (minAcres) => {
    return {
        type: ADD_MIN_ACRES,
        minAcres,
    };
};

export const addMaxAcres = (maxAcres) => {
    return {
        type: ADD_MAX_ACRES,
        maxAcres,
    };
};

export const addStories = (maxStories) => {
    return {
        type: ADD_STORIES,
        maxStories,
    };
};

export const ageRestrict = (value) => {
    return {
        type: AGE_RESTRICT,
        payload: value,
    };
};

export const singleFamily = (value) => {
    return {
        type: SINGLE_FAMILY,
        payload: value,
    };
};

export const townHomes = (value) => {
    return {
        type: TOWN_HOUSE,
        payload: value,
    };
};

export const condos = (value) => {
    return {
        type: CONDO,
        payload: value,
    };
};

export const addMinGarage = (cars) => {
    return {
        type: ADD_MIN_GARAGE,
        payload: cars,
    };
};

export const hasPool = (value) => {
    return {
        type: HAS_POOL,
        payload: value,
    };
};

export const singleStory = (value) => {
    return {
        type: SINGLE_STORY,
        payload: value,
    };
};

export const resetFilters = (bool) => {
    return {
        type: RESET_FILTERS,
        payload: bool,
    };
};
