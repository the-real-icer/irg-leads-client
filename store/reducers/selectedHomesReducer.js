import { ADD_SELECTED_HOME, REMOVE_SELECTED_HOME, CLEAR_SELECTED_HOMES } from '../actions/types';

export default (state = [], action) => {
    switch (action.type) {
        case ADD_SELECTED_HOME:
            return [...state, action.payload];
        case REMOVE_SELECTED_HOME:
            return state.filter((h) => h.mls_number !== action.payload.mls_number);
        case CLEAR_SELECTED_HOMES:
            return [];
        default:
            return state;
    }
};
