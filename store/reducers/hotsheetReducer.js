import {
    FETCH_HOTSHEET_HOMES,
    FETCH_HOTSHEET_HOMES_ERROR,
    CHANGE_COUNTY,
    FETCHING_HOMES,
} from '../actions/types';

const initialState = {
    county: 'San Diego',
    initialHomes: [],
    fetchingHomes: false,
    error: null,
};

const hotsheetReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_HOTSHEET_HOMES:
            return { ...state, initialHomes: action.payload, error: null };
        case FETCH_HOTSHEET_HOMES_ERROR:
            return { ...state, initialHomes: [], error: action.payload };
        case FETCHING_HOMES:
            return { ...state, fetchingHomes: action.payload };
        case CHANGE_COUNTY:
            return { ...state, county: action.payload };
        default:
            return state;
    }
};

export default hotsheetReducer;
