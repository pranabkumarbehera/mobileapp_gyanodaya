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
        Primary: '#0A192F', // Deeper navy
        Secondary: '#FFB23F', // Brighter amber
        Tertiary: '#8892B0', // Slate
        White: '#FFFFFF',
        Black: '#020C1B',
        Background: '#F8FAFC', // Crisp light background
        cardBackground: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#FFB23F',
        statusBar: 'dark-content', // Changed to dark content for light background
        statusBg: '#F8FAFC',
        tabBg: '#FFFFFF',
        tabActive: '#0A192F',
        tabInactive: '#9CA3AF',
        tagCyan: '#E0F2FE',
        tagCyanText: '#0284C7',
        tagGreen: '#D1FAE5',
        tagGreenText: '#059669',
        tagOrange: '#FFEDD5',
        tagOrangeText: '#C2410C',
        tagPurple: '#F3E8FF',
        tagPurpleText: '#7E22CE',
    },
    neon: {
        Primary: '#050505',
        Secondary: '#00F0FF', // Cyberpunk Cyan
        Tertiary: '#B537F2', // Hot Purple
        White: '#121212',
        Black: '#FFFFFF',
        Background: '#020202', // Pure black abyss
        cardBackground: '#0D0D0D', // Slightly elevated card
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#1E1E1E',
        accent: '#00F0FF',
        statusBar: 'light-content',
        statusBg: '#020202',
        tabBg: '#0D0D0D',
        tabActive: '#00F0FF',
        tabInactive: '#475569',
        tagCyan: 'rgba(0, 240, 255, 0.1)',
        tagCyanText: '#00F0FF',
        tagGreen: 'rgba(52, 211, 153, 0.1)',
        tagGreenText: '#34D399',
        tagOrange: 'rgba(251, 146, 60, 0.1)',
        tagOrangeText: '#FB923C',
        tagPurple: 'rgba(181, 55, 242, 0.1)',
        tagPurpleText: '#B537F2',
    },
    aurora: {
        Primary: '#4338CA', // Indigo
        Secondary: '#F43F5E', // Rose
        Tertiary: '#8B5CF6', // Violet
        White: '#FFFFFF',
        Black: '#0F172A',
        Background: '#F4F4F5', // Soft gray
        cardBackground: '#FFFFFF',
        text: '#1E1B4B',
        textSecondary: '#5B21B6', // Deep purple secondary text
        border: '#E4E4E7',
        accent: '#F43F5E',
        statusBar: 'dark-content',
        statusBg: '#F4F4F5',
        tabBg: '#FFFFFF',
        tabActive: '#4338CA',
        tabInactive: '#A1A1AA',
        tagCyan: '#E0F2FE',
        tagCyanText: '#0284C7',
        tagGreen: '#D1FAE5',
        tagGreenText: '#059669',
        tagOrange: '#FFEDD5',
        tagOrangeText: '#EA580C',
        tagPurple: '#F3E8FF',
        tagPurpleText: '#7C3AED',
    },
    sunset: {
        Primary: '#1E0D06',
        Secondary: '#FA9A3B',
        Tertiary: '#FACC15',
        White: '#2A170F',
        Black: '#FFF7ED',
        Background: '#0F0603', // Deep espresso
        cardBackground: '#1C0D08',
        text: '#FFEDD5',
        textSecondary: '#F97316', // Bright amber
        border: '#3D1D11',
        accent: '#FA9A3B',
        statusBar: 'light-content',
        statusBg: '#0F0603',
        tabBg: '#1C0D08',
        tabActive: '#FA9A3B',
        tabInactive: '#7C2D12',
        tagCyan: 'rgba(156, 163, 175, 0.15)',
        tagCyanText: '#D1D5DB',
        tagGreen: 'rgba(74, 222, 128, 0.15)',
        tagGreenText: '#4ADE80',
        tagOrange: 'rgba(253, 186, 116, 0.15)',
        tagOrangeText: '#FDBA74',
        tagPurple: 'rgba(233, 213, 255, 0.15)',
        tagPurpleText: '#E9D5FF',
    },
    midnight: {
        Primary: '#0F172A',
        Secondary: '#818CF8', // Soft indigo
        Tertiary: '#F472B6', // Soft pink
        White: '#1E293B',
        Black: '#F8FAFC',
        Background: '#020617', // Very dark slate
        cardBackground: '#0A0F1D', // Glossy dark card
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#1E293B',
        accent: '#818CF8',
        statusBar: 'light-content',
        statusBg: '#020617',
        tabBg: '#0A0F1D',
        tabActive: '#818CF8',
        tabInactive: '#475569',
        tagCyan: 'rgba(56, 189, 248, 0.15)',
        tagCyanText: '#38BDF8',
        tagGreen: 'rgba(52, 211, 153, 0.15)',
        tagGreenText: '#34D399',
        tagOrange: 'rgba(251, 146, 60, 0.15)',
        tagOrangeText: '#FB923C',
        tagPurple: 'rgba(192, 132, 252, 0.15)',
        tagPurpleText: '#C084FC',
    },
    emerald: {
        Primary: '#022C22',
        Secondary: '#34D399',
        Tertiary: '#10B981',
        White: '#064E3B',
        Black: '#ECFDF5',
        Background: '#011A14',
        cardBackground: '#042F24',
        text: '#ECFDF5',
        textSecondary: '#6EE7B7',
        border: '#065F46',
        accent: '#34D399',
        statusBar: 'light-content',
        statusBg: '#011A14',
        tabBg: '#042F24',
        tabActive: '#34D399',
        tabInactive: '#065F46',
        tagCyan: 'rgba(56, 189, 248, 0.12)',
        tagCyanText: '#7DD3FC',
        tagGreen: 'rgba(110, 231, 183, 0.15)',
        tagGreenText: '#6EE7B7',
        tagOrange: 'rgba(253, 230, 138, 0.12)',
        tagOrangeText: '#FDE68A',
        tagPurple: 'rgba(216, 180, 254, 0.12)',
        tagPurpleText: '#D8B4FE',
    },
    glass: {
        Primary: '#0A0F1F',
        Secondary: '#A9B5FF',
        Tertiary: '#35D8FF',
        White: '#121A30',
        Black: '#F8FAFF',
        Background: '#050814',
        cardBackground: 'rgba(18, 26, 48, 0.75)',
        text: '#FFFFFF',
        textSecondary: '#A9B5D1',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#A9B5FF',
        statusBar: 'light-content',
        statusBg: '#050814',
        tabBg: 'rgba(10, 15, 31, 0.85)',
        tabActive: '#A9B5FF',
        tabInactive: '#4B5878',
        tagCyan: 'rgba(53, 216, 255, 0.12)',
        tagCyanText: '#6BE5FF',
        tagGreen: 'rgba(52, 211, 153, 0.12)',
        tagGreenText: '#6EE7B7',
        tagOrange: 'rgba(251, 191, 36, 0.12)',
        tagOrangeText: '#FCD34D',
        tagPurple: 'rgba(167, 139, 250, 0.12)',
        tagPurpleText: '#C4B5FD',
    }
};
