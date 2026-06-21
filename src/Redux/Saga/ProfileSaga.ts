import { takeLatest, select, put, call } from 'redux-saga/effects';
import {
    getProfileRequest,
    getProfileSuccess,
    getProfileFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
    paymentHistoryRequest,
    paymentHistorySuccess,
    paymentHistoryFailure,
    sendDeleteAccountOtpRequest,
    sendDeleteAccountOtpSuccess,
    sendDeleteAccountOtpFailure,
    verifyDeleteAccountOtpRequest,
    verifyDeleteAccountOtpSuccess,
    verifyDeleteAccountOtpFailure,
    deleteAccountRequest,
    deleteAccountSuccess,
    deleteAccountFailure,
    setDeleteAccountStep,
} from '../Reducers/ProfileReducer';
import { getApi, postApi, patchApi, deleteApi } from '../../Utils/Helpers/ApiRequest';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '../../Utils/Helpers/constants';
import { logoutSuccess, tokenSuccess } from '../Reducers/AuthReducer';

const getAuth = (state: any) => state.AuthReducer;

export function* getProfileSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, 'auth/me', header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getProfileSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getProfileFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch profile' });
        }
    } catch (error: any) {
        yield put(getProfileFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* updateProfileSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        // According to swagger docs, update profile uses PATCH
        // Using postApi wrapper, but ideally we should have a patchApi wrapper. 
        const response = yield call(patchApi, 'users/me/profile', action.payload, header);

        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(updateProfileSuccess(response?.data));
            Toast.show({ type: 'success', text1: response?.data?.message || 'Profile updated successfully' });
            // Refresh profile data
            yield put(getProfileRequest({}));
        } else {
            yield put(updateProfileFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to update profile' });
        }
    } catch (error: any) {
        yield put(updateProfileFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getPaymentHistorySaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const page = action.payload?.page || 1;
        const limit = action.payload?.limit || 10;
        const response = yield call(getApi, `payments/me?page=${page}&limit=${limit}`, header);
        
        if (response?.data?.success === true || response?.status === 200 || response?.data) {
            yield put(paymentHistorySuccess(response?.data));
        } else {
            yield put(paymentHistoryFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch payment history' });
        }
    } catch (error: any) {
        yield put(paymentHistoryFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* sendDeleteAccountOtpSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(postApi, 'account/delete/send-otp', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(sendDeleteAccountOtpSuccess(response?.data));
            yield put(setDeleteAccountStep('otp'));
            Toast.show({ type: 'success', text1: response?.data?.message || 'OTP sent successfully' });
        } else {
            yield put(sendDeleteAccountOtpFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to send OTP' });
        }
    } catch (error: any) {
        yield put(sendDeleteAccountOtpFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* verifyDeleteAccountOtpSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(postApi, 'account/delete/verify-otp', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            yield put(verifyDeleteAccountOtpSuccess(response?.data));
            yield put(setDeleteAccountStep('confirm'));
            Toast.show({ type: 'success', text1: response?.data?.message || 'OTP verified successfully' });
        } else {
            yield put(verifyDeleteAccountOtpFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to verify OTP' });
        }
    } catch (error: any) {
        yield put(verifyDeleteAccountOtpFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* deleteAccountSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(deleteApi, 'account/delete', action.payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 204) {
            yield put(deleteAccountSuccess(response?.data));
            yield put(setDeleteAccountStep('success'));

            yield call(AsyncStorage.multiRemove, [
                constants.TOKEN,
                constants.REFRESH_TOKEN,
                constants.USER_DATA,
                constants.SAVED_EMAIL,
                constants.SAVED_PASSWORD,
            ]);
            yield call(AsyncStorage.setItem, constants.REMEMBER_PASSWORD, 'false');
            yield put(tokenSuccess(null));
        } else {
            yield put(deleteAccountFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to delete account' });
        }
    } catch (error: any) {
        yield put(deleteAccountFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

const ProfileSaga = [
    takeLatest(getProfileRequest.type, getProfileSaga),
    takeLatest(updateProfileRequest.type, updateProfileSaga),
    takeLatest(paymentHistoryRequest.type, getPaymentHistorySaga),
    takeLatest(sendDeleteAccountOtpRequest.type, sendDeleteAccountOtpSaga),
    takeLatest(verifyDeleteAccountOtpRequest.type, verifyDeleteAccountOtpSaga),
    takeLatest(deleteAccountRequest.type, deleteAccountSaga),
];

export default ProfileSaga;
