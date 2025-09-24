import {
    FETCH_HOTSHEET_HOMES,
    FETCH_HOTSHEET_HOMES_ERROR,
    CHANGE_COUNTY,
    CHANGE_CITY,
    CHANGE_ZIPCODE,
    CHANGE_NEIGHBORHOOD,
    CHANGE_DAYS_BACK,
    CHANGE_LIMIT,
    FETCHING_HOMES,
} from '../actions/types';

const initialState = {
    county: 'Select A County',
    city: 'Select A City',
    neighborhood: 'Select A Neighborhood',
    zipcode: 'Select A Zipcode',
    daysBack: '# of Days Back',
    limit: '# of Homes',
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
        case CHANGE_CITY:
            return { ...state, city: action.payload };
        case CHANGE_NEIGHBORHOOD:
            return { ...state, neighborhood: action.payload };
        case CHANGE_ZIPCODE:
            return { ...state, zipcode: action.payload };
        case CHANGE_DAYS_BACK:
            return { ...state, daysBack: action.payload };
        case CHANGE_LIMIT:
            return { ...state, limit: action.payload };
        default:
            return state;
    }
};

export default hotsheetReducer;
