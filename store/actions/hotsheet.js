import {
    FETCH_HOTSHEET_HOMES,
    FETCH_HOTSHEET_HOMES_ERROR,
    CHANGE_COUNTY,
    FETCHING_HOMES,
} from './types';

import IrgApi from '../../assets/irgApi';

// Always fetch a generous data set; frontend handles days/limit filtering
const API_DAYS = 30;
const API_LIMIT = 500;

export function fetchHotsheetHomes(county) {
    const countyParam = county.toLowerCase().replace(/\s/g, '-');

    return async function fetchHotsheetHomesThunk(dispatch) {
        try {
            dispatch({ type: FETCHING_HOMES, payload: true });
            const response = await IrgApi.get(
                `/mlsproperties/hotsheet?days=${API_DAYS}&limit=${API_LIMIT}&county=${countyParam}`,
            );
            const homes = Array.isArray(response.data?.data?.properties) ? response.data.data.properties : [];
            dispatch({ type: FETCH_HOTSHEET_HOMES, payload: homes });
        } catch (error) {
            console.error('Fetch homes error:', error.message); // eslint-disable-line
            dispatch({ type: FETCH_HOTSHEET_HOMES_ERROR, payload: error.message });
        } finally {
            dispatch({ type: FETCHING_HOMES, payload: false });
        }
    };
}

export function changeCounty(county) {
    return { type: CHANGE_COUNTY, payload: county };
}
