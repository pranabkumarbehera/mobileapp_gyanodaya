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
    // Extended futuristic tokens
    glowPrimary: string;
    glowSecondary: string;
    surface: string;
    surfaceElevated: string;
    gridLine: string;
}

export const themes: Record<string, ThemeColors> = {
    /**
     * QUANTUM — Deep space navy + charged amber.
     * Original brand palette evolved: same DNA, new energy.
     * Grid lines and amber glow give it a HUD / cockpit feel.
     */
    quantum: {
        Primary: '#092948',
        Secondary: '#f0a335',
        Tertiary: '#7d9bb9',
        White: '#FFFFFF',
        Black: '#020D18',
        Background: '#04111F',          // Deep space void
        cardBackground: '#071E34',       // Elevated hull plate
        text: '#E8F1FA',
        textSecondary: '#7D9BB9',
        border: '#0E3254',
        accent: '#f0a335',
        statusBar: 'light-content',
        statusBg: '#0379f7ff',
        tabBg: '#071E34',
        tabActive: '#f0a335',
        tabInactive: '#2D5172',
        tagCyan: 'rgba(125,155,185,0.12)',
        tagCyanText: '#7DCFFF',
        tagGreen: 'rgba(52,211,153,0.12)',
        tagGreenText: '#34D399',
        tagOrange: 'rgba(240,163,53,0.15)',
        tagOrangeText: '#f0a335',
        tagPurple: 'rgba(139,92,246,0.12)',
        tagPurpleText: '#A78BFA',
        glowPrimary: 'rgba(9,41,72,0.8)',
        glowSecondary: 'rgba(240,163,53,0.35)',
        surface: '#071E34',
        surfaceElevated: '#0A2A47',
        gridLine: 'rgba(13,50,84,0.6)',
    },

    /**
     * NEON — Cyberpunk cyan on a pure-black canvas.
     */
    neon: {
        Primary: '#050505',
        Secondary: '#00F0FF',
        Tertiary: '#B537F2',
        White: '#121212',
        Black: '#FFFFFF',
        Background: '#020202',
        cardBackground: '#0D0D0D',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#1E1E1E',
        accent: '#00F0FF',
        statusBar: 'light-content',
        statusBg: '#020202',
        tabBg: '#0D0D0D',
        tabActive: '#00F0FF',
        tabInactive: '#475569',
        tagCyan: 'rgba(0,240,255,0.10)',
        tagCyanText: '#00F0FF',
        tagGreen: 'rgba(52,211,153,0.10)',
        tagGreenText: '#34D399',
        tagOrange: 'rgba(251,146,60,0.10)',
        tagOrangeText: '#FB923C',
        tagPurple: 'rgba(181,55,242,0.10)',
        tagPurpleText: '#B537F2',
        glowPrimary: 'rgba(0,240,255,0.15)',
        glowSecondary: 'rgba(181,55,242,0.20)',
        surface: '#0D0D0D',
        surfaceElevated: '#141414',
        gridLine: 'rgba(0,240,255,0.05)',
    },

    /**
     * AURORA — Indigo + rose on soft gray. Light & vivid.
     */
    aurora: {
        Primary: '#4338CA',
        Secondary: '#F43F5E',
        Tertiary: '#8B5CF6',
        White: '#FFFFFF',
        Black: '#0F172A',
        Background: '#F4F4F5',
        cardBackground: '#FFFFFF',
        text: '#1E1B4B',
        textSecondary: '#5B21B6',
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
        glowPrimary: 'rgba(67,56,202,0.15)',
        glowSecondary: 'rgba(244,63,94,0.15)',
        surface: '#F9F9FB',
        surfaceElevated: '#FFFFFF',
        gridLine: 'rgba(67,56,202,0.07)',
    },

    /**
     * MIDNIGHT — Soft indigo + pink on near-black slate.
     */
    midnight: {
        Primary: '#0F172A',
        Secondary: '#818CF8',
        Tertiary: '#F472B6',
        White: '#1E293B',
        Black: '#F8FAFC',
        Background: '#020617',
        cardBackground: '#0A0F1D',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#1E293B',
        accent: '#818CF8',
        statusBar: 'light-content',
        statusBg: '#020617',
        tabBg: '#0A0F1D',
        tabActive: '#818CF8',
        tabInactive: '#475569',
        tagCyan: 'rgba(56,189,248,0.15)',
        tagCyanText: '#38BDF8',
        tagGreen: 'rgba(52,211,153,0.15)',
        tagGreenText: '#34D399',
        tagOrange: 'rgba(251,146,60,0.15)',
        tagOrangeText: '#FB923C',
        tagPurple: 'rgba(192,132,252,0.15)',
        tagPurpleText: '#C084FC',
        glowPrimary: 'rgba(129,140,248,0.20)',
        glowSecondary: 'rgba(244,114,182,0.15)',
        surface: '#0A0F1D',
        surfaceElevated: '#101828',
        gridLine: 'rgba(30,41,59,0.8)',
    },

    /**
     * EMERALD — Deep green with mint glow. Bioluminescent aesthetic.
     */
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
        tagCyan: 'rgba(56,189,248,0.12)',
        tagCyanText: '#7DD3FC',
        tagGreen: 'rgba(110,231,183,0.15)',
        tagGreenText: '#6EE7B7',
        tagOrange: 'rgba(253,230,138,0.12)',
        tagOrangeText: '#FDE68A',
        tagPurple: 'rgba(216,180,254,0.12)',
        tagPurpleText: '#D8B4FE',
        glowPrimary: 'rgba(52,211,153,0.20)',
        glowSecondary: 'rgba(16,185,129,0.15)',
        surface: '#042F24',
        surfaceElevated: '#053828',
        gridLine: 'rgba(6,95,70,0.5)',
    },

    /**
     * GLASS — Frosted dark UI. Translucency as the signature element.
     */
    glass: {
        Primary: '#0A0F1F',
        Secondary: '#A9B5FF',
        Tertiary: '#35D8FF',
        White: '#121A30',
        Black: '#F8FAFF',
        Background: '#050814',
        cardBackground: 'rgba(18,26,48,0.75)',
        text: '#FFFFFF',
        textSecondary: '#A9B5D1',
        border: 'rgba(255,255,255,0.08)',
        accent: '#A9B5FF',
        statusBar: 'light-content',
        statusBg: '#050814',
        tabBg: 'rgba(10,15,31,0.85)',
        tabActive: '#A9B5FF',
        tabInactive: '#4B5878',
        tagCyan: 'rgba(53,216,255,0.12)',
        tagCyanText: '#6BE5FF',
        tagGreen: 'rgba(52,211,153,0.12)',
        tagGreenText: '#6EE7B7',
        tagOrange: 'rgba(251,191,36,0.12)',
        tagOrangeText: '#FCD34D',
        tagPurple: 'rgba(167,139,250,0.12)',
        tagPurpleText: '#C4B5FD',
        glowPrimary: 'rgba(169,181,255,0.15)',
        glowSecondary: 'rgba(53,216,255,0.12)',
        surface: 'rgba(18,26,48,0.6)',
        surfaceElevated: 'rgba(24,36,64,0.85)',
        gridLine: 'rgba(255,255,255,0.04)',
    },

    /**
     * CLASSIC — Crisp light mode. Navy + amber on white.
     */
    classic: {
        Primary: '#0A192F',
        Secondary: '#FFB23F',
        Tertiary: '#8892B0',
        White: '#FFFFFF',
        Black: '#020C1B',
        Background: '#F8FAFC',
        cardBackground: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#FFB23F',
        statusBar: 'dark-content',
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
        glowPrimary: 'rgba(10,25,47,0.10)',
        glowSecondary: 'rgba(255,178,63,0.20)',
        surface: '#F1F5F9',
        surfaceElevated: '#FFFFFF',
        gridLine: 'rgba(226,232,240,0.8)',
    },

    /**
     * SUNSET — Deep espresso + fire amber. Warm dark mode.
     */
    sunset: {
        Primary: '#1E0D06',
        Secondary: '#FA9A3B',
        Tertiary: '#FACC15',
        White: '#2A170F',
        Black: '#FFF7ED',
        Background: '#0F0603',
        cardBackground: '#1C0D08',
        text: '#FFEDD5',
        textSecondary: '#F97316',
        border: '#3D1D11',
        accent: '#FA9A3B',
        statusBar: 'light-content',
        statusBg: '#0F0603',
        tabBg: '#1C0D08',
        tabActive: '#FA9A3B',
        tabInactive: '#7C2D12',
        tagCyan: 'rgba(156,163,175,0.15)',
        tagCyanText: '#D1D5DB',
        tagGreen: 'rgba(74,222,128,0.15)',
        tagGreenText: '#4ADE80',
        tagOrange: 'rgba(253,186,116,0.15)',
        tagOrangeText: '#FDBA74',
        tagPurple: 'rgba(233,213,255,0.15)',
        tagPurpleText: '#E9D5FF',
        glowPrimary: 'rgba(250,154,59,0.20)',
        glowSecondary: 'rgba(250,204,21,0.15)',
        surface: '#1C0D08',
        surfaceElevated: '#28130A',
        gridLine: 'rgba(61,29,17,0.8)',
    },
};

/** Default theme key — matches original brand colors */
export const DEFAULT_THEME = 'quantum';