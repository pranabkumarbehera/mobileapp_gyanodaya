
/**
 * Colorpath — Brand token system.
 *
 * QUANTUM variant: original navy + amber DNA,
 * recast for a dark, high-contrast HUD aesthetic.
 * Use these tokens directly for non-themed one-off components;
 * prefer `useTheme()` everywhere else so dark/light adapts automatically.
 */
const Colorpath = {
    // ── Core brand ──────────────────────────────────────────────
    Primary: '#092948',   // Deep navy — structural chrome
    Secondary: '#f0a335',   // Charged amber — calls to action, highlights
    Tertiary: '#7d9bb9',   // Muted steel-blue — supporting elements

    // ── Neutrals ────────────────────────────────────────────────
    White: '#FFFFFF',
    Black: '#000000',

    // ── Surfaces (futuristic dark default) ──────────────────────
    Background: '#04111F',   // Deep-space void
    Surface: '#071E34',   // Hull-plate card surface
    SurfaceElevated: '#0A2A47',   // Raised dialog / sheet surface

    // ── Semantic text ────────────────────────────────────────────
    TextPrimary: '#E8F1FA',   // Near-white on dark surfaces
    TextSecondary: '#7D9BB9',   // Muted steel for labels/metadata

    // ── Interactive states ───────────────────────────────────────
    Focus: '#f0a335',         // Amber ring on focus
    Disabled: '#2D5172',         // Muted navy for inactive elements
    Error: '#FF4D6A',         // High-vis red
    Success: '#34D399',         // Mint green
    Warning: '#FACC15',         // Solar yellow

    // ── Glow / FX (use sparingly — one glow per screen) ─────────
    GlowAmber: 'rgba(240,163,53,0.35)',
    GlowNavy: 'rgba(9,41,72,0.80)',

    // ── Grid / structural lines ──────────────────────────────────
    GridLine: 'rgba(13,50,84,0.60)',
    Border: '#0E3254',
} as const;

export type ColorpathKey = keyof typeof Colorpath;
export default Colorpath;