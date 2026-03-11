import axios from 'axios';
import { RESET_STORE } from '../store/actions/types';

const IrgApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_IRG_API_URL,
    withCredentials: true,
});

export const COOKIE_AUTH_FALLBACK = '__cookie_auth__';

const getAuthorizationHeader = (headers) => {
    if (!headers) return undefined;
    return headers.Authorization || headers.authorization;
};

const removeAuthorizationHeader = (headers) => {
    if (!headers) return;
    delete headers.Authorization;
    delete headers.authorization;
};

IrgApi.interceptors.request.use((config) => {
    const authHeader = getAuthorizationHeader(config.headers);
    if (!authHeader) return config;

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token || ['null', 'undefined', 'false', COOKIE_AUTH_FALLBACK].includes(token)) {
        removeAuthorizationHeader(config.headers);
    }

    return config;
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
