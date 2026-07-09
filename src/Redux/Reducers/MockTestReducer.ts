import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: '',
    isLoading: false,
    mockTestList: null as any,
    bundleList: null as any,
    studentModules: null as any,
    bundleDetails: null as any,
    subBundleList: null as any,
    subBundleDetails: null as any,
    enrollBundleResponse: null as any,
    paymentSession: null as any,
    mockTestDetails: null as any,
    startTestResponse: null as any,
    submitTestResponse: null as any,
    testResult: null as any,
    error: null as any,
    documentLoading: false,
    documentResponse: null as any,
    documentError: null as any,
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
        getBundleListRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getBundleListSuccess(state, action) {
            state.bundleList = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getBundleListFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        getStudentModulesRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getStudentModulesSuccess(state, action) {
            state.studentModules = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getStudentModulesFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        bundleIDRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        bundleIDSuccess(state, action) {
            state.bundleDetails = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        bundleIDFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        getSubBundleListRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getSubBundleListSuccess(state, action) {
            state.subBundleList = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getSubBundleListFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        getSubBundleDetailsRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getSubBundleDetailsSuccess(state, action) {
            state.subBundleDetails = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        getSubBundleDetailsFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        enrollBundleRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        enrollBundleSuccess(state, action) {
            state.enrollBundleResponse = action.payload;
            state.bundleDetails = action.payload?.bundleDetails || state.bundleDetails;
            state.studentModules = action.payload?.studentModules || state.studentModules;
            state.status = action.type;
            state.isLoading = false;
        },
        enrollBundleFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        paymentRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        paymentSuccess(state, action) {
            state.paymentSession = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        paymentFailure(state, action: any) {
            state.paymentSession = null;
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        clearPaymentSession(state) {
            state.paymentSession = null;
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
        clearTestResult(state) {
            state.testResult = null;
            state.isLoading = false;
            state.error = null;
        },
        documentRequest(state, action) {
            state.status = action.type;
            state.documentLoading = true;
            state.documentError = null;
        },
        documentSuccess(state, action) {
            state.documentResponse = action.payload;
            state.status = action.type;
            state.documentLoading = false;
        },
        documentFailure(state, action: any) {
            state.status = action.type;
            state.documentError = action.error || action.payload;
            state.documentLoading = false;
        },
        clearStartTestState(state) {
            state.startTestResponse = null;
            state.status = '';
            state.isLoading = false;
            state.error = null;
        },
        clearBundleFlowState(state) {
            state.bundleDetails = null;
            state.subBundleList = null;
            state.subBundleDetails = null;
            state.enrollBundleResponse = null;
            state.paymentSession = null;
            state.mockTestDetails = null;
            state.error = null;
            state.documentResponse = null;
            state.documentError = null;
        },
        clearMockTestData(_state) {
            return { ...initialState };
        },
    }
});

export const {
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
    clearPaymentSession,
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
    clearTestResult,
    clearStartTestState,
    clearBundleFlowState,
    clearMockTestData,
    documentRequest,
    documentSuccess,
    documentFailure,
} = MockTestSlice.actions;

export default MockTestSlice.reducer;
