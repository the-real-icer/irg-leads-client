import axios from 'axios';

const IrgApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_IRG_API_URL,
});

/**
 * Set up a 401 response interceptor.
 * Call once from _app.jsx with the Redux store so expired sessions
 * are caught globally instead of silently failing per-request.
 */
export const setupAuthInterceptor = (store) => {
    IrgApi.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                const { RESET_STORE } = require('../store/actions/types');
                store.dispatch({ type: RESET_STORE });

                if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
            return Promise.reject(error);
        }
    );
};

export default IrgApi;
