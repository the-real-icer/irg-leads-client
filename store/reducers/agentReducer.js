import { ADD_AGENT, REMOVE_AGENT } from '../actions/types';

export default (state = null, action) => {
    switch (action.type) {
        case ADD_AGENT:
            return action.payload;
        case REMOVE_AGENT:
            return null;
        default:
            return state;
    }
};
