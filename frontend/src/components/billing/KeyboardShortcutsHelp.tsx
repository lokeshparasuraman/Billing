import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-sky-400" />
            <span className="font-bold text-base tracking-wide">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Designed for ultra-fast billing without touching the mouse:
          </p>

          <div className="space-y-2">
            {shortcuts.map((sc, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <kbd className="px-2 py-1 bg-white font-mono font-bold text-sky-700 rounded shadow-sm border border-slate-200">
                  {sc.key}
                </kbd>
                <span className="text-slate-700 font-medium text-right max-w-[240px] leading-tight">
                  {sc.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
