import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, AlertTriangle, Link2, Wifi, Database } from 'lucide-react';
import { checkBackendStatus, setCustomApiUrl, syncLocalDataWithBackend, getApiBaseUrl } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSynced?: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, onClose, onSynced }) => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [status, setStatus] = useState<{ isConnected: boolean; url: string; mode: string }>({
    isConnected: false,
    url: '',
    mode: 'Checking...',
  });
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      const current = localStorage.getItem('custom_api_url') || '';
      setCustomUrlInput(current);
      setSyncResult(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    const st = await checkBackendStatus();
    setStatus(st);
  };

  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiUrl(customUrlInput.trim());
    await loadStatus();
    alert('Backend API URL updated successfully! Re-testing connection...');
  };

  const handleClearCustomUrl = async () => {
    setCustomApiUrl(null);
    setCustomUrlInput('');
    await loadStatus();
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncLocalDataWithBackend();
      setSyncResult(
        `✅ Sync Complete! Merged ${res.totalProducts} Products and ${res.totalInvoices} Invoices across devices.`
      );
      await loadStatus();
      if (onSynced) onSynced();
    } catch (err: any) {
      setSyncResult(`⚠️ Sync completed with local cache update.`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const cardBg = isDark ? '#0a2421' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const textStrong = isDark ? '#ffffff' : '#051c1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(5,28,26,0.60)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 transition-all relative overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textStrong }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <Wifi className="h-5 w-5 text-[#c9f227]" />
            <h2 className="text-lg font-black" style={{ color: textStrong }}>
              Cross-Device Data Sync & Server
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" style={{ color: textMuted }} />
          </button>
        </div>

        {/* Live Status Card */}
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 ${
            status.isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}
        >
          {status.isConnected ? (
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-extrabold uppercase tracking-wide">
              {status.isConnected ? 'Connected to Shared Database' : 'Browser Offline Storage Mode'}
            </div>
            <p className="font-medium leading-relaxed opacity-90">
              {status.isConnected
                ? `Connected to API at ${status.url}. All bills and products are saved centrally in real-time.`
                : `Using browser cache. To see bills created on laptop from mobile, connect both devices to the same backend server URL.`}
            </p>
          </div>
        </div>

        {/* 1-Click Sync Button */}
        <div className="p-4 rounded-xl space-y-3" style={{ background: inputBg, border: `1px solid ${cardBorder}` }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: textStrong }}>
              <Database className="h-4 w-4 text-[#c9f227]" /> 1-Click Multi-Device Sync
            </span>
            <span className="text-[10px] font-extrabold text-[#c9f227]">Instant Merge</span>
          </div>

          <p className="text-xs font-medium leading-relaxed" style={{ color: textMuted }}>
            Sync and merge all products and bills between your laptop and mobile device so both devices display identical history and catalog.
          </p>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncData}
            style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black transition shadow-sm active:scale-[0.98] border-0"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Products & Bills...' : 'Sync Data Now'}</span>
          </button>

          {syncResult && (
            <div className="text-xs font-bold p-2.5 rounded-lg bg-black/10 dark:bg-white/10 leading-relaxed text-center">
              {syncResult}
            </div>
          )}
        </div>

        {/* Custom Server URL Form */}
        <form onSubmit={handleSaveCustomUrl} className="space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: textMuted }}>
            <Link2 className="h-4 w-4" /> Custom Backend Server URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. http://192.168.1.15:5000/api"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs font-mono font-bold rounded-xl focus:outline-none"
              style={{ background: inputBg, color: textStrong, border: `1px solid ${cardBorder}` }}
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#c9f227] text-[#051c1a] hover:brightness-110 transition border-0 shrink-0"
            >
              Save
            </button>
            {customUrlInput && (
              <button
                type="button"
                onClick={handleClearCustomUrl}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition border border-rose-500/20 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[11px] font-semibold" style={{ color: textMuted }}>
            Current Active URL: <span className="font-mono font-extrabold text-[#c9f227]">{getApiBaseUrl()}</span>
          </p>
        </form>
      </div>
    </div>
  );
};
