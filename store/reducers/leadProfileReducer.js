import { ADD_LEAD, CHANGE_CATEGORY, ADD_ACTION, GET_LEAD_PROFILE } from '../actions/types';

const initialState = {
    backend_profile: {
        lead_category: '',
    },
    tracking_info: {
        website_visit_source: '',
        original_landing_page: '',
    },
    user_location: {
        city: '',
        state: '',
        zip: '',
    },
    first_name: '',
    last_name: '',
    phone_number: '',
    _id: '',
    saved_searches: [],
    searches_performed: [],
    agent_actions: [],
    agent_assigned: {},
    date_created: '',
    email: '',
    last_visit: '',
    user_id: '',
    viewed_homes: [],
    favorited_homes: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_LEAD:
            return { ...state, ...action.payload };
        case GET_LEAD_PROFILE:
            return { ...state, ...action.payload };
        case CHANGE_CATEGORY:
            return { ...state, backend_profile: { lead_category: action.payload } };
        case ADD_ACTION:
            return { ...state, agent_actions: [...action.payload] };
        default:
            return state;
    }
};
