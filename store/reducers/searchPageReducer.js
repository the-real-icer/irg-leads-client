import {
    SET_BOUNDS,
    SET_CENTER,
    SET_ZOOM,
    SET_POLYGON,
    SELECTED_HOME,
    LOADING_HOMES,
    CHANGE_SEARCH,
    SET_SERVER_CODE,
} from '../actions/types';

const initialState = {
    loadingHomes: true,
    serverCode: null,
    isTracked: false,
    results: {
        resultCount: null,
        initialResults: [],
        filteredResults: [],
    },
    areaInfo: {
        name: '',
        lat: null,
        lng: null,
        zoom: null,
        bounds: [],
        areaType: '',
        propertyType: '',
        url: '',
    },
    term: '',
    type: '',
    map: {
        bounds: null,
        center: null,
        zoom: null,
        polygon: null,
    },
    selectedHome: {
        show: false,
        property: null,
    },
};

const searchPageReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_BOUNDS:
            return { ...state, map: { ...state.map, bounds: action.payload } };
        case SET_CENTER:
            return { ...state, map: { ...state.map, center: action.payload } };
        case SET_ZOOM:
            return { ...state, map: { ...state.map, zoom: action.payload } };
        case SET_POLYGON:
            return { ...state, map: { ...state.map, polygon: action.payload } };
        case SELECTED_HOME:
            return { ...state, selectedHome: { ...action.payload } };
        case LOADING_HOMES:
            return { ...state, loadingHomes: action.payload };
        case CHANGE_SEARCH:
            return { ...state, term: action.payload.term, type: action.payload.type };
        case SET_SERVER_CODE:
            return { ...state, serverCode: action.payload };
        default:
            return state;
    }
};

export default searchPageReducer;
