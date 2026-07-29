import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { useThemeTokens } from '../../hooks/useThemeTokens';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const {
    inv_cardBg: modalBg,
    inv_cardBorder: cardBorder,
    inv_cardDivide: cardDivide,
    inv_textStrong: textStrong,
    inv_textMuted: textMuted,
    inv_inputBg: itemBg,
    inv_inputBorder: kbdBg,
    accent,
    accentHover,
  } = useThemeTokens();

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Enter', description: 'Moves focus to next field. On last field of row, adds a new row.' },
    { key: 'Arrow Up / Down', description: 'Navigates focus vertically between table rows.' },
    { key: 'Ctrl + Shift + A', description: 'Instantly appends a new empty product row.' },
    { key: 'Ctrl + P', description: 'Saves invoice and opens official A4 Print Preview.' },
    { key: 'Tab', description: 'Standard natural browser focus navigation.' },
    { key: 'Escape', description: 'Dismisses autocomplete suggestion popovers or modals.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-smooth-fade">
      <div
        style={{ background: modalBg, border: `1px solid ${cardBorder}` }}
        className="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-smooth-pop text-white"
      >
        {/* Header */}
        <div
          style={{ borderBottom: `1px solid ${cardDivide}` }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-[#c9f227]" />
            <span className="font-extrabold text-base tracking-wide" style={{ color: textStrong }}>
              Keyboard Shortcuts
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ color: textMuted }}
            className="p-1 rounded-lg transition hover:opacity-80 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold" style={{ color: textMuted }}>
            Designed for ultra-fast billing without touching the mouse:
          </p>

          <div className="space-y-2">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                style={{ background: itemBg, border: `1px solid ${cardDivide}` }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs"
              >
                <kbd
                  style={{ background: kbdBg, border: `1px solid ${cardBorder}`, color: textStrong }}
                  className="px-2 py-1 font-mono font-black rounded text-[11px]"
                >
                  {sc.key}
                </kbd>
                <span className="font-semibold text-right max-w-[240px] leading-tight" style={{ color: textStrong }}>
                  {sc.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ borderTop: `1px solid ${cardDivide}` }}
          className="px-5 py-3 text-right"
        >
          <button
            onClick={onClose}
            style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
            className="px-6 py-2 rounded-full text-xs font-black transition-all border-0 shadow-sm active:scale-[0.98] focus:outline-none"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
