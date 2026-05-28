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
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem(constants.REFRESH_TOKEN);
                if (refreshToken) {
                    const res = await axios.post(`${constants.BASE_URL}/auth/refresh`, {
                        refreshToken: refreshToken
                    });

                    if (res.status === 200 || res.status === 201) {
                        const newAccessToken = res.data?.accessToken || res.data?.data?.accessToken;
                        await AsyncStorage.setItem(constants.TOKEN, newAccessToken);
                        
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError) {
                // If refresh token fails, clear session and logout
                await AsyncStorage.clear();
                Store.dispatch(logoutSuccess('Session expired'));
                return Promise.reject(refreshError);
            }
            
            // If there's no refresh token
            await AsyncStorage.clear();
            Store.dispatch(logoutSuccess('Session expired'));
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
