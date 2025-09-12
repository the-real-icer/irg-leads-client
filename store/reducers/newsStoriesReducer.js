import { ADD_NEWS_STORIES } from '../actions/types';

export default (state = [], action) => {
    switch (action.type) {
        case ADD_NEWS_STORIES:
            return action.payload;
        default:
            return state;
    }
};
