import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import Toast from 'react-native-toast-message';
import constants from './constants';
import Store from '../../Redux/Store';
import { logoutSuccess, tokenSuccess } from '../../Redux/Reducers/AuthReducer';

const normalizeUrl = (url: string) => url.replace(/^\/+/, '');

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

let refreshPromise: Promise<string | null> | null = null;
let hasShownSessionExpiredMessage = false;
let appStateListenerAttached = false;
let sessionBootstrapStarted = false;
let lastForegroundRefreshAt = 0;
let refreshTokenInvalid = false;

const TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 1000;
const APP_STATE_STORAGE_KEY = 'APP_SESSION_STATE';
const APP_LAST_BACKGROUND_AT_KEY = 'APP_LAST_BACKGROUND_AT';

const getAccessToken = (response: any) =>
    response?.data?.accessToken ||
    response?.data?.data?.accessToken ||
    response?.data?.token ||
    response?.data?.data?.token ||
    null;

const getRefreshToken = (response: any) =>
    response?.data?.refreshToken ||
    response?.data?.refresh_token ||
    response?.data?.data?.refreshToken ||
    response?.data?.data?.refresh_token ||
    response?.data?.tokens?.refreshToken ||
    response?.data?.tokens?.refresh_token ||
    response?.data?.data?.tokens?.refreshToken ||
    response?.data?.data?.tokens?.refresh_token ||
    null;

const stripBearer = (token: string) => token.replace(/^Bearer\s+/i, '').trim();

const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const runtimeGlobal = globalThis as any;

    try {
        if (typeof runtimeGlobal.atob === 'function') {
            return runtimeGlobal.atob(padded);
        }
    } catch {
        // Ignore
    }

    try {
        if (runtimeGlobal.Buffer?.from) {
            return runtimeGlobal.Buffer.from(padded, 'base64').toString('utf8');
        }
    } catch {
        return null;
    }

    return null;
};

const getTokenExpiryMs = (token?: string | null) => {
    if (!token) {
        return null;
    }

    const parts = stripBearer(token).split('.');
    if (parts.length < 2) {
        return null;
    }

    const payload = decodeBase64Url(parts[1]);
    if (!payload) {
        return null;
    }

    try {
        const parsed = JSON.parse(payload);
        const exp = Number(parsed?.exp);
        if (!Number.isFinite(exp) || exp <= 0) {
            return null;
        }
        return exp * 1000;
    } catch {
        return null;
    }
};

const shouldRefreshTokenSoon = (token?: string | null) => {
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) {
        return false;
    }

    return expiryMs - Date.now() <= TOKEN_REFRESH_WINDOW_MS;
};

const clearSessionData = async () => {
    await AsyncStorage.removeItem(constants.TOKEN);
    await AsyncStorage.removeItem(constants.REFRESH_TOKEN);
    await AsyncStorage.removeItem(constants.USER_DATA);
    await AsyncStorage.removeItem(APP_STATE_STORAGE_KEY);
    await AsyncStorage.removeItem(APP_LAST_BACKGROUND_AT_KEY);
    Store.dispatch(logoutSuccess('Session expired'));
    Store.dispatch({ type: 'Profile/clearProfile' });
    Store.dispatch({ type: 'MockTest/clearMockTestData' });
    Store.dispatch({ type: 'Home/clearHomeData' });
};

const notifySessionExpiredOnce = (message?: string) => {
    if (hasShownSessionExpiredMessage) {
        return;
    }

    hasShownSessionExpiredMessage = true;
    Toast.show({
        type: 'error',
        text1: message || 'Session expired. Please login again.',
    });
};

const refreshAccessToken = async () => {
    if (refreshTokenInvalid) {
        return null;
    }

    if (!refreshPromise) {
        refreshPromise = (async () => {
            const storedRefreshToken = await AsyncStorage.getItem(constants.REFRESH_TOKEN);
            if (!storedRefreshToken) {
                refreshTokenInvalid = true;
                return null;
            }

            try {
                const response = await axios.post(`${constants.BASE_URL}/auth/refresh`, {
                    refreshToken: storedRefreshToken,
                }, {
                    headers: { 'X-Client-Type': 'mobile' }
                });

                const nextAccessToken = getAccessToken(response);
                const nextRefreshToken = getRefreshToken(response);

                if (!nextAccessToken) {
                    return null;
                }

                await AsyncStorage.setItem(constants.TOKEN, nextAccessToken);
                Store.dispatch(tokenSuccess(nextAccessToken));
                if (nextRefreshToken) {
                    await AsyncStorage.setItem(constants.REFRESH_TOKEN, nextRefreshToken);
                }
                hasShownSessionExpiredMessage = false;
                refreshTokenInvalid = false;

                return nextAccessToken;
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    refreshTokenInvalid = true;
                    await clearSessionData();
                }
                throw err;
            }
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

const warmUpSessionIfNeeded = async () => {
    if (refreshTokenInvalid) {
        return AsyncStorage.getItem(constants.TOKEN);
    }

    const currentToken = await AsyncStorage.getItem(constants.TOKEN);
    if (!currentToken || !shouldRefreshTokenSoon(currentToken)) {
        return currentToken;
    }

    try {
        return await refreshAccessToken();
    } catch {
        return null;
    }
};

const storeAppStateSnapshot = async (nextState: string) => {
    await AsyncStorage.setItem(APP_STATE_STORAGE_KEY, nextState);
    if (nextState !== 'active') {
        await AsyncStorage.setItem(APP_LAST_BACKGROUND_AT_KEY, String(Date.now()));
    }
};

const bootstrapSessionOnLaunch = async () => {
    if (sessionBootstrapStarted) {
        return;
    }
    sessionBootstrapStarted = true;

    const currentToken = await AsyncStorage.getItem(constants.TOKEN);
    if (!currentToken) {
        return;
    }

    await warmUpSessionIfNeeded();
    await storeAppStateSnapshot('active');
};

if (!appStateListenerAttached) {
    appStateListenerAttached = true;
    AppState.addEventListener('change', (nextState) => {
        void storeAppStateSnapshot(nextState).catch(() => {
            // Ignore state persistence failures.
        });

        if (nextState !== 'active') {
            return;
        }

        const now = Date.now();
        if (now - lastForegroundRefreshAt < 15000) {
            return;
        }

        lastForegroundRefreshAt = now;
        warmUpSessionIfNeeded().catch(() => {
            // Ignore background warm-up failures; request-time handling will still run.
        });
    });

    void bootstrapSessionOnLaunch().catch(() => {
        // Ignore launch warm-up failures; request-time handling will still run.
    });
}

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
                Toast.show({
                    type: 'error',
                    text1: 'No Internet Connection',
                    text2: 'Please check your network settings.'
                });
                return Promise.reject(new Error('No Internet Connection'));
            }

            if (!config.headers) config.headers = {} as any;
            config.headers['X-Client-Type'] = 'mobile';
            const normalizedUrl = String(config.url || '');
            const isAuthRoute =
                normalizedUrl.includes('auth/login') ||
                normalizedUrl.includes('auth/student/login') ||
                normalizedUrl.includes('auth/refresh') ||
                normalizedUrl.includes('auth/logout') ||
                normalizedUrl.includes('auth/forgot-password') ||
                normalizedUrl.includes('auth/verify-otp') ||
                normalizedUrl.includes('auth/reset-password');

            let token = await AsyncStorage.getItem(constants.TOKEN);
            if (token && !isAuthRoute && shouldRefreshTokenSoon(token)) {
                const refreshedToken = await refreshAccessToken();
                if (refreshedToken) {
                    token = refreshedToken;
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // Ignore
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor for Refresh Token Handling
axiosInstance.interceptors.response.use(
    (response) => {
        hasShownSessionExpiredMessage = false;
        return response;
    },
    async (error) => {
        const originalRequest = error.config || {};
        const isRefreshRequest = String(originalRequest.url || '').includes('auth/refresh');
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
        const refreshStatus = error?.response?.status;

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    if (!originalRequest.headers) {
                        originalRequest.headers = {};
                    }
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }

                notifySessionExpiredOnce(typeof serverMessage === 'string' ? serverMessage : undefined);
                return Promise.reject(error);
            } catch (refreshError: any) {
                notifySessionExpiredOnce(refreshError?.response?.data?.message);
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && isRefreshRequest) {
            refreshTokenInvalid = true;
            await clearSessionData();
            notifySessionExpiredOnce(typeof serverMessage === 'string' ? serverMessage : undefined);
            return Promise.reject(error);
        }

        if ((refreshStatus === 401 || refreshStatus === 403) && isRefreshRequest) {
            refreshTokenInvalid = true;
        }

        return Promise.reject(error);
    }
);

export async function getApi(url: string, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[GET] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`);

    return axiosInstance.get(normalizedUrl, { headers: reqHeaders });
}

export async function postApi(url: string, payload: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[POST] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.post(normalizedUrl, payload, { headers: reqHeaders });
}

export async function patchApi(url: string, payload: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[PATCH] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.patch(normalizedUrl, payload, { headers: reqHeaders });
}

export async function deleteApi(url: string, payload?: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[DELETE] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.delete(normalizedUrl, { headers: reqHeaders, data: payload });
}
