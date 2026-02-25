import { FETCH_LEADS, UPDATE_LEADS, UPDATE_SINGLE_LEAD } from '../actions/types';

export default (state = [], action) => {
    switch (action.type) {
        // case ADD_ALL_LEADS:
        // return action.payload;
        case FETCH_LEADS:
            return action.payload;
        case UPDATE_LEADS:
            return [...action.payload];
        case UPDATE_SINGLE_LEAD:
            return state.map((lead) =>
                lead._id === action.payload._id ? action.payload : lead
            );
        default:
            return state;
    }
};
