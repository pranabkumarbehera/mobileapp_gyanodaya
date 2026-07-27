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
    paymentRequest,
    paymentSuccess,
    paymentFailure,
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
    documentRequest,
    documentSuccess,
    documentFailure,
} from '../Reducers/MockTestReducer';
import { getApi, postApi } from '../../Utils/Helpers/ApiRequest';
import Toast from 'react-native-toast-message';

const getAuth = (state: any) => state.AuthReducer;

const ensureLoginRedirectUrl = (paymentUrl: string) => {
    if (!paymentUrl) {
        return paymentUrl;
    }

    try {
        const url = new URL(paymentUrl);
        url.searchParams.set('redirect_url', 'https://www.gyanodaya.cloud/login');
        return url.toString();
    } catch {
        const hasQuery = paymentUrl.includes('?');
        const redirectParam = 'redirect_url=https%3A%2F%2Fwww.gyanodaya.cloud%2Flogin';
        if (paymentUrl.includes('redirect_url=')) {
            return paymentUrl.replace(/redirect_url=[^&]*/g, redirectParam);
        }
        return `${paymentUrl}${hasQuery ? '&' : '?'}${redirectParam}`;
    }
};

const isAlreadySubmittedResponse = (response: any) => {
    const message = String(
        response?.data?.message ||
        response?.data?.error ||
        response?.message ||
        response?.error ||
        '',
    ).toLowerCase();

    return (
        response?.status === 409 ||
        message.includes('already submitted') ||
        message.includes('already-submitted') ||
        message.includes('duplicate submission')
    );
};

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

export function* paymentSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const payload = {
            resourceType: 'QUIZ_BUNDLE',
            resourceId: action.payload.id,
            amount: Number(action.payload.price),
            gateway: 'RAZORPAY',
            currency: 'INR',
        };
        const response = yield call(postApi, 'payments', payload, header);
        if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
            // Helper function to recursively find a URL in the response
            const findPaymentUrl = (obj: any): string | null => {
                if (!obj || typeof obj !== 'object') return null;
                
                const priorityKeys = ['checkout_url', 'checkoutUrl', 'payment_url', 'paymentUrl', 'paymentLink', 'short_url', 'shortUrl', 'url', 'redirect_url'];
                for (const key of priorityKeys) {
                    if (typeof obj[key] === 'string' && (obj[key].startsWith('http://') || obj[key].startsWith('https://'))) {
                        return obj[key];
                    }
                }

                for (const key in obj) {
                    if (typeof obj[key] === 'string' && (obj[key].startsWith('http://') || obj[key].startsWith('https://'))) {
                        const val = obj[key];
                        if (val.includes('/checkout') || val.includes('/payments/') || val.includes('rzp') || val.includes('/pay')) {
                            return val;
                        }
                    }
                    if (typeof obj[key] === 'object') {
                        const nested = findPaymentUrl(obj[key]);
                        if (nested) return nested;
                    }
                }
                return null;
            };

            const paymentUrl = findPaymentUrl(response?.data);

            if (paymentUrl) {
                yield put(paymentSuccess({
                    ...(response?.data?.data || response?.data || {}),
                    paymentUrl: ensureLoginRedirectUrl(paymentUrl),
                    resourceId: action.payload.id,
                    amount: Number(action.payload.price),
                    gateway: 'RAZORPAY',
                    currency: 'INR',
                    status: 'pending',
                }));
                Toast.show({ type: 'info', text1: 'Opening payment inside the app...' });
            } else {
                yield put(paymentSuccess(response?.data?.data || response?.data));
                
                const bundleResponse = yield call(getApi, `quizzes/bundles/${action.payload.id}`, header);
                const bundleDetails = bundleResponse?.data?.data || bundleResponse?.data;
                const studentModulesResponse = yield call(getApi, 'student/modules', header);
                const studentModules = studentModulesResponse?.data?.data || studentModulesResponse?.data;

                yield put(enrollBundleSuccess({
                    ...(response?.data?.data || response?.data || {}),
                    bundleDetails,
                    studentModules,
                }));
                Toast.show({ type: 'success', text1: response?.data?.message || 'Payment and enrollment successful' });
            }
        } else {
            yield put(paymentFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to complete payment' });
        }
    } catch (error: any) {
        yield put(paymentFailure(error));
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
        if (
            response?.data?.success === true ||
            response?.status === 201 ||
            response?.status === 200 ||
            isAlreadySubmittedResponse(response)
        ) {
            yield put(submitTestSuccess(response?.data?.data || response?.data));
            if (!isAlreadySubmittedResponse(response)) {
                Toast.show({ type: 'success', text1: 'Test submitted successfully' });
            }
            // Automatically fetch results after submission
            yield put(getTestResultRequest({ id: action.payload.id }));
        } else {
            yield put(submitTestFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to submit test' });
        }
    } catch (error: any) {
        if (isAlreadySubmittedResponse(error?.response)) {
            yield put(submitTestSuccess(error?.response?.data?.data || error?.response?.data));
            yield put(getTestResultRequest({ id: action.payload.id }));
            return;
        }

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

export function* documentSaga(action: any): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = {
        Accept: 'application/json',
        contenttype: 'application/json',
        authorization: auth.token,
    };
    try {
        const response = yield call(getApi, `documents/student/folders/${action.payload}/documents`, header);
        if (response?.data?.success === true || response?.status === 200) {
            yield put(documentSuccess(response?.data?.data || response?.data));
        } else {
            yield put(documentFailure(response?.data));
            Toast.show({ type: 'error', text1: response?.data?.message || 'Failed to fetch documents' });
        }
    } catch (error: any) {
        yield put(documentFailure(error));
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
    takeLatest(paymentRequest.type, paymentSaga),
    takeLatest(getMockTestDetailsRequest.type, getMockTestDetailsSaga),
    takeLatest(startTestRequest.type, startTestSaga),
    takeLatest(submitTestRequest.type, submitTestSaga),
    takeLatest(getTestResultRequest.type, getTestResultSaga),
    takeLatest(documentRequest.type, documentSaga),
];

export default MockTestSaga;
