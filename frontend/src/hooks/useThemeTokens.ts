import { useThemeMode } from '../context/ThemeContext';

/**
 * useThemeTokens
 * ──────────────────────────────────────────────────────────────────
 * Central hook for every theme colour across the app.
 *
 *  "page" tokens   → used on full-page backgrounds, lists, modals
 *  "card" tokens   → INVERTED high-contrast card used on Billing page
 *                    (dark-teal card in light mode, off-white card in dark)
 *
 * ALL pages import this hook instead of hardcoding colours individually.
 * ──────────────────────────────────────────────────────────────────
 */
export function useThemeTokens() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* ── Page / global tokens ─────────────────────────────────────── */
  /** Top-level page background */
  const pageBg      = isDark ? '#051c1a'                   : '#e2e8f0';
  /** Card / surface background */
  const surfaceBg   = isDark ? '#072420'                   : '#ffffff';
  /** Slightly elevated surface (secondary cards, nested panels) */
  const surface2Bg  = isDark ? '#0f2e2b'                   : '#f1f5f9';
  /** Card border */
  const cardBorder  = isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(0,0,0,0.10)';
  /** Subtle divider line */
  const cardDivide  = isDark ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.08)';
  /** Primary text */
  const textStrong  = isDark ? '#ffffff'                   : '#051c1a';
  /** Secondary / muted text */
  const textMuted   = isDark ? 'rgba(255,255,255,0.65)'    : 'rgba(5,28,26,0.65)';
  /** Input background */
  const inputBg     = isDark ? 'rgba(255,255,255,0.06)'    : 'rgba(0,0,0,0.04)';
  /** Input border */
  const inputBorder = isDark ? 'rgba(255,255,255,0.14)'    : 'rgba(0,0,0,0.12)';
  /** Accent / CTA (lime on dark, dark forest teal on light for 100% contrast) */
  const accent          = isDark ? '#c9f227' : '#051c1a';
  const accentHover     = isDark ? '#d6f944' : '#0a2e2b';
  /** Accent text colour — lime on dark, deep high-contrast dark green #15803d on light */
  const accentText      = isDark ? '#c9f227' : '#15803d';

  /** High-contrast primary button tokens */
  const btnPrimaryBg    = isDark ? '#c9f227' : '#051c1a';
  const btnPrimaryText  = isDark ? '#051c1a' : '#ffffff';
  const btnPrimaryHover = isDark ? '#d6f944' : '#0f2e2b';

  /* ── Card & Modal tokens (unified with signature theme) ───────── */
  const inv_cardBg     = isDark ? '#072420'                    : '#ffffff';
  const inv_cardBorder = isDark ? 'rgba(255,255,255,0.12)'   : 'rgba(0,0,0,0.10)';
  const inv_cardDivide = isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.08)';
  const inv_textStrong = isDark ? '#ffffff'                    : '#051c1a';
  const inv_textMuted  = isDark ? 'rgba(255,255,255,0.65)'   : 'rgba(5,28,26,0.65)';
  const inv_inputBg    = isDark ? 'rgba(255,255,255,0.06)'   : 'rgba(0,0,0,0.04)';
  const inv_inputBorder= isDark ? 'rgba(255,255,255,0.14)'   : 'rgba(0,0,0,0.12)';

  /* ── Auth page tokens ──────────────────────────────────────── */
  const authBg          = isDark ? '#051c1a'                   : '#dde3ec';
  const authCardBg      = isDark ? '#072420'                   : '#ffffff';
  const authCardBorder  = isDark ? 'rgba(255,255,255,0.12)'   : 'rgba(0,0,0,0.10)';
  const authCardShadow  = isDark
    ? '0 24px 60px rgba(0,0,0,0.50)'
    : '0 24px 60px rgba(0,0,0,0.15)';
  const authText        = isDark ? '#ffffff'                   : '#051c1a';
  const authMuted       = isDark ? 'rgba(255,255,255,0.65)'    : 'rgba(5,28,26,0.65)';
  const authIconColor   = isDark ? '#c9f227'                   : '#2d7a1f';
  const authInputBg     = isDark ? 'rgba(255,255,255,0.06)'    : 'rgba(0,0,0,0.04)';
  const authInputBorder = isDark ? 'rgba(255,255,255,0.14)'    : 'rgba(0,0,0,0.12)';
  const authInputText   = isDark ? '#ffffff'                   : '#051c1a';
  const authInputPlaceholder = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(5,28,26,0.35)';
  const authLabelColor  = isDark ? 'rgba(255,255,255,0.65)'    : 'rgba(5,28,26,0.65)';
  const authEyeColor    = isDark ? 'rgba(255,255,255,0.75)'    : 'rgba(5,28,26,0.55)';
  const authGlowColor1  = isDark ? 'rgba(201,242,39,0.07)'     : 'rgba(201,242,39,0.06)';
  const authGlowColor2  = isDark ? 'rgba(10,56,50,0.6)'        : 'rgba(5,28,26,0.08)';
  const authToggleBg    = isDark ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.05)';
  const authToggleBorder= isDark ? 'rgba(255,255,255,0.12)'    : 'rgba(0,0,0,0.08)';
  const authTabInactive = isDark ? 'rgba(255,255,255,0.55)'    : 'rgba(5,28,26,0.45)';
  const authFooterText  = isDark ? 'rgba(255,255,255,0.35)'    : 'rgba(5,28,26,0.35)';

  return {
    isDark,
    mode,
    // Page tokens
    pageBg, surfaceBg, surface2Bg,
    cardBorder, cardDivide,
    textStrong, textMuted,
    inputBg, inputBorder,
    accent, accentHover, accentText,
    btnPrimaryBg, btnPrimaryText, btnPrimaryHover,
    // Card & modal tokens
    inv_cardBg, inv_cardBorder, inv_cardDivide,
    inv_textStrong, inv_textMuted,
    inv_inputBg, inv_inputBorder,
    // Auth page tokens
    authBg, authCardBg, authCardBorder, authCardShadow,
    authText, authMuted, authIconColor,
    authInputBg, authInputBorder, authInputText, authInputPlaceholder,
    authLabelColor, authEyeColor,
    authGlowColor1, authGlowColor2,
    authToggleBg, authToggleBorder, authTabInactive, authFooterText,
  };
}
