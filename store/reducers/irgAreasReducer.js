import { FETCH_IRG_AREAS, FETCH_ALL_ADDRESSES } from '../actions/types';

const initialState = {
    City: [],
    CondoBuilding: [],
    Neighborhood: [],
    Zip: [],
    Addresses: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_IRG_AREAS:
            return { ...state, ...action.payload };
        case FETCH_ALL_ADDRESSES:
            return { ...state, Addresses: action.payload };
        default:
            return state;
    }
};
