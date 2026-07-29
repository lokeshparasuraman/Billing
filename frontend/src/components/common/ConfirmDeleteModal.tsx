import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useThemeTokens } from '../../hooks/useThemeTokens';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  const t = useThemeTokens();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        style={{
          background: t.inv_cardBg,
          color: t.inv_textStrong,
          border: `1px solid ${t.inv_cardBorder}`,
        }}
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 scale-100 p-6 space-y-5"
      >
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight" style={{ color: t.inv_textStrong }}>
                {title}
              </h3>
              <p className="text-xs font-semibold" style={{ color: t.inv_textMuted }}>
                Confirmation Required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{ color: t.inv_textMuted }}
            className="p-1.5 rounded-lg transition hover:opacity-80 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Message */}
        <div className="space-y-2 text-sm leading-relaxed">
          <p style={{ color: t.inv_textMuted }}>
            {message}
          </p>
          {itemName && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 font-mono font-bold text-xs text-red-600 dark:text-red-400 break-all">
              {itemName}
            </div>
          )}
          <p className="text-xs font-bold text-red-500/90 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>This action cannot be undone.</span>
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.inv_textStrong,
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50 border-0 cursor-pointer"
          >
            {isDeleting ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
