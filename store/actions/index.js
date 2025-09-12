// import axios from 'axios';
// import getYear from 'date-fns/getYear';
// import getMonth from 'date-fns/getMonth';
import IrgApi from '../../assets/irgApi';

import {
    ADD_AGENT,
    REMOVE_AGENT,
    ADD_LEAD,
    CHANGE_CATEGORY,
    GET_LEAD_PROFILE,
    ADD_ACTION,
    FETCH_LEADS,
    UPDATE_LEADS,
    LOGIN_AGENT,
    LOGOUT_AGENT,
    GET_THEME,
    SWITCH_THEME,
    ADD_SELECTED_HOME,
    REMOVE_SELECTED_HOME,
    CLEAR_SELECTED_HOMES,
    FETCH_IRG_AREAS,
    FETCH_ALL_ADDRESSES,
    FETCH_NEW_PROPERTIES,
    REMOVE_NEW_PROPERTY,
    UPDATE_NEW_PROPERTY,
    // ADD_NEWS_STORIES,
} from './types';

// Agent Actions
export function addAgent(agent) {
    return {
        type: ADD_AGENT,
        payload: agent,
    };
}

export function removeAgent() {
    return {
        type: REMOVE_AGENT,
    };
}

// isLoggedIN Actions
export function loginUser(token) {
    return {
        type: LOGIN_AGENT,
        payload: token,
    };
}

export function logoutUser() {
    return {
        type: LOGOUT_AGENT,
        payload: null,
    };
}

// Lead Profile Actions
export function addLead(lead) {
    return {
        type: ADD_LEAD,
        payload: lead,
    };
}

export function changeCategory(category) {
    return {
        type: CHANGE_CATEGORY,
        payload: category,
    };
}

// Get Lead Profile
export function getLeadProfile({ userId, isLoggedIn }) {
    return async function getLeadProfileThunk(dispatch) {
        try {
            const response = await IrgApi.post('/users/user', JSON.stringify({ userId }), {
                headers: {
                    Authorization: `Bearer ${isLoggedIn}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch({ type: GET_LEAD_PROFILE, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

export function addAction(actions) {
    return {
        type: ADD_ACTION,
        payload: actions,
    };
}

// Fetch Leads
export function fetchLeads(agentId, isLoggedIn) {
    return async function fetchLeadsThunk(dispatch) {
        try {
            const response = await IrgApi.post(
                '/users/get-agent-users',
                JSON.stringify({ agentId }),
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            dispatch({ type: FETCH_LEADS, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Updates Leads
export function updateLeads(agentId, isLoggedIn) {
    return async function updateLeadsThunk(dispatch) {
        try {
            const response = await IrgApi.post(
                '/users/get-agent-users',
                JSON.stringify({ agentId }),
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            dispatch({ type: UPDATE_LEADS, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Selected Homes Actions
export function addSelectedHome(home) {
    return {
        type: ADD_SELECTED_HOME,
        payload: home,
    };
}

export function removeSelectedHome(home) {
    return {
        type: REMOVE_SELECTED_HOME,
        payload: home,
    };
}

export function clearSelectedHomes() {
    return {
        type: CLEAR_SELECTED_HOMES,
        // payload: null,
    };
}

// Theme Actions
export function getTheme(theme) {
    return {
        type: GET_THEME,
        payload: theme,
    };
}

export function switchTheme(theme) {
    return {
        type: SWITCH_THEME,
        payload: theme,
    };
}

// Fetch IrgAreas
export function fetchIrgAreas() {
    return async function fetchIrgAreasThunk(dispatch) {
        try {
            const response = await IrgApi.get('/irgareas/all-irg-areas');
            dispatch({ type: FETCH_IRG_AREAS, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Fetch All Addresses
export function fetchAllAddresses() {
    return async function fetchAllAddressesThunk(dispatch) {
        try {
            const response = await IrgApi.get('/mlsproperties');
            dispatch({ type: FETCH_ALL_ADDRESSES, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Fetch New Properties
export function fetchNewProperties(isLoggedIn) {
    return async function fetchNewPropertiesThunk(dispatch) {
        try {
            const response = await IrgApi.get('/mlsproperties/new-properties', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            dispatch({ type: FETCH_NEW_PROPERTIES, payload: response.data.data });
        } catch (error) {
            console.error(error.message); // eslint-disable-line
        }
    };
}

// Remove A New Property
export function removeNewProperty(id) {
    return {
        type: REMOVE_NEW_PROPERTY,
        payload: id,
    };
}

// Update A New Property
export function updateNewProperty(property) {
    return {
        type: UPDATE_NEW_PROPERTY,
        payload: property,
    };
}
