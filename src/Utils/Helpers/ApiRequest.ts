import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import constants from './constants';
import Store from '../../Redux/Store';
import { logoutSuccess } from '../../Redux/Reducers/AuthReducer';

const normalizeUrl = (url: string) => url.replace(/^\/+/, '');

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

let refreshPromise: Promise<string | null> | null = null;
let hasShownSessionExpiredMessage = false;

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

const clearSessionData = async () => {
    await AsyncStorage.removeItem(constants.TOKEN);
    await AsyncStorage.removeItem(constants.REFRESH_TOKEN);
    await AsyncStorage.removeItem(constants.USER_DATA);
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
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const storedRefreshToken = await AsyncStorage.getItem(constants.REFRESH_TOKEN);
            if (!storedRefreshToken) {
                return null;
            }

            const response = await axios.post(`${constants.BASE_URL}/auth/refresh`, {
                refreshToken: storedRefreshToken,
            });

            const nextAccessToken = getAccessToken(response);
            const nextRefreshToken = getRefreshToken(response);

            if (!nextAccessToken) {
                return null;
            }

            await AsyncStorage.setItem(constants.TOKEN, nextAccessToken);
            if (nextRefreshToken) {
                await AsyncStorage.setItem(constants.REFRESH_TOKEN, nextRefreshToken);
            }
            hasShownSessionExpiredMessage = false;

            return nextAccessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

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
            const token = await AsyncStorage.getItem(constants.TOKEN);
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
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const isRefreshRequest = String(originalRequest.url || '').includes('auth/refresh');
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;

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

                await clearSessionData();
                notifySessionExpiredOnce(typeof serverMessage === 'string' ? serverMessage : undefined);
                return Promise.reject(error);
            } catch (refreshError: any) {
                await clearSessionData();
                notifySessionExpiredOnce(refreshError?.response?.data?.message);
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && isRefreshRequest) {
            await clearSessionData();
            notifySessionExpiredOnce(typeof serverMessage === 'string' ? serverMessage : undefined);
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

