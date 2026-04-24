import { AUTH_CHECKED, RESET_STORE } from '../actions/types';

export default (state = false, action) => {
    switch (action.type) {
        case AUTH_CHECKED:
        case RESET_STORE:
            return true;
        default:
            return state;
    }
};
