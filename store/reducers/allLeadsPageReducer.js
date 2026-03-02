import {
    ADD_LEAD,
    FETCH_LEADS_START,
    FETCH_LEADS_SUCCESS,
    FETCH_LEADS_ERROR,
    UPDATE_LEADS,
    UPDATE_SINGLE_LEAD,
} from '../actions/types';

const initialState = {
    leads: [],
    loading: false,
    error: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_LEADS_START:
            return { ...state, loading: true, error: null };
        case FETCH_LEADS_SUCCESS:
            return { leads: action.payload, loading: false, error: null };
        case FETCH_LEADS_ERROR:
            return { ...state, loading: false, error: action.payload };
        case ADD_LEAD:
            return { ...state, leads: [action.payload, ...state.leads] };
        case UPDATE_LEADS:
            return { ...state, leads: [...action.payload], loading: false, error: null };
        case UPDATE_SINGLE_LEAD:
            return {
                ...state,
                leads: state.leads.map((lead) =>
                    lead._id === action.payload._id ? action.payload : lead
                ),
            };
        default:
            return state;
    }
};
