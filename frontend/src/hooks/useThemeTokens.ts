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

  /* ── Inverted Card & Surface tokens ─────────────────────────────
   * Dark Mode  → Warm Beige/Cream card (#F5F5DC) with dark text (#051c1a) & dark CTA buttons
   * Light Mode → Dark teal card (#051c1a) with white text (#ffffff) & lime CTA buttons
   * ─────────────────────────────────────────────────────────────── */
  const surfaceBg      = isDark ? '#F5F5DC'                : '#051c1a';
  const surface2Bg     = isDark ? '#e6e6cc'                : '#0f2e2b';
  const cardBorder     = isDark ? 'rgba(0,0,0,0.12)'       : 'rgba(255,255,255,0.12)';
  const cardDivide     = isDark ? 'rgba(0,0,0,0.08)'       : 'rgba(255,255,255,0.08)';
  const textStrong     = isDark ? '#051c1a'                : '#ffffff';
  const textMuted      = isDark ? 'rgba(5,28,26,0.65)'     : 'rgba(255,255,255,0.65)';
  const inputBg        = isDark ? 'rgba(0,0,0,0.05)'       : 'rgba(255,255,255,0.06)';
  const inputBorder    = isDark ? 'rgba(0,0,0,0.15)'       : 'rgba(255,255,255,0.14)';

  /* ── Inverted card aliases (used by Billing, Catalog, History, Navbar) ── */
  const inv_cardBg     = isDark ? '#F5F5DC'                : '#051c1a';
  const inv_cardBorder = isDark ? 'rgba(0,0,0,0.12)'       : 'rgba(255,255,255,0.12)';
  const inv_cardDivide = isDark ? 'rgba(0,0,0,0.08)'       : 'rgba(255,255,255,0.08)';
  const inv_textStrong = isDark ? '#051c1a'                : '#ffffff';
  const inv_textMuted  = isDark ? 'rgba(5,28,26,0.65)'     : 'rgba(255,255,255,0.65)';
  const inv_inputBg    = isDark ? 'rgba(0,0,0,0.05)'       : 'rgba(255,255,255,0.06)';
  const inv_inputBorder= isDark ? 'rgba(0,0,0,0.15)'       : 'rgba(255,255,255,0.14)';

  /* ── Button & Accent tokens ─────────────────────────────────────
   * On Warm Beige card (Dark mode) → Dark Forest Teal button (#051c1a) with White text
   * On Dark Teal card (Light mode) → Electric Lime button (#c9f227) with Dark Teal text
   * ─────────────────────────────────────────────────────────────── */
  const btnPrimaryBg    = isDark ? '#051c1a'               : '#c9f227';
  const btnPrimaryText  = isDark ? '#ffffff'               : '#051c1a';
  const btnPrimaryHover = isDark ? '#0a2e2b'               : '#d6f944';

  const accent          = isDark ? '#15803d'               : '#c9f227';
  const accentHover     = isDark ? '#166534'               : '#d6f944';
  const accentText      = isDark ? '#15803d'               : '#c9f227';

  /* ── Auth page tokens ──────────────────────────────────────── */
  const authBg          = isDark ? '#051c1a'                   : '#dde3ec';
  const authCardBg      = isDark ? '#F5F5DC'                   : '#051c1a';
  const authCardBorder  = isDark ? 'rgba(0,0,0,0.10)'          : 'rgba(255,255,255,0.12)';
  const authCardShadow  = isDark
    ? '0 24px 60px rgba(0,0,0,0.15)'
    : '0 24px 60px rgba(0,0,0,0.50)';
  const authText        = isDark ? '#051c1a'                   : '#ffffff';
  const authMuted       = isDark ? 'rgba(5,28,26,0.65)'        : 'rgba(255,255,255,0.65)';
  const authIconColor   = isDark ? '#15803d'                   : '#c9f227';
  const authInputBg     = isDark ? 'rgba(0,0,0,0.05)'          : 'rgba(255,255,255,0.06)';
  const authInputBorder = isDark ? 'rgba(0,0,0,0.15)'          : 'rgba(255,255,255,0.14)';
  const authInputText   = isDark ? '#051c1a'                   : '#ffffff';
  const authInputPlaceholder = isDark ? 'rgba(5,28,26,0.35)'  : 'rgba(255,255,255,0.35)';
  const authLabelColor  = isDark ? 'rgba(5,28,26,0.65)'        : 'rgba(255,255,255,0.65)';
  const authEyeColor    = isDark ? 'rgba(5,28,26,0.55)'        : 'rgba(255,255,255,0.75)';
  const authGlowColor1  = isDark ? 'rgba(5,28,26,0.06)'        : 'rgba(201,242,39,0.07)';
  const authGlowColor2  = isDark ? 'rgba(5,28,26,0.08)'        : 'rgba(10,56,50,0.6)';
  const authToggleBg    = isDark ? 'rgba(0,0,0,0.05)'          : 'rgba(255,255,255,0.08)';
  const authToggleBorder= isDark ? 'rgba(0,0,0,0.08)'          : 'rgba(255,255,255,0.12)';
  const authTabInactive = isDark ? 'rgba(5,28,26,0.45)'        : 'rgba(255,255,255,0.55)';
  const authFooterText  = isDark ? 'rgba(5,28,26,0.35)'        : 'rgba(255,255,255,0.35)';

  return {
    isDark,
    mode,
    // Page & Card tokens
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
