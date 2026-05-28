import { takeLatest, select, put, call } from 'redux-saga/effects';
import {
    getProfileRequest,
    getProfileSuccess,
    getProfileFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
} from '../Reducers/ProfileReducer';
import { getApi, postApi, patchApi } from '../../Utils/Helpers/ApiRequest';
import Toast from 'react-native-toast-message';

const getAuth = (state: any) => state.AuthReducer;

export function* getProfileSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, 'users/me', header);
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

const ProfileSaga = [
    takeLatest(getProfileRequest.type, getProfileSaga),
    takeLatest(updateProfileRequest.type, updateProfileSaga),
];

export default ProfileSaga;
