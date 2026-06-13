import { createSlice } from '@reduxjs/toolkit';
import { normalizeProfileData } from '../../Utils/Helpers/home';

const initialState = {
    status: '',
    isLoading: false,
    profileData: null as any,
    updateProfileResponse: null as any,
    error: null as any,
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
        clearProfile(state) {
            return initialState;
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
    clearProfile,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
