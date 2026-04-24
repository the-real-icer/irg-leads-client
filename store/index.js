import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { RESET_STORE } from './actions/types';

import agent from './reducers/agentReducer';
import allLeadsPage from './reducers/allLeadsPageReducer';
import authChecked from './reducers/authCheckedReducer';
import clientSearchFilter from './reducers/clientSearchFilterReducer';
import hotsheet from './reducers/hotsheetReducer';
import irgAreas from './reducers/irgAreasReducer';
import isLoggedIn from './reducers/isLoggedInReducer';
import leadProfile from './reducers/leadProfileReducer';
import newProperties from './reducers/newPropertiesReducer';
import searchFilter from './reducers/searchFilterReducer';
import searchPage from './reducers/searchPageReducer';
import selectedHomes from './reducers/selectedHomesReducer';
import newsStories from './reducers/newsStoriesReducer';
import theme from './reducers/themeReducer';

const sliceReducers = combineReducers({
    agent,
    allLeadsPage,
    authChecked,
    clientSearchFilter,
    hotsheet,
    irgAreas,
    isLoggedIn,
    leadProfile,
    newProperties,
    newsStories,
    searchFilter,
    searchPage,
    selectedHomes,
    theme,
});

// On RESET_STORE (logout), wipe all state except theme.
// Each slice reducer receives undefined and returns its initial value.
const combinedReducer = (state, action) => {
    if (action.type === RESET_STORE) {
        return sliceReducers({ theme: state?.theme }, action);
    }
    return sliceReducers(state, action);
};

const createStorage = () => {
    if (typeof window !== 'undefined') {
        return storage;
    }
    return {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
    };
};

// Changing the persist key intentionally invalidates old persisted client
// storage. Users get a one-time reset of their local agent cache on next
// load and will need to sign in again. This is acceptable for a version
// cleanup — the old 'nextjs2' key was a leftover generic name.
const persistConfig = {
    key: 'irg-leads-v2',
    whitelist: ['agent'],
    storage: createStorage(),
};

const persistedReducer = persistReducer(persistConfig, combinedReducer);

// Create store with SSR support
const makeStore = () => {
    const isServer = typeof window === 'undefined';
    const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                },
            }),
        devTools: process.env.NODE_ENV !== 'production',
    });

    // Only create persistor on client side
    if (!isServer) {
        store.__persistor = persistStore(store);
    }

    return store;
};

// Export store and wrapper
export const wrapper = createWrapper(makeStore, { debug: process.env.NODE_ENV !== 'production' });
