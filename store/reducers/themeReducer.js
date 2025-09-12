import { GET_THEME, SWITCH_THEME } from '../actions/types';

const themeReducer = (state = '', action) => {
    switch (action.type) {
        case GET_THEME:
            return action.payload;
        case SWITCH_THEME:
            return action.payload;
        default:
            return state;
    }
};

export default themeReducer;
