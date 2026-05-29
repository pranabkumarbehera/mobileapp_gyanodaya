import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import AuthReducer from './Reducers/AuthReducer';
import ProfileReducer from './Reducers/ProfileReducer';
import MockTestReducer from './Reducers/MockTestReducer';
import HomeReducer from './Reducers/HomeReducer';
import RootSaga from './Saga/RootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        AuthReducer: AuthReducer,
        ProfileReducer: ProfileReducer,
        MockTestReducer: MockTestReducer,
        HomeReducer: HomeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ 
            thunk: false,
            serializableCheck: false 
        }).concat(sagaMiddleware, logger as any),
});

sagaMiddleware.run(RootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
