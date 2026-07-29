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
  const surfaceBg   = isDark ? '#0a2421'                   : '#f1f5f9';
  /** Slightly elevated surface (secondary cards, nested panels) */
  const surface2Bg  = isDark ? '#0f2e2b'                   : '#e8edf3';
  /** Card border */
  const cardBorder  = isDark ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.10)';
  /** Subtle divider line */
  const cardDivide  = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.08)';
  /** Primary text */
  const textStrong  = isDark ? '#ffffff'                   : '#051c1a';
  /** Secondary / muted text */
  const textMuted   = isDark ? 'rgba(255,255,255,0.60)'    : 'rgba(5,28,26,0.60)';
  /** Input background */
  const inputBg     = isDark ? 'rgba(255,255,255,0.06)'    : 'rgba(0,0,0,0.04)';
  /** Input border */
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)'    : 'rgba(0,0,0,0.12)';
  /** Accent / CTA (lime) — same in both modes */
  const accent      = '#c9f227';
  const accentHover = '#d6f944';
  /** Accent text colour — lime on dark, deep teal on light for legibility */
  const accentText  = isDark ? '#c9f227'                   : '#2d7a1f';

  /* ── Inverted billing card tokens ────────────────────────────── */
  // The Billing Header / Product Table / Calculation Summary use an inverted
  // card (dark teal in light mode, near-white in dark mode) so the print card
  // stands out against the page background.
  const inv_cardBg     = isDark ? '#ebedf0'                    : '#051c1a';
  const inv_cardBorder = isDark ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.12)';
  const inv_cardDivide = isDark ? 'rgba(0,0,0,0.07)'           : 'rgba(255,255,255,0.07)';
  const inv_textStrong = isDark ? '#051c1a'                    : '#ffffff';
  const inv_textMuted  = isDark ? 'rgba(5,28,26,0.60)'         : 'rgba(255,255,255,0.65)';
  const inv_inputBg    = isDark ? 'rgba(0,0,0,0.04)'           : 'rgba(255,255,255,0.06)';
  const inv_inputBorder= isDark ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.08)';

  /* ── Auth page tokens ──────────────────────────────────────── */
  // Auth page ALSO uses the inverted card (dark teal in light, near-white in dark)
  // so it is visually consistent with the rest of the app.
  const authBg          = isDark ? '#051c1a'                   : '#dde3ec';
  const authCardBg      = isDark ? '#ebedf0'                   : '#051c1a';   // ← inverted billing card
  const authCardBorder  = isDark ? 'rgba(0,0,0,0.08)'          : 'rgba(255,255,255,0.12)';
  const authCardShadow  = isDark
    ? '0 24px 60px rgba(0,0,0,0.15)'
    : '0 24px 60px rgba(0,0,0,0.50)';
  const authText        = isDark ? '#051c1a'                   : '#ffffff';   // text inside inverted card
  const authMuted       = isDark ? 'rgba(5,28,26,0.60)'        : 'rgba(255,255,255,0.65)';
  const authIconColor   = isDark ? '#2d7a1f'                   : '#c9f227';   // lime on dark card, teal on light card
  const authInputBg     = isDark ? 'rgba(0,0,0,0.05)'          : 'rgba(255,255,255,0.06)';
  const authInputBorder = isDark ? 'rgba(0,0,0,0.15)'          : 'rgba(255,255,255,0.18)';
  const authInputText   = isDark ? '#051c1a'                   : '#ffffff';
  const authInputPlaceholder = isDark ? 'rgba(5,28,26,0.35)'  : 'rgba(255,255,255,0.35)';
  const authLabelColor  = isDark ? 'rgba(5,28,26,0.60)'        : 'rgba(255,255,255,0.65)';
  const authEyeColor    = isDark ? 'rgba(5,28,26,0.55)'        : 'rgba(255,255,255,0.75)';
  const authGlowColor1  = isDark ? 'rgba(201,242,39,0.06)'     : 'rgba(201,242,39,0.07)';
  const authGlowColor2  = isDark ? 'rgba(5,28,26,0.08)'        : 'rgba(10,56,50,0.6)';
  const authToggleBg    = isDark ? 'rgba(0,0,0,0.08)'          : 'rgba(5,28,26,0.85)';
  const authToggleBorder= isDark ? 'rgba(0,0,0,0.12)'          : 'rgba(255,255,255,0.08)';
  const authTabInactive = isDark ? 'rgba(5,28,26,0.45)'        : 'rgba(255,255,255,0.55)';
  const authFooterText  = isDark ? 'rgba(5,28,26,0.35)'        : 'rgba(255,255,255,0.30)';

  return {
    isDark,
    mode,
    // Page tokens
    pageBg, surfaceBg, surface2Bg,
    cardBorder, cardDivide,
    textStrong, textMuted,
    inputBg, inputBorder,
    accent, accentHover, accentText,
    // Inverted billing card tokens
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
