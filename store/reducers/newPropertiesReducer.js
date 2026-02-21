import { FETCH_NEW_PROPERTIES, REMOVE_NEW_PROPERTY, UPDATE_NEW_PROPERTY } from '../actions/types';

export default (state = [], action) => {
    switch (action.type) {
        case FETCH_NEW_PROPERTIES:
            return action.payload;
        case REMOVE_NEW_PROPERTY:
            return state.filter((property) => property.mls_number !== action.payload);
        case UPDATE_NEW_PROPERTY: {
            const cleanProperty = state.filter(
                (property) => property.mls_number !== action.payload.mls_number,
            );
            return [action.payload, ...cleanProperty];
        }
        default:
            return state;
    }
};
