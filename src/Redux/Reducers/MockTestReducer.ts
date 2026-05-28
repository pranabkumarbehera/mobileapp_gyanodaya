import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: '',
    isLoading: false,
    mockTestList: null as any,
    mockTestDetails: null as any,
    startTestResponse: null as any,
    submitTestResponse: null as any,
    testResult: null as any,
    error: null as any,
};

const MockTestSlice = createSlice({
    name: 'MockTest',
    initialState,
    reducers: {
        getMockTestListRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getMockTestListSuccess(state, action) {
            state.mockTestList = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getMockTestListFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        getMockTestDetailsRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getMockTestDetailsSuccess(state, action) {
            state.mockTestDetails = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getMockTestDetailsFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        startTestRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        startTestSuccess(state, action) {
            state.startTestResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        startTestFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        submitTestRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        submitTestSuccess(state, action) {
            state.submitTestResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        submitTestFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        getTestResultRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getTestResultSuccess(state, action) {
            state.testResult = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getTestResultFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        clearMockTestData(state) {
            return initialState;
        },
    }
});

export const {
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
    clearMockTestData,
} = MockTestSlice.actions;

export default MockTestSlice.reducer;
