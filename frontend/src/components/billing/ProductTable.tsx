import React, { useState } from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { ProductRow } from './ProductRow';
import { Plus, HelpCircle, Wrench, ChevronDown } from 'lucide-react';

export const ProductTable: React.FC = () => {
  const {
    rows,
    addRow,
    addLabourRow,
    removeRow,
    updateRow,
    selectProductForRow,
    setActiveCell,
  } = useBillingStore();

  const [isLabourMenuOpen, setIsLabourMenuOpen] = useState(false);

  const handleNavigateRow = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < rows.length) {
      setActiveCell(targetIndex, 'partNumber');
    }
  };

  const labourPresets = [
    { label: 'General Labour Work', name: 'General Labour Charges' },
    { label: 'Lathe Machining & Turning', name: 'Lathe Machining & Turning Work' },
    { label: 'Installation & Fitting', name: 'Installation & Fitting Charges' },
    { label: 'Custom Welding & Fabrication', name: 'Custom Welding & Fabrication Fees' },
    { label: 'Transportation & Freight', name: 'Transportation & Freight Charges' },
  ];

  const handleSelectPreset = (name: string) => {
    addLabourRow(name);
    setIsLabourMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden transition-colors">
      {/* Table Section Header */}
      <div className="bg-slate-800 dark:bg-slate-950 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 dark:border-slate-850 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm uppercase tracking-wider text-slate-200">
            Product & Services Items Entry
          </span>
          <span className="bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            {rows.length} {rows.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-300">
          <span className="hidden lg:inline-flex items-center gap-1 text-sky-300 font-mono">
            <HelpCircle className="h-3.5 w-3.5" /> Press <kbd className="px-1.5 py-0.5 bg-slate-700 dark:bg-slate-800 rounded text-white border border-slate-600">Enter</kbd> to move fields
          </span>

          {/* Quick Labour / Service Dropdown Menu */}
          <div className="relative">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => addLabourRow()}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-l-md text-xs font-bold flex items-center space-x-1 transition"
                title="Add Labour Work or Service Charge row"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>+ Labour / Service</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLabourMenuOpen(!isLabourMenuOpen)}
                className="bg-amber-700 hover:bg-amber-600 text-white px-1.5 py-1 rounded-r-md border-l border-amber-800 transition"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {isLabourMenuOpen && (
              <ul className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-700">
                <li className="px-3 py-1.5 font-bold text-[10px] uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40">
                  Quick Labour Presets:
                </li>
                {labourPresets.map((preset, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectPreset(preset.name)}
                    className="px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-700 cursor-pointer font-medium flex items-center justify-between"
                  >
                    <span>{preset.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">SAC 9987</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1 shadow transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Hardware Item</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <th className="py-2.5 px-2 text-center w-10">#</th>
              <th className="py-2.5 px-2 min-w-[130px]">Part / Code</th>
              <th className="py-2.5 px-2 min-w-[200px]">Product / Labour Description</th>
              <th className="py-2.5 px-2 text-center w-20">HSN / SAC</th>
              <th className="py-2.5 px-2 text-right w-20">Qty</th>
              <th className="py-2.5 px-2 text-center w-20">Unit</th>
              <th className="py-2.5 px-2 text-right w-32">Price (₹) & Mode</th>
              <th className="py-2.5 px-2 text-right w-16">Disc %</th>
              <th className="py-2.5 px-2 text-center w-24">GST % (C+S)</th>
              <th className="py-2.5 px-2 text-right w-24">GST Amt</th>
              <th className="py-2.5 px-2 text-right w-28">Total (₹)</th>
              <th className="py-2.5 px-2 text-center w-10">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {rows.map((row, idx) => (
              <ProductRow
                key={row.rowId}
                index={idx}
                row={row}
                isLastRow={idx === rows.length - 1}
                onUpdate={(updates) => updateRow(idx, updates)}
                onSelectProduct={(product) => selectProductForRow(idx, product)}
                onRemove={() => removeRow(idx)}
                onAddRowNeeded={addRow}
                onNavigateRow={(dir) => handleNavigateRow(idx, dir)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap justify-between items-center text-xs gap-2">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={addRow}
            className="text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 font-bold flex items-center space-x-1 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Hardware Item</span>
          </button>

          <button
            type="button"
            onClick={() => addLabourRow()}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-bold flex items-center space-x-1 transition border-l border-slate-300 dark:border-slate-700 pl-3"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>+ Add Labour / Service Charge</span>
          </button>
        </div>

        <span className="text-slate-500 dark:text-slate-400 font-mono">
          Tip: You can add both hardware parts and labour charges in the same invoice.
        </span>
      </div>
    </div>
  );
};
