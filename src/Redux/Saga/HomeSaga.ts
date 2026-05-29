import { call, put, select, takeLatest } from 'redux-saga/effects';
import Toast from 'react-native-toast-message';
import {
    bootstrapHomeFailure,
    bootstrapHomeRequest,
    bootstrapHomeSuccess,
} from '../Reducers/HomeReducer';
import { getApi } from '../../Utils/Helpers/ApiRequest';

const getAuth = (state: any) => state.AuthReducer;

const buildHeader = (token: string | null) => ({
    Accept: 'application/json',
    contenttype: 'application/json',
    authorization: token,
});

export function* bootstrapHomeSaga(): Generator<any, void, any> {
    const auth = yield select(getAuth);
    const header = buildHeader(auth.token);

    try {
        const dashboardResponse = yield call(getApi, 'student/dashboard', header);
        if (dashboardResponse?.data?.success === true || dashboardResponse?.status === 200) {
            yield put(bootstrapHomeSuccess(dashboardResponse?.data?.data || dashboardResponse?.data));
        } else {
            yield put(bootstrapHomeFailure(dashboardResponse?.data));
            Toast.show({ type: 'error', text1: dashboardResponse?.data?.message || 'Failed to fetch dashboard' });
        }
    } catch (error: any) {
        yield put(bootstrapHomeFailure(error));
        Toast.show({ type: 'error', text1: error?.response?.data?.message || '!Oops something went wrong' });
    }
}

const HomeSaga = [
    takeLatest(bootstrapHomeRequest.type, bootstrapHomeSaga),
];

export default HomeSaga;
