import { useSelector } from 'react-redux';
import { RootState } from '../Redux/Store';
import { themes, ThemeColors } from './themes';
import { translations } from './translations';

export const useTheme = (): { theme: string; colors: ThemeColors } => {
    const themeName = useSelector((state: RootState) => state.UiReducer?.theme) || 'classic';
    const colors = themes[themeName] || themes.classic;
    return { theme: themeName, colors };
};

export const useTranslation = () => {
    const lang = useSelector((state: RootState) => state.UiReducer?.language) || 'en';

    const t = (key: string, replacements?: Record<string, string>): string => {
        const keys = key.split('.');
        let translationObj: any = (translations as any)[lang] || translations.en;

        for (const k of keys) {
            if (translationObj && translationObj[k] !== undefined) {
                translationObj = translationObj[k];
            } else {
                // Fallback to English
                let fallbackObj: any = translations.en;
                for (const fk of keys) {
                    if (fallbackObj && fallbackObj[fk] !== undefined) {
                        fallbackObj = fallbackObj[fk];
                    } else {
                        return key; // return key if all else fails
                    }
                }
                translationObj = fallbackObj;
                break;
            }
        }

        if (typeof translationObj !== 'string') {
            return key;
        }

        // Apply replacements if provided
        let text = translationObj;
        if (replacements) {
            Object.entries(replacements).forEach(([k, val]) => {
                text = text.replace(new RegExp(`{${k}}`, 'g'), val);
            });
        }

        return text;
    };

    return { t, language: lang };
};
