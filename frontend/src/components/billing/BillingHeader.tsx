import React, { useEffect, useState } from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { useThemeMode } from '../../context/ThemeContext';
import { PaymentMode } from '../../types/billing';
import {
  Calendar as CalendarIcon, Hash, CreditCard, Banknote, QrCode, ShieldAlert,
  MapPin, FileCheck, Phone, Clock, ChevronLeft, ChevronRight, Edit3, Check, Building, Plus, Trash2,
  Truck, User, Navigation, Package, Mail
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

function getLocalDateString(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatGoogleDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

export const BillingHeader: React.FC = () => {
  const { header, setHeaderField, setTransportField, storeDetails, setStoreDetails } = useBillingStore();
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [storeForm, setStoreForm] = useState(storeDetails);
  const [phoneArray, setPhoneArray] = useState<string[]>(['']);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    setStoreForm(storeDetails);
    const list = (storeDetails.phone || '')
      .split(/,|\//)
      .map(p => p.replace(/\D/g, '').slice(-10))
      .filter(Boolean);
    setPhoneArray(list.length > 0 ? list : ['']);
    setPhoneError(null);
  }, [storeDetails]);

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    const activePhones = phoneArray.map(p => p.replace(/\D/g, '')).filter(Boolean);

    if (activePhones.length === 0) {
      setPhoneError('Please enter at least one 10-digit mobile number.');
      return;
    }

    for (let i = 0; i < activePhones.length; i++) {
      if (activePhones[i].length !== 10) {
        setPhoneError(`Mobile number #${i + 1} (${activePhones[i]}) is invalid. Must contain strictly 10 digits.`);
        return;
      }
    }

    const cleanedPhones = activePhones.map(p => `+91 ${p}`).join(', ');
    const updatedForm = { ...storeForm, phone: cleanedPhones };
    setStoreDetails(updatedForm);
    setIsEditingStore(false);
  };

  const handleAddPhone = () => {
    setPhoneArray([...phoneArray, '']);
    setPhoneError(null);
  };

  const handleRemovePhone = (index: number) => {
    setPhoneError(null);
    if (phoneArray.length <= 1) {
      setPhoneArray(['']);
      return;
    }
    setPhoneArray(phoneArray.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (index: number, val: string) => {
    setPhoneError(null);
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    const updated = [...phoneArray];
    updated[index] = digitsOnly;
    setPhoneArray(updated);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnightRollover = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = setTimeout(() => { setHeaderField('invoiceDate', getLocalDateString(new Date())); scheduleMidnightRollover(); }, nextMidnight.getTime() - now.getTime());
    };
    scheduleMidnightRollover();
    return () => { if (timer) clearTimeout(timer); };
  }, [setHeaderField]);

  const paymentModes: Array<{ id: PaymentMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'UPI', label: 'UPI', icon: QrCode },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'CREDIT', label: 'Credit', icon: ShieldAlert },
  ];

  const handleSetRelativeDate = (offsetDays: number) => {
    if (offsetDays === 0) {
      setHeaderField('invoiceDate', getLocalDateString(new Date()));
      return;
    }
    const dateStr = header.invoiceDate || getLocalDateString(new Date());
    const [year, month, day] = dateStr.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() + offsetDays);
    setHeaderField('invoiceDate', getLocalDateString(current));
  };

  const todayString = getLocalDateString();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const isToday = header.invoiceDate === todayString;

  /* Theme-aware tokens for the store card — inverted contrast */
  const cardBg       = isDark ? '#ebedf0'                     : '#051c1a';
  const cardBorder   = isDark ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.12)';
  const cardDivider  = isDark ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.10)';
  const cardText     = isDark ? 'rgba(5,28,26,0.75)'         : 'rgba(255,255,255,0.85)';
  const cardStrong   = isDark ? '#051c1a'                     : '#ffffff';
  const cardMuted    = isDark ? 'rgba(5,28,26,0.60)'         : 'rgba(255,255,255,0.75)';
  const inputBg      = isDark ? 'rgba(0,0,0,0.04)'           : 'rgba(255,255,255,0.06)';
  const inputBorder  = isDark ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.08)';

  /* BrandLogo: dark mode = dark teal text on white; light mode = white text on dark */
  const logoVariant = isDark ? 'dark' : 'white';

  /* Theme tokens for elements directly inside outer container (Bill Type bar) */
  const outerText       = isDark ? '#ffffff'                  : '#051c1a';
  const outerMuted      = isDark ? 'rgba(255,255,255,0.70)'      : 'rgba(5,28,26,0.75)';
  const btnInactiveBg   = isDark ? 'rgba(255,255,255,0.08)'      : 'rgba(5,28,26,0.06)';
  const btnInactiveText = isDark ? '#ffffff'                  : '#051c1a';

  /* Shared meta card style — inverted: dark teal in light, white in dark */
  const cardCls_meta = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
  };
  const cardTextStyle = { color: cardStrong };
  const cardMutedStyle = { color: cardMuted };

  return (
    <div className="bg-white dark:bg-[#051c1a] rounded-2xl border p-4 sm:p-5 space-y-4 shadow-sm" style={{ borderColor: cardBorder }} ref={null as any}>

      {/* ── Bill Type Selector Bar (Theme contrast fixed: 100% visible) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: outerMuted }}>
            Bill Type:
          </span>
          <div 
            className="relative inline-grid grid-cols-2 p-1.5 rounded-2xl w-64 sm:w-80 select-none overflow-hidden" 
            style={{ background: btnInactiveBg, border: `1px solid ${inputBorder}`, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)' }}
          >
            {/* Liquid Flowing Background Pill Indicator */}
            <div
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-[#c9f227] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_3px_10px_rgba(201,242,39,0.4)] z-0 ${
                header.billType === 'TRANSPORT' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />

            {/* Customer Bill Button */}
            <button
              type="button"
              onClick={() => setHeaderField('billType', 'CUSTOMER')}
              style={{ color: (header.billType === 'CUSTOMER' || !header.billType) ? '#051c1a' : btnInactiveText }}
              className="relative z-10 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-black transition-colors duration-300 border-0 focus:outline-none cursor-pointer w-full text-center"
            >
              <User className="h-4 w-4 shrink-0 transition-transform duration-300" />
              <span className="truncate">Customer Bill</span>
            </button>

            {/* Transport Bill Button */}
            <button
              type="button"
              onClick={() => setHeaderField('billType', 'TRANSPORT')}
              style={{ color: header.billType === 'TRANSPORT' ? '#051c1a' : btnInactiveText }}
              className="relative z-10 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-black transition-colors duration-300 border-0 focus:outline-none cursor-pointer w-full text-center"
            >
              <Truck className="h-4 w-4 shrink-0 transition-transform duration-300" />
              <span className="truncate">Transport Bill</span>
            </button>
          </div>
        </div>

        {header.billType === 'TRANSPORT' && (
          <span className="text-[11px] font-black px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <Truck className="h-4 w-4" /> Goods Transport / Waybill Mode
          </span>
        )}
      </div>

      {/* ── Store Details and Invoice Meta Grid (Equal Heights Left-to-Right) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">

        {/* Left: Store card — theme-aware (equal height matching right side) */}
        <div
          className="md:col-span-7 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full transition-colors"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, color: cardStrong }}
        >
          {!isEditingStore ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <BrandLogo storeName={storeDetails.storeName} size="lg" variant={logoVariant} />
                <button
                  type="button"
                  onClick={() => setIsEditingStore(true)}
                  style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition shrink-0 border-0"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit Store Details</span>
                </button>
              </div>

              <div className="mt-4 pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs" style={{ borderTop: `1px solid ${cardDivider}` }}>
                <div className="flex items-center space-x-2" style={{ color: cardText }}>
                  <FileCheck className="h-4 w-4 shrink-0" style={{ color: cardMuted }} />
                  <span>GSTIN: <strong className="font-mono font-extrabold" style={{ color: cardStrong }}>{storeDetails.gstin}</strong></span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: cardText }}>
                  <Phone className="h-4 w-4 shrink-0" style={{ color: cardMuted }} />
                  <span>Mob: <strong className="font-mono font-extrabold" style={{ color: cardStrong }}>{storeDetails.phone}</strong></span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: cardText }}>
                  <User className="h-4 w-4 shrink-0" style={{ color: cardMuted }} />
                  <span>Owner: <strong className="font-extrabold" style={{ color: cardStrong }}>{storeDetails.ownerName || 'C.Perumal'}</strong></span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: cardText }}>
                  <Mail className="h-4 w-4 shrink-0" style={{ color: cardMuted }} />
                  <span>Email: <strong className="font-mono font-extrabold" style={{ color: cardStrong }}>{storeDetails.email || 'owshikaentt@gmail.com'}</strong></span>
                </div>
                <div className="sm:col-span-2 flex items-start space-x-2 mt-0.5" style={{ color: cardMuted }}>
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: cardMuted }} />
                  <span className="font-medium leading-relaxed">{storeDetails.address}</span>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveStoreInfo} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2.5" style={{ borderBottom: `1px solid ${cardDivider}` }}>
                <span className="font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5" style={{ color: cardText }}>
                  <Building className="h-4 w-4" /> Edit Store Information
                </span>
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => setIsEditingStore(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition border-0"
                    style={{ background: inputBg, color: cardText }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
                    className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full font-extrabold text-xs shadow-sm transition border-0"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}>
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Details</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: cardMuted }}>Store Name *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl font-bold text-xs focus:outline-none"
                    style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: cardMuted }}>GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="33BAEPP2449B1Z3"
                    value={storeForm.gstin}
                    onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 rounded-xl font-bold text-xs focus:outline-none font-mono"
                    style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: cardMuted }}>Proprietor / Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. C.Perumal"
                    value={storeForm.ownerName || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl font-bold text-xs focus:outline-none"
                    style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: cardMuted }}>Store Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. owshikaentt@gmail.com"
                    value={storeForm.email || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl font-bold text-xs focus:outline-none font-mono"
                    style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: cardMuted }}>Shop Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop address..."
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl font-bold text-xs focus:outline-none"
                    style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                  />
                </div>

                {/* Multiple Mobile Numbers Section */}
                <div className="sm:col-span-2 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase" style={{ color: cardMuted }}>
                      Contact Mobile Numbers (Add / Remove)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPhone}
                      style={{ color: isDark ? '#c9f227' : '#15803d' }}
                      className="text-[11px] font-black flex items-center gap-1 hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Add Number
                    </button>
                  </div>

                  {phoneError && (
                    <div className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {phoneArray.map((p, idx) => {
                      const isInvalidLength = p.length > 0 && p.length < 10;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-extrabold shrink-0 flex items-center gap-1 select-none"
                              style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
                            >
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </div>

                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={10}
                              placeholder={`10-digit mobile number ${idx + 1}...`}
                              value={p}
                              onChange={(e) => handlePhoneChange(idx, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl font-mono font-bold text-xs focus:outline-none transition-colors"
                              style={
                                isInvalidLength
                                  ? { border: '1px solid rgba(244, 63, 94, 0.6)', background: 'rgba(244, 63, 94, 0.05)', color: cardStrong }
                                  : { background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }
                              }
                            />

                            {phoneArray.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhone(idx)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                                title="Remove this phone number"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {isInvalidLength && (
                            <div className="text-[10px] font-mono font-bold text-rose-400 pl-14">
                              ⚠️ Mobile number must contain strictly 10 digits ({p.length}/10 digits entered)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right: Invoice meta */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Invoice No */}
            <div className="rounded-2xl p-3 flex flex-col justify-between" style={cardCls_meta}>
              <label className="text-[11px] font-extrabold uppercase tracking-wider block mb-1 flex items-center gap-1" style={cardMutedStyle}>
                <Hash className="h-3.5 w-3.5" /> Invoice No
              </label>
              <input
                type="text"
                value={header.invoiceNumber}
                onChange={(e) => setHeaderField('invoiceNumber', e.target.value)}
                className="bg-transparent font-mono font-black text-base sm:text-lg w-full focus:outline-none"
                style={cardTextStyle}
              />
            </div>

            {/* Bill Date */}
            <div className="rounded-2xl p-3 flex flex-col justify-between" style={cardCls_meta}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1" style={cardMutedStyle}>
                  <CalendarIcon className="h-3.5 w-3.5" /> Bill Date
                </label>
                {isToday && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ border: `1px solid ${cardDivider}`, color: cardMuted, background: 'transparent' }}>
                    <Clock className="h-2.5 w-2.5" /> Today
                  </span>
                )}
              </div>
              <input
                type="date"
                value={header.invoiceDate}
                onChange={(e) => setHeaderField('invoiceDate', e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as any).showPicker?.();
                  } catch (err) {
                    // Ignore if showPicker is unsupported
                  }
                }}
                className={`bg-transparent px-0 py-1 text-xs sm:text-sm font-mono font-bold rounded-xl border-0 w-full focus:outline-none cursor-pointer ${isDark ? 'calendar-picker-dark' : 'calendar-picker-light'}`}
                style={cardTextStyle}
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold" style={cardMutedStyle}>{formatGoogleDateDisplay(header.invoiceDate)}</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleSetRelativeDate(-1)}
                    title="Previous day"
                    className="p-1 rounded-lg transition hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
                    style={cardMutedStyle}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRelativeDate(0)}
                    title="Reset to today"
                    className="px-1.5 py-0.5 text-[10px] font-extrabold rounded hover:underline active:scale-95"
                    style={cardMutedStyle}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRelativeDate(1)}
                    title="Next day"
                    className="p-1 rounded-lg transition hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
                    style={cardMutedStyle}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="p-3 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider block mb-2" style={cardMutedStyle}>
              Payment Mode:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {paymentModes.map((pm) => {
                const Icon = pm.icon;
                const isSelected = header.paymentMode === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setHeaderField('paymentMode', pm.id)}
                    style={isSelected
                      ? { backgroundColor: '#c9f227', color: '#051c1a', border: '1px solid transparent' }
                      : { background: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', color: cardMuted, border: `1px solid ${cardDivider}` }
                    }
                    className="flex items-center justify-center space-x-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all"
                    onMouseEnter={e => { if (isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                    onMouseLeave={e => { if (isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Transport Details (Smooth Liquid Expand Transition + Complete Addresses) ── */}
      <div
        className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          header.billType === 'TRANSPORT'
            ? 'max-h-[1200px] opacity-100 mt-4 border-t border-black/[0.06] dark:border-white/[0.06] pt-4 translate-y-0'
            : 'max-h-0 opacity-0 mt-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className="p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: cardDivider }}>
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: cardStrong }}>
              <Truck className="h-4 w-4" style={{ color: isDark ? '#c9f227' : '#15803d' }} /> Transport Details
            </span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Transport Bill
            </span>
          </div>

          {/* Top row: Simple Addresses (From & To) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase mb-1.5 flex items-center gap-1" style={{ color: cardMuted }}>
                📍 From Address *
              </label>
              <textarea
                rows={2}
                placeholder="Enter sender address..."
                value={header.transportDetails?.fromLocation ?? storeDetails.address ?? ''}
                onChange={(e) => setTransportField('fromLocation', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl font-medium text-xs focus:outline-none leading-relaxed custom-scrollbar resize-none"
                style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase mb-1.5 flex items-center gap-1" style={{ color: cardMuted }}>
                🏁 To Address *
              </label>
              <textarea
                rows={2}
                placeholder="Enter delivery address..."
                value={header.transportDetails?.toLocation || ''}
                onChange={(e) => setTransportField('toLocation', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl font-medium text-xs focus:outline-none leading-relaxed custom-scrollbar resize-none"
                style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
              />
            </div>
          </div>

          {/* Bottom row: Vehicle / LR No & Transporter Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase mb-1.5 flex items-center gap-1" style={{ color: cardMuted }}>
                🚚 Vehicle / LR No *
              </label>
              <input
                type="text"
                placeholder="e.g. KA-02-AB-1234 / LR-908"
                value={header.transportDetails?.vehicleNumber || ''}
                onChange={(e) => setTransportField('vehicleNumber', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 rounded-xl font-mono font-bold text-xs focus:outline-none"
                style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase mb-1.5 flex items-center gap-1" style={{ color: cardMuted }}>
                📦 Transporter Name
              </label>
              <input
                type="text"
                placeholder="e.g. VRL Logistics"
                value={header.transportDetails?.transporterName || ''}
                onChange={(e) => setTransportField('transporterName', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl font-bold text-xs focus:outline-none"
                style={{ background: inputBg, color: cardStrong, border: `1px solid ${inputBorder}` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
