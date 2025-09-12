import { LOGIN_AGENT, LOGOUT_AGENT } from '../actions/types';

export default (state = null, action) => {
    switch (action.type) {
        case LOGIN_AGENT:
            return action.payload;
        case LOGOUT_AGENT:
            return null;
        default:
            return state;
    }
};
