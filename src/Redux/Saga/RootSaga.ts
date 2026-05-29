import { all } from 'redux-saga/effects';
import AuthSaga from './AuthSaga';
import ProfileSaga from './ProfileSaga';
import MockTestSaga from './MockTestSaga';
import HomeSaga from './HomeSaga';

export default function* RootSaga() {
    yield all([
        ...AuthSaga,
        ...ProfileSaga,
        ...MockTestSaga,
        ...HomeSaga,
    ]);
}
