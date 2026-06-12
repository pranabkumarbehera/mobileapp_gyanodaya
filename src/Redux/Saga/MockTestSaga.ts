import { takeLatest, select, put, call } from 'redux-saga/effects';
import {
    getMockTestListRequest,
    getMockTestListSuccess,
    getMockTestListFailure,
    getBundleListRequest,
    getBundleListSuccess,
    getBundleListFailure,
    getStudentModulesRequest,
    getStudentModulesSuccess,
    getStudentModulesFailure,
    bundleIDRequest,
    bundleIDSuccess,
    bundleIDFailure,
    getSubBundleListRequest,
    getSubBundleListSuccess,
    getSubBundleListFailure,
    getSubBundleDetailsRequest,
    getSubBundleDetailsSuccess,
    getSubBundleDetailsFailure,
    enrollBundleRequest,
    enrollBundleSuccess,
    enrollBundleFailure,
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

export function* getBundleListSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const queryParams = new URLSearchParams(action.payload || {}).toString();
        const url = queryParams ? `quizzes/bundles?${queryParams}` : 'quizzes/bundles';

        const response = yield call(getApi, url, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getBundleListSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getBundleListFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch bundles' });
        }
    } catch (error: any) {
        yield put(getBundleListFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getStudentModulesSaga(): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, 'student/modules', header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getStudentModulesSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getStudentModulesFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch enrollment status' });
        }
    } catch (error: any) {
        yield put(getStudentModulesFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getBundleDetailsSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, `quizzes/bundles/${action.payload.id}`, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(bundleIDSuccess(response?.data?.data || response?.data));
        } else {
            yield put(bundleIDFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch bundle details' });
        }
    } catch (error: any) {
        yield put(bundleIDFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getSubBundleListSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, `quizzes/bundles/${action.payload.bundleId}/sub-bundles`, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getSubBundleListSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getSubBundleListFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch sub-bundles' });
        }
    } catch (error: any) {
        yield put(getSubBundleListFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* getSubBundleDetailsSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(
            getApi,
            `quizzes/bundles/${action.payload.bundleId}/sub-bundles/${action.payload.subBundleId}`,
            header,
        );
        if (response?.data?.success === true || response?.status === 200) {
            yield put(getSubBundleDetailsSuccess(response?.data?.data || response?.data));
        } else {
            yield put(getSubBundleDetailsFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch sub-bundle details' });
        }
    } catch (error: any) {
        yield put(getSubBundleDetailsFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

export function* enrollBundleSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const enrollResponse = yield call(postApi, `student/quizzes/bundles/${action.payload.id}/enroll`, {}, header);

        if (enrollResponse?.data?.success === true || enrollResponse?.status === 201 || enrollResponse?.status === 200) {
            const bundleResponse = yield call(getApi, `quizzes/bundles/${action.payload.id}`, header);
            const bundleDetails = bundleResponse?.data?.data || bundleResponse?.data;
            const studentModulesResponse = yield call(getApi, 'student/modules', header);
            const studentModules = studentModulesResponse?.data?.data || studentModulesResponse?.data;

            yield put(enrollBundleSuccess({
                ...(enrollResponse?.data?.data || enrollResponse?.data || {}),
                bundleDetails,
                studentModules,
            }));
            Toast.show({ type: 'success', text1: enrollResponse?.data?.message || 'Enrolled successfully' });
        } else {
            yield put(enrollBundleFailure(enrollResponse?.data));
            Toast.show({ type: 'error', text1: enrollResponse?.data?.message || 'Failed to enroll in bundle' });
        }
    } catch (error: any) {
        yield put(enrollBundleFailure(error));
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
        const payload = {
            acceptedTerms: Boolean(action.payload?.acceptedTerms),
        };
        const response = yield call(postApi, `student/quizzes/${action.payload.id}/start`, payload, header);
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
    takeLatest(getBundleListRequest.type, getBundleListSaga),
    takeLatest(getStudentModulesRequest.type, getStudentModulesSaga),
    takeLatest(bundleIDRequest.type, getBundleDetailsSaga),
    takeLatest(getSubBundleListRequest.type, getSubBundleListSaga),
    takeLatest(getSubBundleDetailsRequest.type, getSubBundleDetailsSaga),
    takeLatest(enrollBundleRequest.type, enrollBundleSaga),
    takeLatest(getMockTestDetailsRequest.type, getMockTestDetailsSaga),
    takeLatest(startTestRequest.type, startTestSaga),
    takeLatest(submitTestRequest.type, submitTestSaga),
    takeLatest(getTestResultRequest.type, getTestResultSaga),
];

export default MockTestSaga;
