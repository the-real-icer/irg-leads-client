import { FETCH_LEADS, UPDATE_LEADS } from '../actions/types';

export default (state = [], action) => {
    switch (action.type) {
        // case ADD_ALL_LEADS:
        // return action.payload;
        case FETCH_LEADS:
            return action.payload;
        case UPDATE_LEADS:
            return [...action.payload];
        default:
            return state;
    }
};
