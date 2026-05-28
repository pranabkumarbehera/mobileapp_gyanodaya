import { takeLatest, select, put, call } from 'redux-saga/effects';
import {
    getMockTestListRequest,
    getMockTestListSuccess,
    getMockTestListFailure,
    getMockTestDetailsRequest,
    getMockTestDetailsSuccess,
    getMockTestDetailsFailure,
    startTestRequest,
    startTestSuccess,
    startTestFailure,
    submitTestRequest,
    submitTestSuccess,
    submitTestFailure,
    getTestResultRequest,
    getTestResultSuccess,
    getTestResultFailure,
} from '../Reducers/MockTestReducer';
import { getApi, postApi } from '../../Utils/Helpers/ApiRequest';
import Toast from 'react-native-toast-message';

const getAuth = (state: any) => state.AuthReducer;

export function* getMockTestListSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const queryParams = new URLSearchParams(action.payload || {}).toString();
        const url = queryParams ? `quizzes?${queryParams}` : 'quizzes';
        
        const response = yield call(getApi, url, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getMockTestListSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getMockTestListFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch mock tests' });
        }
    } catch (error: any) {
        yield put(getMockTestListFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getMockTestDetailsSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, `quizzes/${action.payload.id}`, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getMockTestDetailsSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getMockTestDetailsFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch test details' });
        }
    } catch (error: any) {
        yield put(getMockTestDetailsFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* startTestSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(postApi, `student/quizzes/${action.payload.id}/start`, {}, header);
        if (response?.data?.success === true || response?.status === 201 || response?.status === 200) {
            yield put(startTestSuccess(response?.data?.data || response?.data));
            Toast.show({ type: 'success', text1: 'Test started successfully' });
        } else {
            yield put(startTestFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to start test' });
        }
    } catch (error: any) {
        yield put(startTestFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* submitTestSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const payload = { answers: action.payload.answers };
        const response = yield call(postApi, `student/attempts/${action.payload.id}/submit`, payload, header);
        if (response?.data?.success === true || response?.status === 201 || response?.status === 200) {
            yield put(submitTestSuccess(response?.data?.data || response?.data));
            Toast.show({ type: 'success', text1: 'Test submitted successfully' });
            // Automatically fetch results after submission
            yield put(getTestResultRequest({ id: action.payload.id }));
        } else {
            yield put(submitTestFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to submit test' });
        }
    } catch (error: any) {
        yield put(submitTestFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getTestResultSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, `student/attempts/${action.payload.id}/result`, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getTestResultSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getTestResultFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch test results' });
        }
    } catch (error: any) {
        yield put(getTestResultFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

const MockTestSaga = [
    takeLatest(getMockTestListRequest.type, getMockTestListSaga),
    takeLatest(getMockTestDetailsRequest.type, getMockTestDetailsSaga),
    takeLatest(startTestRequest.type, startTestSaga),
    takeLatest(submitTestRequest.type, submitTestSaga),
    takeLatest(getTestResultRequest.type, getTestResultSaga),
];

export default MockTestSaga;
