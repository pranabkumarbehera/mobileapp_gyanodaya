export interface ThemeColors {
    Primary: string;
    Secondary: string;
    Tertiary: string;
    White: string;
    Black: string;
    Background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    statusBar: 'light-content' | 'dark-content';
    statusBg: string;
    tabBg: string;
    tabActive: string;
    tabInactive: string;
    tagCyan: string;
    tagCyanText: string;
    tagGreen: string;
    tagGreenText: string;
    tagOrange: string;
    tagOrangeText: string;
    tagPurple: string;
    tagPurpleText: string;
}

export const themes: Record<string, ThemeColors> = {
    classic: {
        Primary: '#092948',
        Secondary: '#f0a335',
        Tertiary: '#7d9bb9',
        White: '#FFFFFF',
        Black: '#000000',
        Background: '#FFF9F5',
        cardBackground: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#f0a335',
        statusBar: 'light-content',
        statusBg: '#092948',
        tabBg: '#FFFFFF',
        tabActive: '#092948',
        tabInactive: '#9CA3AF',
        tagCyan: '#EFF6FF',
        tagCyanText: '#1D4ED8',
        tagGreen: '#ECFDF5',
        tagGreenText: '#0F766E',
        tagOrange: '#FFF7ED',
        tagOrangeText: '#92400E',
        tagPurple: '#F5F3FF',
        tagPurpleText: '#7C3AED',
    },
    neon: {
        Primary: '#0A0A10',
        Secondary: '#00F2FE', // Neon Cyan
        Tertiary: '#9D4EDD', // Neon Purple
        White: '#12131C', // Card background (usually white in light theme)
        Black: '#FFFFFF', // Text color (usually black in light theme)
        Background: '#050508', // Cyber void background
        cardBackground: '#12131C',
        text: '#E2E8F0',
        textSecondary: '#94A3B8',
        border: '#1E1F29',
        accent: '#00F2FE',
        statusBar: 'light-content',
        statusBg: '#0A0A10',
        tabBg: '#12131C',
        tabActive: '#00F2FE',
        tabInactive: '#64748B',
        tagCyan: '#1E1B4B',
        tagCyanText: '#38BDF8',
        tagGreen: '#022C22',
        tagGreenText: '#34D399',
        tagOrange: '#451A03',
        tagOrangeText: '#FB923C',
        tagPurple: '#3B0764',
        tagPurpleText: '#C084FC',
    },
    aurora: {
        Primary: '#4F46E5', // Indigo
        Secondary: '#EC4899', // Aurora Pink
        Tertiary: '#8B5CF6', // Violet
        White: '#FFFFFF',
        Black: '#0F172A',
        Background: '#F5F3FF', // Lavender breeze
        cardBackground: '#FFFFFF',
        text: '#1E1B4B',
        textSecondary: '#6D28D9',
        border: '#DDD6FE',
        accent: '#EC4899',
        statusBar: 'light-content',
        statusBg: '#4F46E5',
        tabBg: '#FFFFFF',
        tabActive: '#4F46E5',
        tabInactive: '#A78BFA',
        tagCyan: '#E0F2FE',
        tagCyanText: '#0284C7',
        tagGreen: '#D1FAE5',
        tagGreenText: '#059669',
        tagOrange: '#FFEDD5',
        tagOrangeText: '#D97706',
        tagPurple: '#EDE9FE',
        tagPurpleText: '#7C3AED',
    },
    sunset: {
        Primary: '#1E0D06', // Espresso
        Secondary: '#F97316', // Amber Sunset
        Tertiary: '#FACC15', // Gold
        White: '#2A170F',
        Black: '#FFF7ED',
        Background: '#130703',
        cardBackground: '#2A170F',
        text: '#FED7AA',
        textSecondary: '#EA580C',
        border: '#452213',
        accent: '#F97316',
        statusBar: 'light-content',
        statusBg: '#1E0D06',
        tabBg: '#2A170F',
        tabActive: '#F97316',
        tabInactive: '#9A3412',
        tagCyan: '#111827',
        tagCyanText: '#9CA3AF',
        tagGreen: '#14532D',
        tagGreenText: '#4ADE80',
        tagOrange: '#7C2D12',
        tagOrangeText: '#FDBA74',
        tagPurple: '#581C87',
        tagPurpleText: '#E9D5FF',
    },
    midnight: {
        Primary: '#0F172A', // Slate 900
        Secondary: '#6366F1', // Indigo Neon
        Tertiary: '#EC4899', // Aurora Pink accent
        White: '#1E293B',
        Black: '#F8FAFC',
        Background: '#020617', // Deep slate space black
        cardBackground: '#0B0F19', // Dark glossy card
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#1E293B',
        accent: '#6366F1',
        statusBar: 'light-content',
        statusBg: '#0F172A',
        tabBg: '#0B0F19',
        tabActive: '#6366F1',
        tabInactive: '#475569',
        tagCyan: '#1E1B4B',
        tagCyanText: '#818CF8',
        tagGreen: '#064E3B',
        tagGreenText: '#34D399',
        tagOrange: '#7C2D12',
        tagOrangeText: '#FB923C',
        tagPurple: '#4C1D95',
        tagPurpleText: '#C084FC',
    },
    emerald: {
        Primary: '#064E3B', // Forest Emerald
        Secondary: '#10B981', // Mint Green
        Tertiary: '#059669', // Emerald accent
        White: '#0B2D24',
        Black: '#E6F4EA',
        Background: '#031E17', // Dark Jade void
        cardBackground: '#072C22', // Glassy deep teal card
        text: '#E6F4EA',
        textSecondary: '#34D399',
        border: '#0A4235',
        accent: '#10B981',
        statusBar: 'light-content',
        statusBg: '#064E3B',
        tabBg: '#072C22',
        tabActive: '#10B981',
        tabInactive: '#1F6D5B',
        tagCyan: '#0F172A',
        tagCyanText: '#38BDF8',
        tagGreen: '#D1FAE5',
        tagGreenText: '#065F46',
        tagOrange: '#FEF3C7',
        tagOrangeText: '#92400E',
        tagPurple: '#F3E8FF',
        tagPurpleText: '#6B21A8',
    }
};
