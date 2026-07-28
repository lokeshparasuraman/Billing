import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Keyboard } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeContext';
import { useBillingStore } from '../../store/useBillingStore';
import { BrandLogo } from './BrandLogo';

/* Font size steps — matches pinelabs A- / A / A+ */
const FONT_SIZES = [
  { label: 'A-', value: 14, title: 'Small text' },
  { label: 'A',  value: 16, title: 'Default text' },
  { label: 'A+', value: 18, title: 'Large text' },
];

interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { rows, clearBillingForm, storeDetails } = useBillingStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fontHover, setFontHover] = useState(false);

  /* ─── Font size state persisted to localStorage ─── */
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('pine_font_size');
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('pine_font_size', String(fontSize));
  }, [fontSize]);



  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const hasEnteredProducts = rows.some(
      (r) => (r.name && r.name.trim() !== '') || (r.partNumber && r.partNumber.trim() !== '')
    );
    if (hasEnteredProducts) {
      const ok = window.confirm('Warning: You have unsaved products.\n\nDiscard and reload?');
      if (!ok) return;
    }
    clearBillingForm();
    if (location.pathname === '/') window.location.reload();
    else window.location.href = '/';
  };

  const navItems = [
    { label: 'New Bill', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Products', path: '/products' },
  ];

  /* ─── Theme tokens ─── */
  const isDark     = mode === 'dark';
  const navBg      = isDark ? 'rgba(5,28,26,0.80)' : 'rgba(255,255,255,0.85)';
  const mobileBg   = isDark ? '#051c1a' : '#ffffff';
  const border     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const txtPrimary = isDark ? '#ffffff' : '#051c1a';
  const txtMuted   = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(5,28,26,0.55)';
  const divider    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const iconHoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  return (
    <>
      {/* ══════════════════════════════
          MAIN NAVBAR — sticky, frosted
          ══════════════════════════════ */}
      <nav
        className="no-print fixed top-0 left-0 right-0 w-full z-50"
        style={{
          backgroundColor: navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '0' }}>

            {/* LEFT: Brand wordmark */}
            <a href="/" onClick={handleLogoClick} style={{ textDecoration: 'none', flexShrink: 0, marginRight: 'auto' }}>
              <BrandLogo storeName={storeDetails.storeName} size="md" />
            </a>

            {/* RIGHT GROUP: nav links + controls — hidden on mobile, flex on md+ */}
            <div
              className="hidden md:flex"
              style={{ alignItems: 'center', height: '64px', gap: '0' }}
            >
              {/* Nav links — matching pinelabs: bold 700, 24px side padding, 14px */}
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 24px',
                      height: '64px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isActive ? txtPrimary : txtMuted,
                      textDecoration: 'none',
                      letterSpacing: '0em',
                      transition: 'color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    className="pine-nav-link"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = txtPrimary; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = txtMuted; }}
                  >
                    {item.label}
                    {/* Thin bottom underline */}
                    <span
                      className="pine-nav-underline"
                      style={{
                        position: 'absolute', bottom: 0, left: '24px', right: '24px',
                        height: '2px', backgroundColor: txtPrimary,
                        borderRadius: '2px 2px 0 0',
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'opacity 0.18s, transform 0.18s',
                      }}
                    />
                  </Link>
                );
              })}

              {/* Separator */}
              <div style={{ width: '1px', height: '20px', backgroundColor: border, margin: '0 16px' }} />

              {/* Theme toggle */}
              <button
                type="button" onClick={toggleTheme}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: txtMuted, display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = iconHoverBg; el.style.color = txtPrimary; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = txtMuted; }}
              >
                {isDark ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
              </button>

              {/* Font size — hover to reveal A- / A / A+ pill, exactly like pinelabs */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setFontHover(true)}
                onMouseLeave={() => setFontHover(false)}
              >
                {/* 'A' label — the trigger */}
                <button
                  type="button"
                  title="Font size"
                  style={{
                    background: fontHover ? iconHoverBg : 'none',
                    border: 'none', cursor: 'default', padding: '6px 10px',
                    borderRadius: '6px',
                    color: fontHover ? txtPrimary : txtMuted,
                    fontSize: '15px', fontWeight: 700, lineHeight: 1,
                    display: 'flex', alignItems: 'center',
                    transition: 'background 0.15s, color 0.15s',
                    userSelect: 'none',
                  }}
                >
                  A
                </button>

                {/* Hover dropdown — sits at top:100% with paddingTop bridge so hover never breaks */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    paddingTop: '8px',          /* transparent bridge — keeps hover alive */
                    zIndex: 60,
                    opacity: fontHover ? 1 : 0,
                    pointerEvents: fontHover ? 'auto' : 'none',
                    transform: fontHover ? 'translateY(0)' : 'translateY(-4px)',
                    transition: 'opacity 0.15s, transform 0.15s',
                    minWidth: '120px',
                  }}
                >
                  {/* Visible pill card */}
                  <div
                    style={{
                      backgroundColor: isDark ? '#0a2421' : '#051c1a',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '12px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                    }}
                  >
                    {FONT_SIZES.map((fs, i) => {
                      const isSelected = fontSize === fs.value;
                      return (
                        <React.Fragment key={fs.value}>
                          {i > 0 && <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />}
                          <button
                            type="button"
                            onClick={() => setFontSize(fs.value)}
                            title={fs.title}
                            style={{
                              background: isSelected ? 'rgba(255,255,255,0.14)' : 'none',
                              border: 'none', cursor: 'pointer',
                              padding: '7px 14px', borderRadius: '8px',
                              color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.55)',
                              fontWeight: isSelected ? 800 : 500,
                              fontSize: fs.label === 'A-' ? '12px' : fs.label === 'A+' ? '16px' : '14px',
                              transition: 'background 0.12s, color 0.12s',
                              flex: 1,
                            }}
                            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
                          >
                            {fs.label}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Shortcuts */}
              {onOpenShortcuts && (
                <button
                  type="button" onClick={onOpenShortcuts}
                  title="Keyboard Shortcuts"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: txtMuted, display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = iconHoverBg; el.style.color = txtPrimary; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = txtMuted; }}
                >
                  <Keyboard style={{ width: 17, height: 17 }} />
                </button>
              )}
            </div>

            {/* MOBILE ONLY: Hamburger — flex on mobile, hidden on md+ */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: txtPrimary, alignItems: 'center', marginLeft: '8px' }}
            >
              <Menu style={{ width: 24, height: 24 }} />
            </button>
          </div>
        </div>

        <style>{`
          .pine-nav-link:hover .pine-nav-underline {
            opacity: 1 !important;
            transform: scaleX(1) !important;
          }
        `}</style>
      </nav>

      {/* ══════════════════════════════
          MOBILE DRAWER
          ══════════════════════════════ */}

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="flex md:hidden fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex flex-col"
        style={{
          backgroundColor: mobileBg,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          borderBottom: `1px solid ${divider}`,
          minHeight: '100dvh',
          maxHeight: '100dvh',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${divider}` }}>
          <a href="/" onClick={handleLogoClick} style={{ textDecoration: 'none' }}>
            <BrandLogo storeName={storeDetails.storeName} size="md" />
          </a>
          <button type="button" onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: txtPrimary, display: 'flex', alignItems: 'center' }}>
            <X style={{ width: 24, height: 24 }} />
          </button>
        </div>

        {/* Nav items — pinelabs style with chevron */}
        <div style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', fontSize: '17px', fontWeight: isActive ? 700 : 600, color: isActive ? txtPrimary : txtMuted, textDecoration: 'none', borderBottom: `1px solid ${divider}`, transition: 'background 0.12s' }}
              >
                <span>{item.label}</span>
                <ChevronRight style={{ width: 18, height: 18, color: txtMuted }} />
              </Link>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div style={{ padding: '20px', borderTop: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Sun / Moon pair */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '6px' }}>
            <button type="button" onClick={() => { if (isDark) toggleTheme(); }}
              style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: !isDark ? iconHoverBg : 'none', color: !isDark ? txtPrimary : txtMuted, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              title="Light Mode">
              <Sun style={{ width: 18, height: 18 }} />
            </button>
            <button type="button" onClick={() => { if (!isDark) toggleTheme(); }}
              style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: isDark ? iconHoverBg : 'none', color: isDark ? txtPrimary : txtMuted, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              title="Dark Mode">
              <Moon style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* A- / A / A+ — inline in mobile bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '4px', gap: '2px' }}>
            {FONT_SIZES.map((fs, i) => {
              const isSelected = fontSize === fs.value;
              return (
                <React.Fragment key={fs.value}>
                  {i > 0 && <div style={{ width: '1px', height: '16px', backgroundColor: divider, flexShrink: 0 }} />}
                  <button
                    type="button"
                    onClick={() => setFontSize(fs.value)}
                    title={fs.title}
                    style={{
                      background: isSelected ? iconHoverBg : 'none',
                      border: 'none', cursor: 'pointer', padding: '7px 12px',
                      borderRadius: '8px',
                      color: isSelected ? txtPrimary : txtMuted,
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: fs.label === 'A-' ? '11px' : fs.label === 'A+' ? '15px' : '13px',
                      transition: 'all 0.15s',
                    }}
                  >
                    {fs.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {onOpenShortcuts && (
            <button type="button" onClick={() => { setMobileOpen(false); onOpenShortcuts(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: `1px solid ${divider}`, background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: txtMuted }}>
              <Keyboard style={{ width: 15, height: 15 }} />
              <span>Shortcuts</span>
            </button>
          )}
        </div>


      </div>
    </>
  );
};
