import {
    FETCH_HOTSHEET_HOMES,
    CHANGE_COUNTY,
    CHANGE_CITY,
    CHANGE_ZIPCODE,
    CHANGE_NEIGHBORHOOD,
    CHANGE_DAYS_BACK,
    CHANGE_LIMIT,
    FETCHING_HOMES,
} from '../actions/types';

const cityPlaceholder = 'Select A City';
const countyPlaceholder = 'Select A County';
const zipcodePlaceholder = 'Select A Zipcode';
const neighborhoodPlaceholder = 'Select A Neighborhood';
const daysBackPlaceholder = '# of Days Back';
const limitPlaceholder = '# of Homes';

const initialState = {
    initialHomes: [],
    county: countyPlaceholder,
    city: cityPlaceholder,
    zipcode: zipcodePlaceholder,
    neighborhood: neighborhoodPlaceholder,
    daysBack: daysBackPlaceholder,
    limit: limitPlaceholder,
    fetchingHomes: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_HOTSHEET_HOMES:
            return { ...state, initialHomes: action.payload, fetchingHomes: false };
        case CHANGE_COUNTY:
            return {
                ...state,
                county: action.payload,
                city: cityPlaceholder,
                zipcode: zipcodePlaceholder,
                neighborhood: neighborhoodPlaceholder,
            };
        case CHANGE_CITY:
            return {
                ...state,
                city: action.payload,
                zipcode: zipcodePlaceholder,
                neighborhood: neighborhoodPlaceholder,
                county: countyPlaceholder,
            };
        case CHANGE_NEIGHBORHOOD:
            return {
                ...state,
                neighborhood: action.payload,
                zipcode: zipcodePlaceholder,
                city: cityPlaceholder,
                county: countyPlaceholder,
            };
        case CHANGE_ZIPCODE:
            return {
                ...state,
                zipcode: action.payload,
                neighborhood: neighborhoodPlaceholder,
                county: countyPlaceholder,
                city: cityPlaceholder,
            };
        case CHANGE_LIMIT:
            return { ...state, limit: action.payload };
        case CHANGE_DAYS_BACK:
            return { ...state, daysBack: action.payload };
        case FETCHING_HOMES:
            return { ...state, fetchingHomes: action.payload };
        default:
            return state;
    }
};
