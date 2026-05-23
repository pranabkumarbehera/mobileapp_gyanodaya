// import { configureStore } from '@reduxjs/toolkit';
// import createSagaMiddleware from 'redux-saga';
// import logger from 'redux-logger';
// import AppReducer from './Reducers/AppReducer';
// import RootSaga from './Saga/RootSaga';

// const sagaMiddleware = createSagaMiddleware();

// const store = configureStore({
//     reducer: {
//         AppReducer: AppReducer,
//     },
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({ 
//             thunk: false,
//             serializableCheck: false 
//         }).concat(sagaMiddleware, logger as any),
// });

// sagaMiddleware.run(RootSaga);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;
