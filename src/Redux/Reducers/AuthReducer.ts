import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: '',
    token: null as string | null,
    isLoading: false,
    signupResponse: null as any,
    loginResponse: null as any,
    logoutResponse: null as any,
    forgotPasswordResponse: null as any,
    changePasswordResponse: null as any,
    error: null as any,
};

const AuthSlice = createSlice({
    name: 'Auth',
    initialState,
    reducers: {
        signupRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        signupSuccess(state, action) {
            state.signupResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        signupFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        loginRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        loginSuccess(state, action) {
            state.loginResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        loginFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        tokenRequest(state, action) {
            state.status = action.type;
        },
        tokenSuccess(state, action) {
            state.token = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        tokenFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
        },
        logoutRequest(state, action) {
            state.status = action.type;
        },
        logoutSuccess(state, action) {
            return {
                ...initialState,
                logoutResponse: action.payload,
                status: action.type,
                token: null,
                isLoading: false,
            };
        },
        logoutFailure(state, action: any) {
            state.error = action.error || action.payload;
            state.status = action.type;
        },
        forgotPasswordRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        forgotPasswordSuccess(state, action) {
            state.forgotPasswordResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        forgotPasswordFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        changePasswordRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        changePasswordSuccess(state, action) {
            state.changePasswordResponse = action.payload;
            state.status = action.type;
            state.isLoading = false;
        },
        changePasswordFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
    }
});

export const {
    signupRequest,
    signupSuccess,
    signupFailure,
    loginRequest,
    loginSuccess,
    loginFailure,
    tokenRequest,
    tokenSuccess,
    tokenFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
    forgotPasswordRequest,
    forgotPasswordSuccess,
    forgotPasswordFailure,
    changePasswordRequest,
    changePasswordSuccess,
    changePasswordFailure,
} = AuthSlice.actions;

export default AuthSlice.reducer;
