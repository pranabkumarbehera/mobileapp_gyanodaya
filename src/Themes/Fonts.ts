
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Fonts — Typography token system.
 *
 * Inter is the workhorse; every weight is named so switching
 * to a display face (e.g. Space Grotesk) later only touches this file.
 *
 * Usage guide:
 *   Display / hero numbers  → InterExtraBold / InterBlack
 *   Section headings        → InterBold / InterSemiBold
 *   Body copy               → InterRegular / InterMedium
 *   Captions / metadata     → InterLight / InterExtraLight
 *   Extreme abstraction     → InterThin (sparingly)
 */
const Fonts = {
    // Inter — primary workhorse
    InterBlack: 'Inter-Black',       // 900 — hero numbers, logotype
    InterExtraBold: 'Inter-ExtraBold',   // 800 — display headings
    InterBold: 'Inter-Bold',        // 700 — section headings
    InterSemiBold: 'Inter-SemiBold',    // 600 — sub-headings, labels
    InterMedium: 'Inter-Medium',      // 500 — body emphasis
    InterRegular: 'Inter-Regular',     // 400 — body text
    InterLight: 'Inter-Light',       // 300 — captions, metadata
    InterExtraLight: 'Inter-ExtraLight',  // 200 — overlines, micro labels
    InterThin: 'Inter-Thin',        // 100 — decorative / large sizes only
} as const;

export type FontKey = keyof typeof Fonts;
export default Fonts;