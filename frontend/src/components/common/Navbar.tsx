import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Keyboard, LogOut, User as UserIcon, Trash2, AlertTriangle, Landmark, Receipt, History as HistoryIcon, Package } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemeTokens } from '../../hooks/useThemeTokens';
import { useBillingStore } from '../../store/useBillingStore';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { saveBankDetailsApi } from '../../services/api';

interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const location = useLocation();
  const { toggleTheme } = useThemeMode();
  const { rows, clearBillingForm, storeDetails, setStoreDetails } = useBillingStore();
  const { user, logout, deleteAccount } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fontHover, setFontHover] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  /* ─── Bank details modal state & handlers ─── */
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    upiId: '',
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);
  const [bankFormError, setBankFormError] = useState<string | null>(null);

  const handleOpenBankModal = () => {
    setBankForm({
      bankName: storeDetails.bankName || '',
      accountNumber: storeDetails.accountNumber || '',
      ifscCode: storeDetails.ifscCode || '',
      branchName: storeDetails.branchName || '',
      upiId: storeDetails.upiId || '',
    });
    setBankFormError(null);
    setBankSaveSuccess(false);
    setIsBankModalOpen(true);
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankFormError(null);
    setBankSaveSuccess(false);

    const bankName = bankForm.bankName.trim();
    const accountNumber = bankForm.accountNumber.trim();
    const ifscCode = bankForm.ifscCode.trim().toUpperCase();
    const branchName = bankForm.branchName.trim();
    const upiId = bankForm.upiId.trim().toLowerCase();

    // ── CLIENT-SIDE VALIDATION (mirror of backend) ──────────────────────────
    if (!bankName || bankName.length < 3) {
      setBankFormError('Bank Name must be at least 3 characters long.');
      return;
    }

    // Account Number: ONLY digits, 9-18 chars
    if (!accountNumber) {
      setBankFormError('Account Number is required.');
      return;
    }
    if (!/^\d+$/.test(accountNumber)) {
      setBankFormError('Account Number must contain ONLY numbers (0–9). Letters or special characters are NOT allowed.');
      return;
    }
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      setBankFormError(`Account Number is ${accountNumber.length} digit(s) — must be between 9 and 18 digits (standard Indian bank account).`);
      return;
    }

    // IFSC: 4 letters + 0 + 6 alphanumeric = 11 chars total
    if (!ifscCode) {
      setBankFormError('IFSC Code is required.');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      setBankFormError(
        'Invalid IFSC Code. Must be exactly 11 characters: 4 letters + "0" + 6 letters/numbers (e.g. SBIN0001234).'
      );
      return;
    }

    // Branch Name: at least 3 characters
    if (!branchName || branchName.length < 3) {
      setBankFormError('Branch Name must be at least 3 characters long.');
      return;
    }

    // UPI ID: optional but validated if filled
    if (upiId && !/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/.test(upiId)) {
      setBankFormError('Invalid UPI ID format. Example: owshika@sbi or 9876543210@paytm');
      return;
    }
    // ── END CLIENT-SIDE VALIDATION ───────────────────────────────────────────

    setIsSavingBank(true);
    try {
      // ── Call API FIRST — never write to localStorage/store until API says OK ──
      const confirmed = await saveBankDetailsApi({
        bankName: bankName.toUpperCase(),
        accountNumber,
        ifscCode,
        branchName,
        upiId,
      });

      // API succeeded: now update local Zustand state + localStorage
      setStoreDetails({
        bankName: confirmed.bankName ?? bankName.toUpperCase(),
        accountNumber: confirmed.accountNumber ?? accountNumber,
        ifscCode: confirmed.ifscCode ?? ifscCode,
        branchName: confirmed.branchName ?? branchName,
        upiId: confirmed.upiId ?? upiId,
      });

      setBankSaveSuccess(true);
      setTimeout(() => {
        setIsBankModalOpen(false);
        setBankSaveSuccess(false);
      }, 1200);
    } catch (err: any) {
      // API rejected the data — show the backend's exact error message
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save bank details. Please check all fields and try again.';
      setBankFormError(`❌ ${serverMsg}`);
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      await deleteAccount();
      setIsProfileModalOpen(false);
      setIsConfirmDelete(false);
      setMobileOpen(false);
    } catch (err: any) {
      setDeleteAccountError(err?.response?.data?.error || err?.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ─── Font size state — resets to DEFAULT (16px) on page reload ─── */
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 26;
  const DEFAULT_FONT_SIZE = 16;

  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
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

  /* ─── Scroll lock when mobile menu drawer, profile modal, or bank modal is opened ─── */
  useEffect(() => {
    if (mobileOpen || isProfileModalOpen || isBankModalOpen) {
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
  }, [mobileOpen, isProfileModalOpen, isBankModalOpen]);



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
    { label: 'New Bill', path: '/', icon: Receipt },
    { label: 'History', path: '/history', icon: HistoryIcon },
    { label: 'Products', path: '/products', icon: Package },
  ];

  /* ─── Theme tokens — all using inverted card design (billing page style) ─── */
  const {
    isDark,
    inv_cardBg, inv_cardBorder, inv_cardDivide,
    inv_textStrong: txtPrimary, inv_textMuted: txtMuted,
    inv_textStrong: mTxt, inv_textMuted: mMuted,
    inv_inputBg: mInputBg, inv_inputBorder: mInputBorder,
    accent,
  } = useThemeTokens();
  const navBg = isDark ? 'rgba(245,245,220,0.85)' : 'rgba(5,28,26,0.85)';
  const mobileBg = isDark ? '#F5F5DC' : '#051c1a';
  const border = isDark ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)';
  const divider = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const iconHoverBg = isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';

  return (
    <>
      {/* ══════════════════════════════
          MAIN NAVBAR — sticky, perfect frosted glass
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
        <div style={{ width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', width: '100%', justifyContent: 'space-between' }}>

            {/* LEFT: Brand wordmark */}
            <a href="/" onClick={handleLogoClick} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <BrandLogo storeName={storeDetails.storeName} size="md" />
            </a>

            {/* RIGHT GROUP: nav links + controls — right anchored with zero right corner gap & generous gaps */}
            <div
              className="hidden md:flex"
              style={{ alignItems: 'center', height: '64px', gap: '16px', marginLeft: 'auto' }}
            >
              {/* Nav links : bold 700, 16px side padding */}
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
                      padding: '0 16px',
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
                        position: 'absolute', bottom: 0, left: '16px', right: '16px',
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

              {/* Bank Details button */}
              <button
                type="button"
                onClick={handleOpenBankModal}
                title="Edit Bank Details & UPI"
                className="pine-nav-link"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 14px',
                  height: '64px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isBankModalOpen ? txtPrimary : txtMuted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0em',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = txtPrimary; }}
                onMouseLeave={e => { if (!isBankModalOpen) (e.currentTarget as HTMLElement).style.color = txtMuted; }}
              >
                <Landmark style={{ width: 16, height: 16 }} />
                <span>Bank Details</span>
                <span
                  className="pine-nav-underline"
                  style={{
                    position: 'absolute', bottom: 0, left: '14px', right: '14px',
                    height: '2px', backgroundColor: txtPrimary,
                    borderRadius: '2px 2px 0 0',
                    opacity: isBankModalOpen ? 1 : 0,
                    transform: isBankModalOpen ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'opacity 0.18s, transform 0.18s',
                  }}
                />
              </button>

              {/* Separator */}
              <div style={{ width: '1px', height: '20px', backgroundColor: border, margin: '0 4px' }} />

              {/* Single Icon Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  backgroundColor: isDark ? '#051c1a' : '#c9f227',
                  color: isDark ? '#c9f227' : '#051c1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isDark
                    ? '0 0 12px rgba(201,242,39,0.35)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}
              >
                {isDark ? (
                  <Moon style={{ width: 18, height: 18, color: '#c9f227' }} />
                ) : (
                  <Sun style={{ width: 18, height: 18, color: '#051c1a' }} />
                )}
              </button>

              {/* Redesigned Font Size Segmented Toggle (A- / A+) */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.20)',
                  border: `1px solid ${border}`,
                  gap: '3px',
                }}
              >
                <button
                  type="button"
                  onClick={handleDecreaseFont}
                  disabled={fontSize <= MIN_FONT_SIZE}
                  title="Decrease font size"
                  style={{
                    padding: '4px 11px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: fontSize <= MIN_FONT_SIZE ? 'not-allowed' : 'pointer',
                    backgroundColor: fontSize < DEFAULT_FONT_SIZE ? (isDark ? '#051c1a' : '#c9f227') : 'transparent',
                    color: fontSize < DEFAULT_FONT_SIZE
                      ? (isDark ? '#c9f227' : '#051c1a')
                      : (fontSize <= MIN_FONT_SIZE ? (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)') : txtPrimary),
                    fontWeight: 800,
                    fontSize: '13px',
                    transition: 'all 0.18s ease-in-out',
                    boxShadow: fontSize < DEFAULT_FONT_SIZE ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  A-
                </button>

                <button
                  type="button"
                  onClick={handleIncreaseFont}
                  disabled={fontSize >= MAX_FONT_SIZE}
                  title="Increase font size"
                  style={{
                    padding: '4px 11px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: fontSize >= MAX_FONT_SIZE ? 'not-allowed' : 'pointer',
                    backgroundColor: fontSize > DEFAULT_FONT_SIZE ? (isDark ? '#051c1a' : '#c9f227') : 'transparent',
                    color: fontSize > DEFAULT_FONT_SIZE
                      ? (isDark ? '#c9f227' : '#051c1a')
                      : (fontSize >= MAX_FONT_SIZE ? (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)') : txtPrimary),
                    fontWeight: 800,
                    fontSize: '14px',
                    transition: 'all 0.18s ease-in-out',
                    boxShadow: fontSize > DEFAULT_FONT_SIZE ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  A+
                </button>
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
                <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    title="View Profile & Account Settings"
                    className="pine-nav-link"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 12px',
                      height: '64px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isProfileModalOpen ? txtPrimary : txtMuted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0em',
                      transition: 'color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = txtPrimary; }}
                    onMouseLeave={e => { if (!isProfileModalOpen) (e.currentTarget as HTMLElement).style.color = txtMuted; }}
                  >
                    <UserIcon style={{ width: 16, height: 16 }} />
                    <span>{user.name || user.email.split('@')[0]}</span>
                    <span
                      className="pine-nav-underline"
                      style={{
                        position: 'absolute', bottom: 0, left: '12px', right: '12px',
                        height: '2px', backgroundColor: txtPrimary,
                        borderRadius: '2px 2px 0 0',
                        opacity: isProfileModalOpen ? 1 : 0,
                        transform: isProfileModalOpen ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'opacity 0.18s, transform 0.18s',
                      }}
                    />
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

        {/* Nav items — with high-contrast theme-matching icons before each item */}
        <div style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  fontSize: '17px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? txtPrimary : txtMuted,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${divider}`,
                  transition: 'background 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(5,28,26,0.12)' : 'rgba(201,242,39,0.18)')
                        : (isDark ? 'rgba(5,28,26,0.06)' : 'rgba(255,255,255,0.08)'),
                      border: `1px solid ${isActive ? (isDark ? 'rgba(5,28,26,0.25)' : 'rgba(201,242,39,0.4)') : border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive
                        ? (isDark ? '#051c1a' : '#c9f227')
                        : (isDark ? '#051c1a' : '#ffffff'),
                      flexShrink: 0,
                    }}
                  >
                    <ItemIcon style={{ width: 18, height: 18 }} />
                  </div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: txtMuted }} />
              </Link>
            );
          })}

          {/* Mobile Bank Details button with theme-matching icon */}
          <div
            onClick={handleOpenBankModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              fontSize: '17px',
              fontWeight: 600,
              color: txtPrimary,
              cursor: 'pointer',
              borderBottom: `1px solid ${divider}`,
              transition: 'background 0.12s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(5,28,26,0.06)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#051c1a' : '#c9f227',
                  flexShrink: 0,
                }}
              >
                <Landmark style={{ width: 18, height: 18 }} />
              </div>
              <span>Bank Details</span>
            </div>
            <ChevronRight style={{ width: 18, height: 18, color: txtMuted }} />
          </div>
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
              onClick={() => setIsProfileModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', cursor: 'pointer', flex: 1 }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(5,28,26,0.08)' : 'rgba(201,242,39,0.18)',
                  border: `1.5px solid ${isDark ? 'rgba(5,28,26,0.20)' : 'rgba(201,242,39,0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#051c1a' : '#c9f227',
                  flexShrink: 0,
                }}
              >
                <UserIcon style={{ width: 18, height: 18 }} />
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

        {/* Bottom controls — high-contrast in both Light & Dark modes */}
        <div style={{ padding: '20px', borderTop: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Single Icon Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `1px solid ${border}`,
              cursor: 'pointer',
              backgroundColor: isDark ? '#051c1a' : '#c9f227',
              color: isDark ? '#c9f227' : '#051c1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDark
                ? '0 0 12px rgba(201,242,39,0.35)'
                : '0 2px 8px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            {isDark ? (
              <Moon style={{ width: 20, height: 20, color: '#c9f227' }} />
            ) : (
              <Sun style={{ width: 20, height: 20, color: '#051c1a' }} />
            )}
          </button>

          {/* Pine Labs style Font Switcher (A- / A+) */}
          <div style={{ display: 'flex', alignItems: 'center', background: isDark ? 'rgba(5,28,26,0.08)' : 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '4px', gap: '4px', border: `1px solid ${border}` }}>
            <button
              type="button"
              onClick={handleDecreaseFont}
              disabled={fontSize <= MIN_FONT_SIZE}
              title="Decrease font size"
              style={{
                background: fontSize < DEFAULT_FONT_SIZE ? (isDark ? '#051c1a' : '#c9f227') : (isDark ? 'rgba(5,28,26,0.06)' : 'rgba(255,255,255,0.08)'),
                border: 'none',
                cursor: fontSize <= MIN_FONT_SIZE ? 'not-allowed' : 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                color: fontSize <= MIN_FONT_SIZE ? txtMuted : (isDark ? '#051c1a' : '#ffffff'),
                fontWeight: 800,
                fontSize: '13px',
                transition: 'all 0.15s',
              }}
            >
              A-
            </button>

            <button
              type="button"
              onClick={handleIncreaseFont}
              disabled={fontSize >= MAX_FONT_SIZE}
              title="Increase font size"
              style={{
                background: fontSize > DEFAULT_FONT_SIZE ? (isDark ? '#051c1a' : '#c9f227') : (isDark ? 'rgba(5,28,26,0.06)' : 'rgba(255,255,255,0.08)'),
                border: 'none',
                cursor: fontSize >= MAX_FONT_SIZE ? 'not-allowed' : 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                color: fontSize >= MAX_FONT_SIZE ? txtMuted : (isDark ? '#051c1a' : '#ffffff'),
                fontWeight: 800,
                fontSize: '14px',
                transition: 'all 0.15s',
              }}
            >
              A+
            </button>
          </div>

          {onOpenShortcuts && (
            <button
              type="button"
              onClick={() => { setMobileOpen(false); onOpenShortcuts(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(5,28,26,0.25)' : 'rgba(255,255,255,0.25)'}`,
                background: isDark ? 'rgba(5,28,26,0.04)' : 'rgba(255,255,255,0.06)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: isDark ? '#051c1a' : '#ffffff',
              }}
            >
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-smooth-fade"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', touchAction: 'none' }}
          onClick={() => {
            setIsProfileModalOpen(false);
            setIsConfirmDelete(false);
          }}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden animate-fadeIn"
            style={{
              backgroundColor: inv_cardBg,
              border: `1px solid ${inv_cardBorder}`,
              color: mTxt,
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
                    backgroundColor: isDark ? 'rgba(5,28,26,0.08)' : 'rgba(201,242,39,0.15)',
                    border: isDark ? '1.5px solid rgba(5,28,26,0.18)' : '1.5px solid rgba(201,242,39,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#051c1a' : '#c9f227',
                  }}
                >
                  <UserIcon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: mTxt }}>User Profile</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: mMuted }}>Account details & settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsConfirmDelete(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: mMuted }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Profile Info Cards */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${inv_cardDivide}`,
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name / Owner
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: mTxt }}>
                  {user.name || 'N/A'}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: inv_cardDivide }} />

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </span>
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px', wordBreak: 'break-all', color: mTxt }}>
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
                <p style={{ fontSize: '12px', color: mMuted, margin: '0 0 14px', lineHeight: 1.4 }}>
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
                      border: `1px solid ${inv_cardDivide}`,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
                      color: mTxt,
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

      {/* ══════════════════════════════
          BANK DETAILS EDITOR MODAL
          ══════════════════════════════ */}
      {isBankModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto animate-smooth-fade"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', touchAction: 'none' }}
          onClick={() => setIsBankModalOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden my-auto animate-smooth-pop"
            style={{
              backgroundColor: inv_cardBg,
              border: `1px solid ${inv_cardBorder}`,
              color: mTxt,
              maxHeight: '90vh',
              overflowY: 'auto',
              overflowX: 'hidden',
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
                    backgroundColor: isDark ? 'rgba(5,28,26,0.08)' : 'rgba(201,242,39,0.15)',
                    border: isDark ? '1.5px solid rgba(5,28,26,0.18)' : '1.5px solid rgba(201,242,39,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#051c1a' : '#c9f227',
                  }}
                >
                  <Landmark style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Bank Details &amp; UPI</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: txtMuted }}>Stored in database for A4 Invoices</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: mMuted }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBankDetails} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. STATE BANK OF INDIA"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${mInputBorder}`,
                    backgroundColor: mInputBg,
                    color: mTxt,
                    fontSize: '13px',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Account Number (Numbers Only)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })}
                  onKeyDown={(e) => {
                    // Prevent non-numeric keypresses except navigation/editing keys
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key) &&
                      !(e.ctrlKey || e.metaKey)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g. 41234567890 (9 to 18 numbers)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${mInputBorder}`,
                    backgroundColor: mInputBg,
                    color: mTxt,
                    fontSize: '13px',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11) })}
                    placeholder="e.g. SBIN0001234"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${mInputBorder}`,
                      backgroundColor: mInputBg,
                      color: mTxt,
                      fontSize: '13px',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                    placeholder="e.g. Dharmapuri Branch"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${mInputBorder}`,
                      backgroundColor: mInputBg,
                      color: mTxt,
                      fontSize: '13px',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: mMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value.replace(/[^a-zA-Z0-9.\-_@]/g, '').toLowerCase() })}
                  placeholder="e.g. owshika@sbi or 9445662637@paytm"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${mInputBorder}`,
                    backgroundColor: mInputBg,
                    color: mTxt,
                    fontSize: '13px',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {bankFormError && (
                <div style={{ padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', fontSize: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{bankFormError}</span>
                </div>
              )}

              {bankSaveSuccess && (
                <div style={{ padding: '10px', backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', color: '#4ade80', fontSize: '12px', textAlign: 'center', fontWeight: 700 }}>
                  ✓ Bank Details Validated &amp; Saved to Database!
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingBank}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#c9f227',
                  color: '#051c1a',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: isSavingBank ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(201,242,39,0.25)',
                }}
              >
                {isSavingBank ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
