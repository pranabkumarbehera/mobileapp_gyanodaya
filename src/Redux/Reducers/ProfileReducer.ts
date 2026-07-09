import { createSlice } from '@reduxjs/toolkit';
import { normalizeProfileData } from '../../Utils/Helpers/home';

const initialState = {
    status: '',
    isLoading: false,
    profileData: null as any,
    updateProfileResponse: null as any,
    error: null as any,
    paymentHistoryData: null as any,
    paymentHistoryLoading: false,
    paymentHistoryError: null as any,
    deleteAccountStep: '' as 'email' | 'otp' | 'confirm' | 'success' | '',
    sendOtpLoading: false,
    sendOtpSuccess: false,
    sendOtpError: null as any,
    verifyOtpLoading: false,
    verifyOtpSuccess: false,
    verifyOtpError: null as any,
    deleteAccountLoading: false,
    deleteAccountSuccess: false,
    deleteAccountError: null as any,
    deleteVerificationToken: '',
};

const ProfileSlice = createSlice({
    name: 'Profile',
    initialState,
    reducers: {
        getProfileRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        getProfileSuccess(state, action) {
            state.profileData = normalizeProfileData(action.payload);
            state.status = action.type;
            state.isLoading = false;
        },
        getProfileFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        updateProfileRequest(state, action) {
            state.status = action.type;
            state.isLoading = true;
        },
        updateProfileSuccess(state, action) {
            state.updateProfileResponse = action.payload;
            state.profileData = {
                ...normalizeProfileData(state.profileData),
                ...normalizeProfileData(action.payload?.data || action.payload),
            };
            state.status = action.type;
            state.isLoading = false;
        },
        updateProfileFailure(state, action: any) {
            state.status = action.type;
            state.error = action.error || action.payload;
            state.isLoading = false;
        },
        paymentHistoryRequest(state, action) {
            state.status = action.type;
            state.paymentHistoryLoading = true;
            state.paymentHistoryError = null;
        },
        paymentHistorySuccess(state, action) {
            state.paymentHistoryData = action.payload;
            state.status = action.type;
            state.paymentHistoryLoading = false;
        },
        paymentHistoryFailure(state, action: any) {
            state.status = action.type;
            state.paymentHistoryError = action.error || action.payload;
            state.paymentHistoryLoading = false;
        },
        sendDeleteAccountOtpRequest(state, action) {
            state.status = action.type;
            state.sendOtpLoading = true;
            state.sendOtpSuccess = false;
            state.sendOtpError = null;
        },
        sendDeleteAccountOtpSuccess(state, action) {
            state.status = action.type;
            state.sendOtpLoading = false;
            state.sendOtpSuccess = true;
        },
        sendDeleteAccountOtpFailure(state, action: any) {
            state.status = action.type;
            state.sendOtpLoading = false;
            state.sendOtpError = action.error || action.payload;
        },
        verifyDeleteAccountOtpRequest(state, action) {
            state.status = action.type;
            state.verifyOtpLoading = true;
            state.verifyOtpSuccess = false;
            state.verifyOtpError = null;
        },
        verifyDeleteAccountOtpSuccess(state, action) {
            state.status = action.type;
            state.verifyOtpLoading = false;
            state.verifyOtpSuccess = true;
            state.deleteVerificationToken = action.payload?.verificationToken || action.payload?.data?.verificationToken || '';
        },
        verifyDeleteAccountOtpFailure(state, action: any) {
            state.status = action.type;
            state.verifyOtpLoading = false;
            state.verifyOtpError = action.error || action.payload;
        },
        deleteAccountRequest(state, action) {
            state.status = action.type;
            state.deleteAccountLoading = true;
            state.deleteAccountSuccess = false;
            state.deleteAccountError = null;
        },
        deleteAccountSuccess(state, action) {
            state.status = action.type;
            state.deleteAccountLoading = false;
            state.deleteAccountSuccess = true;
        },
        deleteAccountFailure(state, action: any) {
            state.status = action.type;
            state.deleteAccountLoading = false;
            state.deleteAccountError = action.error || action.payload;
        },
        setDeleteAccountStep(state, action) {
            state.deleteAccountStep = action.payload;
        },
        clearProfile(state) {
            return { ...initialState };
        },
    }
});

export const {
    getProfileRequest,
    getProfileSuccess,
    getProfileFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
    paymentHistoryRequest,
    paymentHistorySuccess,
    paymentHistoryFailure,
    sendDeleteAccountOtpRequest,
    sendDeleteAccountOtpSuccess,
    sendDeleteAccountOtpFailure,
    verifyDeleteAccountOtpRequest,
    verifyDeleteAccountOtpSuccess,
    verifyDeleteAccountOtpFailure,
    deleteAccountRequest,
    deleteAccountSuccess,
    deleteAccountFailure,
    setDeleteAccountStep,
    clearProfile,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
