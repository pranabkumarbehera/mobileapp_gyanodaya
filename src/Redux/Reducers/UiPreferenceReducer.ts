import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppThemeName = 'classic' | 'neon' | 'aurora' | 'sunset';
export type AppLanguage = 'en' | 'hi' | 'or';

interface UiPreferenceState {
    theme: AppThemeName;
    language: AppLanguage;
    isLoaded: boolean;
}

const initialState: UiPreferenceState = {
    theme: 'classic',
    language: 'en',
    isLoaded: false,
};

const UiPreferenceSlice = createSlice({
    name: 'UiPreference',
    initialState,
    reducers: {
        setThemeState(state, action: PayloadAction<AppThemeName>) {
            state.theme = action.payload;
        },
        setLanguageState(state, action: PayloadAction<AppLanguage>) {
            state.language = action.payload;
        },
        setPreferencesLoaded(state) {
            state.isLoaded = true;
        },
        loadPreferencesSuccess(state, action: PayloadAction<{ theme: AppThemeName; language: AppLanguage }>) {
            state.theme = action.payload.theme;
            state.language = action.payload.language;
            state.isLoaded = true;
        }
    }
});

export const {
    setThemeState,
    setLanguageState,
    setPreferencesLoaded,
    loadPreferencesSuccess
} = UiPreferenceSlice.actions;

// Async actions to persist settings
export const changeTheme = (theme: AppThemeName) => async (dispatch: any) => {
    try {
        await AsyncStorage.setItem('@pref_theme', theme);
        dispatch(setThemeState(theme));
    } catch (e) {
        console.error('Failed to save theme setting', e);
    }
};

export const changeLanguage = (language: AppLanguage) => async (dispatch: any) => {
    try {
        await AsyncStorage.setItem('@pref_language', language);
        dispatch(setLanguageState(language));
    } catch (e) {
        console.error('Failed to save language setting', e);
    }
};

export const loadPreferences = () => async (dispatch: any) => {
    try {
        const storedTheme = await AsyncStorage.getItem('@pref_theme');
        const storedLang = await AsyncStorage.getItem('@pref_language');
        
        const payload = {
            theme: (storedTheme as AppThemeName) || 'classic',
            language: (storedLang as AppLanguage) || 'en'
        };
        
        dispatch(loadPreferencesSuccess(payload));
    } catch (e) {
        dispatch(setPreferencesLoaded());
    }
};

export default UiPreferenceSlice.reducer;
