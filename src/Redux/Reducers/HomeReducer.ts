import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: '',
    isBootstrapping: false,
    isRefreshing: false,
    dashboardData: null as any,
    error: null as any,
};

const HomeSlice = createSlice({
    name: 'Home',
    initialState,
    reducers: {
        bootstrapHomeRequest(state, action) {
            state.status = action.type;
            state.isBootstrapping = !(action.payload?.refresh);
            state.isRefreshing = !!action.payload?.refresh;
            state.error = null;
        },
        bootstrapHomeSuccess(state, action) {
            state.dashboardData = action.payload;
            state.status = action.type;
            state.isBootstrapping = false;
            state.isRefreshing = false;
            state.error = null;
        },
        bootstrapHomeFailure(state, action: any) {
            state.status = action.type;
            state.isBootstrapping = false;
            state.isRefreshing = false;
            state.error = action.error || action.payload;
        },
        clearHomeData() {
            return initialState;
        },
    },
});

export const {
    bootstrapHomeRequest,
    bootstrapHomeSuccess,
    bootstrapHomeFailure,
    clearHomeData,
} = HomeSlice.actions;

export default HomeSlice.reducer;
