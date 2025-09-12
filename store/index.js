import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// import { composeWithDevTools } from '@redux-devtools/extension';

import agent from './reducers/agentReducer';
import allLeadsPage from './reducers/allLeadsPageReducer';
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

const combinedReducer = combineReducers({
    agent,
    allLeadsPage,
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

const createStorage = () => {
    if (typeof window !== 'undefined') {
        console.log('Using localStorage for redux-persist'); // eslint-disable-line
        return storage;
    }
    console.log('Using no-op storage for SSR'); // eslint-disable-line
    return {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
    };
};

const persistConfig = {
    key: 'nextjs2',
    whitelist: ['isLoggedIn'],
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
