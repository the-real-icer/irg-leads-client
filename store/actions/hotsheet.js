import {
    FETCH_HOTSHEET_HOMES,
    CHANGE_COUNTY,
    CHANGE_CITY,
    CHANGE_ZIPCODE,
    CHANGE_NEIGHBORHOOD,
    CHANGE_DAYS_BACK,
    CHANGE_LIMIT,
    FETCHING_HOMES,
} from './types';

import IrgApi from '../../assets/irgApi';

// Fetch HotSheet Homes
export function fetchHotsheetHomes({ days, city, hood, zip, limit, county }) {
    return async function fetchHotsheetHomesThunk(dispatch) {
        try {
            const response = await IrgApi.get(
                `/mlsproperties/hotsheet?days=${days}&city=${city}&hood=${hood}&zip=${zip}&limit=${limit}&county=${county}`
            );
            dispatch({ type: FETCH_HOTSHEET_HOMES, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Change County
export function changeCounty(county) {
    return {
        type: CHANGE_COUNTY,
        payload: county,
    };
}

// Change City
export function changeCity(city) {
    return {
        type: CHANGE_CITY,
        payload: city,
    };
}

// Change Neighborhood
export function changeNeighborhood(neighborhood) {
    return {
        type: CHANGE_NEIGHBORHOOD,
        payload: neighborhood,
    };
}

// Change Zipcode
export function changeZipcode(zipcode) {
    return {
        type: CHANGE_ZIPCODE,
        payload: zipcode,
    };
}

// Change Days Back
export function changeDaysBack(days) {
    return {
        type: CHANGE_DAYS_BACK,
        payload: days,
    };
}

// Change Num of Days
export function changeLimit(limit) {
    return {
        type: CHANGE_LIMIT,
        payload: limit,
    };
}

// Change Fetching Homes
export function fetchingHomes(bool) {
    return {
        type: FETCHING_HOMES,
        payload: bool,
    };
}
