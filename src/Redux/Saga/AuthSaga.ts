import { takeLatest, select, put, call } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    signupRequest,
    signupSuccess,
    signupFailure,
    loginRequest,
    loginSuccess,
    loginFailure,
    tokenRequest,
    tokenSuccess,
    tokenFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
    forgotPasswordRequest,
    forgotPasswordSuccess,
    forgotPasswordFailure,
    changePasswordRequest,
    changePasswordSuccess,
    changePasswordFailure,
    verifyOtpRequest,
    verifyOtpSuccess,
    verifyOtpFailure,
    resetPasswordRequest,
    resetPasswordSuccess,
    resetPasswordFailure,
} from '../Reducers/AuthReducer';
import { getProfileRequest, getProfileSuccess } from '../Reducers/ProfileReducer';
import { postApi } from '../../Utils/Helpers/ApiRequest';
import constants from '../../Utils/Helpers/constants';
import Toast from 'react-native-toast-message';

const getAuth = (state: any) => state.AuthReducer;
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

export function* gettokenSaga(action: any): Generator<any, void, any> {
    try {
        const response = yield call(AsyncStorage.getItem, constants.TOKEN);
        const token = action?.payload?.token || response;
        yield put(tokenSuccess(token));
    } catch (error: any) {
        yield put(tokenFailure(error));
    }
}

export function* login_Saga(action: any): Generator<any, void, any> {
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
    };
    try {
        const response = yield call(postApi, 'auth/student/login', action.payload, header);
        const token = getAccessToken(response);
        const refreshToken = getRefreshToken(response);

        if (token || response?.status === 200 || response?.status === 201) {
            yield put(loginSuccess({ ...response?.data, token }));
            if (token) {
                yield call(AsyncStorage.setItem, constants.TOKEN, token);
                yield put(tokenSuccess(token));
                yield put(getProfileRequest({}));
            }
            if (refreshToken) {
                yield call(AsyncStorage.setItem, constants.REFRESH_TOKEN, refreshToken);
            }
            Toast.show({ type: 'success', text1: 'Login Successful' });
        } else {
            yield put(loginFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Login failed' });
        }
    } catch (error: any) {
        yield put(loginFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* signupSaga(action: any): Generator<any, void, any> {
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
    };
    try {
        const response = yield call(postApi, 'auth/student/register', action.payload, header);
        
        if (response?.status === 200 || response?.status === 201) {
            yield put(signupSuccess(response?.data));
            yield call(AsyncStorage.multiRemove, [
                constants.SAVED_EMAIL,
                constants.SAVED_PASSWORD,
                constants.TOKEN,
                constants.REFRESH_TOKEN,
                constants.USER_DATA,
            ]);
            yield call(AsyncStorage.setItem, constants.REMEMBER_PASSWORD, 'false');
            yield put(tokenSuccess(null));
            Toast.show({ type: 'success', text1: 'Registration Successful' });
        } else {
            yield put(signupFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Registration failed' });
        }
    } catch (error: any) {
        yield put(signupFailure(error));
        const errMsg = error?.response?.data?.message || error?.response?.data?.error || '!Oops something went wrong';
        Toast.show({ type: 'error', text1: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg) });
    }
}

export function* forgotPasswordSaga(action: any): Generator<any, void, any> {
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
    };
    try {
        const response = yield call(postApi, 'auth/forgot-password', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(forgotPasswordSuccess(response?.data));
            Toast.show({ type: 'success', text1: response?.data?.message || 'OTP sent successfully' });
        } else {
            yield put(forgotPasswordFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to send OTP' });
        }
    } catch (error: any) {
        yield put(forgotPasswordFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* changePasswordSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(postApi, 'auth/change-password', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(changePasswordSuccess(response?.data));
            Toast.show({ type: 'success', text1: response?.data?.message || 'Password changed successfully' });
        } else {
            yield put(changePasswordFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to change password' });
        }
    } catch (error: any) {
        yield put(changePasswordFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* logoutSaga(): Generator<any, void, any> {
    try {
        const auth = yield select(getAuth);
        if (auth.token) {
            const header = {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: auth.token
            };
            yield call(postApi, 'auth/logout', {}, header);
        }
    } catch (error: any) {
        yield put(logoutFailure(error));
    } finally {
        const rememberPassword = yield call(AsyncStorage.getItem, constants.REMEMBER_PASSWORD);
        yield call(AsyncStorage.removeItem, constants.TOKEN);
        yield call(AsyncStorage.removeItem, constants.REFRESH_TOKEN);
        yield call(AsyncStorage.removeItem, constants.USER_DATA);
        if (rememberPassword !== 'true') {
            yield call(AsyncStorage.multiRemove, [
                constants.SAVED_EMAIL,
                constants.SAVED_PASSWORD,
            ]);
            yield call(AsyncStorage.setItem, constants.REMEMBER_PASSWORD, 'false');
        }
        yield put(tokenSuccess(null));
        yield put(logoutSuccess('logout'));
        yield put({ type: 'Profile/clearProfile' });
        yield put({ type: 'MockTest/clearMockTestData' });
        yield put({ type: 'Home/clearHomeData' });
        Toast.show({ type: 'success', text1: 'Logout successfully !' });
    }
}

export function* verifyOtpSaga(action: any): Generator<any, void, any> {
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
    };
    try {
        const response = yield call(postApi, 'auth/verify-otp', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(verifyOtpSuccess(response?.data));
            Toast.show({ type: 'success', text1: response?.data?.message || 'OTP verified successfully' });
        } else {
            yield put(verifyOtpFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'OTP verification failed' });
        }
    } catch (error: any) {
        yield put(verifyOtpFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* resetPasswordSaga(action: any): Generator<any, void, any> {
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
    };
    try {
        const response = yield call(postApi, 'auth/reset-password', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(resetPasswordSuccess(response?.data));
            Toast.show({ type: 'success', text1: response?.data?.message || 'Password reset successfully' });
        } else {
            yield put(resetPasswordFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to reset password' });
        }
    } catch (error: any) {
        yield put(resetPasswordFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

const AuthSaga = [
    takeLatest(tokenRequest.type, gettokenSaga),
    takeLatest(signupRequest.type, signupSaga),
    takeLatest(loginRequest.type, login_Saga),
    takeLatest(logoutRequest.type, logoutSaga),
    takeLatest(forgotPasswordRequest.type, forgotPasswordSaga),
    takeLatest(changePasswordRequest.type, changePasswordSaga),
    takeLatest(verifyOtpRequest.type, verifyOtpSaga),
    takeLatest(resetPasswordRequest.type, resetPasswordSaga),
];

export default AuthSaga;
