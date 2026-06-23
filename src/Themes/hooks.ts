import { useSelector } from 'react-redux';
import { RootState } from '../Redux/Store';
import { themes, ThemeColors } from './themes';
import { translations } from './translations';

const hexToRgb = (color: string) => {
    const normalized = color.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
        return null;
    }

    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
};

export const withAlpha = (color: string, alpha: number) => {
    const rgb = hexToRgb(color);
    if (!rgb) {
        return color;
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

export type DesignTokens = {
    isDark: boolean;
    isGlass: boolean;
    surface: string;
    surfaceElevated: string;
    surfaceMuted: string;
    glassSurface: string;
    glassBorder: string;
    overlay: string;
    shadow: string;
    onAccent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    video: string;
    radius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        pill: number;
    };
    space: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    shadowOpacity: number;
    blurStrength: number;
};

const darkThemes = new Set(['neon', 'sunset', 'midnight', 'emerald', 'glass']);

export const createDesignTokens = (colors: ThemeColors, theme: string): DesignTokens => {
    const isDark = darkThemes.has(theme);
    const isGlass = theme === 'glass';

    return {
        isDark,
        isGlass,
        surface: colors.cardBackground,
        surfaceElevated: isGlass ? 'rgba(30, 41, 78, 0.82)' : colors.cardBackground,
        surfaceMuted: isGlass ? 'rgba(139, 156, 255, 0.08)' : colors.Background,
        glassSurface: isGlass
            ? 'rgba(24, 33, 63, 0.62)'
            : withAlpha(colors.cardBackground, isDark ? 0.92 : 0.98),
        glassBorder: isGlass ? 'rgba(220, 228, 255, 0.2)' : colors.border,
        overlay: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.42)',
        shadow: isDark ? colors.accent : '#0F172A',
        onAccent: '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#38BDF8',
        video: '#FF3B30',
        radius: { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
        space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        shadowOpacity: isGlass ? 0.28 : isDark ? 0.16 : 0.08,
        blurStrength: isGlass ? 22 : 0,
    };
};

export const useTheme = (): { theme: string; colors: ThemeColors; tokens: DesignTokens } => {
    const themeName = useSelector((state: RootState) => state.UiReducer?.theme) || 'classic';
    const colors = themes[themeName] || themes.classic;
    return { theme: themeName, colors, tokens: createDesignTokens(colors, themeName) };
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
