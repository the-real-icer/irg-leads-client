import {
    SET_CENTER,
    CHANGE_SEARCH,
    SET_BOUNDS,
    SET_ZOOM,
    SET_POLYGON,
    SELECTED_HOME,
    LOADING_HOMES,
    SET_SERVER_CODE,
} from './types';

// Search Page Actions
export function changeSearch(search) {
    return {
        type: CHANGE_SEARCH,
        payload: search,
    };
}

export function setServerCode(serverCode) {
    return {
        type: SET_SERVER_CODE,
        payload: serverCode,
    };
}

export function setCenter(center) {
    return {
        type: SET_CENTER,
        payload: center,
    };
}

export function setBounds(bounds) {
    return {
        type: SET_BOUNDS,
        payload: bounds,
    };
}

export function setZoom(zoom) {
    return {
        type: SET_ZOOM,
        payload: zoom,
    };
}

export function setPolygon(bounds) {
    return {
        type: SET_POLYGON,
        payload: bounds,
    };
}

export function setSelectedHome(obj) {
    return {
        type: SELECTED_HOME,
        payload: obj,
    };
}

export function setLoadingHomes(bool) {
    return {
        type: LOADING_HOMES,
        payload: bool,
    };
}
