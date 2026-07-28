import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Keyboard, LogOut, User as UserIcon, Trash2, AlertTriangle } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeContext';
import { useBillingStore } from '../../store/useBillingStore';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';



interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { rows, clearBillingForm, storeDetails } = useBillingStore();
  const { user, logout, deleteAccount } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fontHover, setFontHover] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      await deleteAccount();
      setIsProfileModalOpen(false);
      setIsConfirmDelete(false);
    } catch (err: any) {
      setDeleteAccountError(err?.response?.data?.error || err?.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ─── Font size state persisted to localStorage ─── */
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 26;
  const DEFAULT_FONT_SIZE = 16;

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('pine_font_size');
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('pine_font_size', String(fontSize));
  }, [fontSize]);

  const handleDecreaseFont = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFontSize((prev) => Math.max(MIN_FONT_SIZE, prev - 1));
  };

  const handleIncreaseFont = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFontSize((prev) => Math.min(MAX_FONT_SIZE, prev + 1));
  };

  const handleResetFont = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFontSize(DEFAULT_FONT_SIZE);
  };

  /* ─── Scroll lock when mobile menu drawer is opened ─── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);



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
  const isDark = mode === 'dark';
  const navBg = isDark ? 'rgba(5,28,26,0.80)' : 'rgba(255,255,255,0.85)';
  const mobileBg = isDark ? '#051c1a' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const txtPrimary = isDark ? '#ffffff' : '#051c1a';
  const txtMuted = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(5,28,26,0.55)';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
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
              {/* Nav links : bold 700, 24px side padding, 14px */}
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

              {/* Font size — multi-step continuous controls (A-, active size reset, A+) */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setFontHover(true)}
                onMouseLeave={() => setFontHover(false)}
              >
                {/* Trigger button */}
                <button
                  type="button"
                  title={`Font size: ${fontSize}px`}
                  style={{
                    background: fontHover ? iconHoverBg : 'none',
                    border: 'none', cursor: 'pointer', padding: '6px 10px',
                    borderRadius: '6px',
                    color: fontHover ? txtPrimary : txtMuted,
                    fontSize: '15px', fontWeight: 700, lineHeight: 1,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'background 0.15s, color 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <span>A</span>
                  <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 800 }}>{fontSize}px</span>
                </button>

                {/* Hover popover card */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    paddingTop: '8px',
                    zIndex: 60,
                    opacity: fontHover ? 1 : 0,
                    pointerEvents: fontHover ? 'auto' : 'none',
                    transform: fontHover ? 'translateY(0)' : 'translateY(-4px)',
                    transition: 'opacity 0.15s, transform 0.15s',
                    minWidth: '150px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isDark ? '#0a2421' : '#051c1a',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      padding: '4px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleDecreaseFont}
                      disabled={fontSize <= MIN_FONT_SIZE}
                      title="Decrease font size (-1px)"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        cursor: fontSize <= MIN_FONT_SIZE ? 'not-allowed' : 'pointer',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        color: fontSize <= MIN_FONT_SIZE ? 'rgba(255,255,255,0.3)' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '13px',
                        transition: 'all 0.12s',
                      }}
                    >
                      A-
                    </button>

                    <button
                      type="button"
                      onClick={handleResetFont}
                      title="Reset font size to 16px"
                      style={{
                        background: fontSize === DEFAULT_FONT_SIZE ? 'rgba(201,242,39,0.2)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        color: fontSize === DEFAULT_FONT_SIZE ? '#c9f227' : 'rgba(255,255,255,0.85)',
                        fontWeight: 800,
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        transition: 'all 0.12s',
                      }}
                    >
                      {fontSize}px
                    </button>

                    <button
                      type="button"
                      onClick={handleIncreaseFont}
                      disabled={fontSize >= MAX_FONT_SIZE}
                      title="Increase font size (+1px)"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        cursor: fontSize >= MAX_FONT_SIZE ? 'not-allowed' : 'pointer',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        color: fontSize >= MAX_FONT_SIZE ? 'rgba(255,255,255,0.3)' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '15px',
                        transition: 'all 0.12s',
                      }}
                    >
                      A+
                    </button>
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

              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    title="View Profile & Account Settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: txtPrimary,
                      background: iconHoverBg,
                      border: `1px solid ${border}`,
                      padding: '5px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#c9f227';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = border;
                    }}
                  >
                    <UserIcon style={{ width: 14, height: 14, color: '#c9f227' }} />
                    <span>{user.name || user.email.split('@')[0]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    title="Log Out"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: txtMuted, display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(239, 68, 68, 0.15)'; el.style.color = '#ef4444'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = txtMuted; }}
                  >
                    <LogOut style={{ width: 17, height: 17 }} />
                  </button>
                </div>
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
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', touchAction: 'none' }}
          onClick={() => setMobileOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
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

        {/* User info + Logout — shown when logged in */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: `1px solid ${divider}`,
              gap: '12px',
            }}
          >
            <div
              onClick={() => { setMobileOpen(false); setIsProfileModalOpen(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', cursor: 'pointer', flex: 1 }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201,242,39,0.15)',
                  border: '1.5px solid rgba(201,242,39,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UserIcon style={{ width: 16, height: 16, color: '#c9f227' }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: txtPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || user.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '11px', color: txtMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); logout(); }}
              title="Log Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.08)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: '#f87171',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              <span>Log Out</span>
            </button>
          </div>
        )}

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

          {/* Multi-step A- / Reset / A+ — inline in mobile bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            <button
              type="button"
              onClick={handleDecreaseFont}
              disabled={fontSize <= MIN_FONT_SIZE}
              title="Decrease font size"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: 'none',
                cursor: fontSize <= MIN_FONT_SIZE ? 'not-allowed' : 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                color: fontSize <= MIN_FONT_SIZE ? txtMuted : txtPrimary,
                fontWeight: 800,
                fontSize: '12px',
                transition: 'all 0.15s',
              }}
            >
              A-
            </button>

            <button
              type="button"
              onClick={handleResetFont}
              title="Reset font size to 16px"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                color: fontSize === DEFAULT_FONT_SIZE ? (isDark ? '#c9f227' : '#15803d') : txtPrimary,
                fontWeight: 800,
                fontSize: '11px',
                fontFamily: 'monospace',
                transition: 'all 0.15s',
              }}
            >
              {fontSize}px
            </button>

            <button
              type="button"
              onClick={handleIncreaseFont}
              disabled={fontSize >= MAX_FONT_SIZE}
              title="Increase font size"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: 'none',
                cursor: fontSize >= MAX_FONT_SIZE ? 'not-allowed' : 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                color: fontSize >= MAX_FONT_SIZE ? txtMuted : txtPrimary,
                fontWeight: 800,
                fontSize: '14px',
                transition: 'all 0.15s',
              }}
            >
              A+
            </button>
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

      {/* ══════════════════════════════
          USER PROFILE & ACCOUNT DELETION MODAL
          ══════════════════════════════ */}
      {isProfileModalOpen && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => {
            setIsProfileModalOpen(false);
            setIsConfirmDelete(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden animate-fadeIn"
            style={{
              backgroundColor: isDark ? '#0a2421' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              color: txtPrimary,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(201,242,39,0.15)',
                    border: '1.5px solid rgba(201,242,39,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c9f227',
                  }}
                >
                  <UserIcon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>User Profile</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: txtMuted }}>Account details & settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsConfirmDelete(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: txtMuted }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Profile Info Cards */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(5,28,26,0.6)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${border}`,
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: txtMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name / Owner
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  {user.name || 'N/A'}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: border }} />

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: txtMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </span>
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px', wordBreak: 'break-all' }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Delete Account Error Alert */}
            {deleteAccountError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '12px',
                }}
              >
                {deleteAccountError}
              </div>
            )}

            {/* Danger Zone / Delete Account Confirmation */}
            {isConfirmDelete ? (
              <div
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                  <AlertTriangle style={{ width: 18, height: 18 }} />
                  <span>Delete Account Permanently?</span>
                </div>
                <p style={{ fontSize: '12px', color: txtMuted, margin: '0 0 14px', lineHeight: 1.4 }}>
                  This will permanently delete your account, saved products, and invoices. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsConfirmDelete(false)}
                    disabled={deletingAccount}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${border}`,
                      backgroundColor: 'transparent',
                      color: txtPrimary,
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: deletingAccount ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                    }}
                  >
                    {deletingAccount ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 style={{ width: 15, height: 15 }} />
                        Yes, Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsConfirmDelete(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.16)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)')}
                >
                  <Trash2 style={{ width: 16, height: 16 }} />
                  <span>Delete My Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
