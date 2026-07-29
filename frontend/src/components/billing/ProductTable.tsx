import React, { useState } from 'react';
import { useThemeTokens } from '../../hooks/useThemeTokens';
import { useBillingStore } from '../../store/useBillingStore';
import { ProductRow } from './ProductRow';
import { Plus, HelpCircle, Wrench, ChevronDown, PackageCheck, Trash2, IndianRupee } from 'lucide-react';
import { InvoiceItemRow } from '../../types/billing';
import { sanitizePriceInput, handlePriceKeyDown } from '../../utils/calculations';

/* ─── Inline editable row for Labour / Misc sub-sections ─── */
interface ServiceRowProps {
  row: InvoiceItemRow;
  index: number;
  sectionLabel: string;
  onUpdate: (updates: Partial<InvoiceItemRow>) => void;
  onRemove: () => void;
  cardBg: string;
  cardBorder: string;
  textStrong: string;
  textMuted: string;
}

const ServiceRow: React.FC<ServiceRowProps> = ({
  row, index, sectionLabel, onUpdate, onRemove,
  cardBg, cardBorder, textStrong, textMuted,
}) => {
  return (
    <div
      className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-3 py-2 rounded-xl border transition group min-w-0 overflow-hidden"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      {/* Index & Name Input */}
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <span className="text-[11px] font-mono font-bold w-4 shrink-0 text-center" style={{ color: textMuted }}>
          {index + 1}
        </span>
        <input
          type="text"
          value={row.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder={`${sectionLabel} description...`}
          className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none min-w-0"
          style={{ color: textStrong }}
        />
      </div>

      {/* Price Input, Total & Delete Action */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <div className="flex items-center gap-1">
          <IndianRupee className="h-3 w-3 shrink-0" style={{ color: textMuted }} />
          <input
            type="text" inputMode="decimal"
            value={row.price === 0 || row.price === '' ? '' : row.price}
            onKeyDown={handlePriceKeyDown}
            onChange={e => {
              const clean = sanitizePriceInput(e.target.value);
              onUpdate({ price: clean === '' ? '' : Math.max(0, parseFloat(clean) || 0) });
            }}
            placeholder="0.00"
            className="w-20 sm:w-24 text-right text-xs font-mono font-bold rounded-md px-2 py-1 focus:outline-none"
            style={{ background: 'rgba(128,128,128,0.08)', border: `1px solid ${cardBorder}`, color: textStrong }}
          />
        </div>

        <span className="text-xs font-mono font-black min-w-[50px] text-right" style={{ color: textStrong }}>
          ₹{(Number(row.price || 0)).toFixed(2)}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Collapsible section ─── */
interface ServiceSectionProps {
  title: string;
  icon: React.ReactNode;
  rows: { row: InvoiceItemRow; globalIndex: number }[];
  onAdd: () => void;
  onUpdate: (gi: number, updates: Partial<InvoiceItemRow>) => void;
  onRemove: (gi: number) => void;
  cardBg: string;
  cardBorder: string;
  textStrong: string;
  textMuted: string;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  title, icon, rows, onAdd, onUpdate, onRemove,
  cardBg, cardBorder, textStrong, textMuted,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cardBorder}` }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none transition"
        style={{ background: 'rgba(128,128,128,0.06)' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: textMuted }}>{icon}</span>
          <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: textMuted }}>{title}</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(128,128,128,0.1)', border: `1px solid ${cardBorder}`, color: textMuted }}>
            {rows.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onAdd(); if (!open) setOpen(true); }}
            style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border-0 transition"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
          >
            <Plus className="h-3 w-3" /> Add
          </button>
          <ChevronDown
            className="h-4 w-4 transition-transform"
            style={{ color: textMuted, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          />
        </div>
      </div>

      {open && (
        <div className="p-2 space-y-1.5" style={{ background: 'rgba(128,128,128,0.03)' }}>
          {rows.length === 0 ? (
            <div
              className="text-center py-4 text-xs cursor-pointer transition"
              style={{ color: textMuted }}
              onClick={onAdd}
            >
              Click to add a {title.toLowerCase()} entry
            </div>
          ) : (
            rows.map(({ row, globalIndex }, localIdx) => (
              <ServiceRow
                key={row.rowId}
                row={row}
                index={localIdx}
                sectionLabel={title}
                onUpdate={updates => onUpdate(globalIndex, updates)}
                onRemove={() => onRemove(globalIndex)}
                cardBg={cardBg}
                cardBorder={cardBorder}
                textStrong={textStrong}
                textMuted={textMuted}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════
   MAIN PRODUCT TABLE
   ════════════════════════════════════ */
export const ProductTable: React.FC = () => {
  const { isDark,
    inv_cardBg: cardBg, inv_cardBorder: cardBorder,
    inv_textStrong: textStrong, inv_textMuted: textMuted,
  } = useThemeTokens();

  const {
    rows, addRow, addLabourRow, addMiscSparesRow,
    removeRow, updateRow, selectProductForRow, setActiveCell,
  } = useBillingStore();

  const handleNavigateRow = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < rows.length) setActiveCell(targetIndex, 'partNumber');
  };

  const productRows = rows.map((r, i) => ({ row: r, globalIndex: i })).filter(({ row }) =>
    row.itemType !== 'LABOUR' && row.itemType !== 'SPARES' &&
    row.partNumber !== 'LABOUR' && row.partNumber !== 'SERVICE' && row.partNumber !== 'MISC-SPARES'
  );
  const labourRows = rows.map((r, i) => ({ row: r, globalIndex: i })).filter(({ row }) =>
    row.itemType === 'LABOUR' || row.partNumber === 'LABOUR' || row.partNumber === 'SERVICE'
  );
  const miscRows = rows.map((r, i) => ({ row: r, globalIndex: i })).filter(({ row }) =>
    row.itemType === 'SPARES' || row.partNumber === 'MISC-SPARES'
  );

  return (
    <div
      className="rounded-2xl mb-4 overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      {/* ── Header bar ── */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${cardBorder}`, background: 'rgba(128,128,128,0.04)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider" style={{ color: textStrong }}>
            Product & Service Items Entry
          </span>
          <span
            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
            style={{ border: `1px solid ${cardBorder}`, color: textMuted, background: 'rgba(128,128,128,0.08)' }}
          >
            {rows.length} {rows.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono" style={{ color: textMuted }}>
            <HelpCircle className="h-3.5 w-3.5" /> Press
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(128,128,128,0.1)', border: `1px solid ${cardBorder}`, color: textMuted }}
            >Enter</kbd>
            to move fields
          </span>

          <button
            type="button" onClick={addRow}
            style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
            className="font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1 border-0 shadow-sm active:scale-[0.98] transition-all"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
          >
            <Plus className="h-4 w-4" /><span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ── Mobile cards (below md breakpoint) ── */}
      <div className="block md:hidden p-3 space-y-0">
        {productRows.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: textMuted }}>
            No products added yet. Click <strong style={{ color: textStrong }}>Add Item</strong> to begin.
          </div>
        ) : (
          productRows.map(({ row, globalIndex }, localIdx) => (
            <ProductRow
              key={row.rowId}
              index={localIdx}
              row={row}
              isLastRow={localIdx === productRows.length - 1}
              onUpdate={updates => updateRow(globalIndex, updates)}
              onSelectProduct={product => selectProductForRow(globalIndex, product)}
              onRemove={() => removeRow(globalIndex)}
              onAddRowNeeded={addRow}
              onNavigateRow={dir => handleNavigateRow(globalIndex, dir)}
            />
          ))
        )}
      </div>

      {/* ── Desktop table (md+ breakpoint) ── */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" style={{ minWidth: 780 }}>
          <thead>
            <tr style={{ background: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', borderBottom: `1px solid ${cardBorder}` }}>
              {[
                { label: '#',                      align: 'center', w: 40  },
                { label: 'Part / Code',             align: 'left',   w: 110 },
                { label: 'Product / Labour Desc',   align: 'left',   w: null },
                { label: 'HSN',                     align: 'center', w: 70  },
                { label: 'Qty',                     align: 'center', w: 64  },
                { label: 'Price (₹)',               align: 'right',  w: 110 },
                { label: 'GST %',                   align: 'center', w: 90  },
                { label: 'GST Amt',                 align: 'right',  w: 80  },
                { label: 'Total (₹)',               align: 'right',  w: 90  },
                { label: '',                        align: 'center', w: 36  },
              ].map(({ label, align, w }, i) => (
                <th key={i} style={{
                  padding: '10px 4px',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: textMuted, textAlign: align as any,
                  width: w ?? undefined,
                }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-sm" style={{ color: textMuted }}>
                  No products added yet. Click <strong style={{ color: textStrong }}>Add Item</strong> to begin.
                </td>
              </tr>
            ) : (
              productRows.map(({ row, globalIndex }, localIdx) => (
                <ProductRow
                  key={row.rowId}
                  index={localIdx}
                  row={row}
                  isLastRow={localIdx === productRows.length - 1}
                  onUpdate={updates => updateRow(globalIndex, updates)}
                  onSelectProduct={product => selectProductForRow(globalIndex, product)}
                  onRemove={() => removeRow(globalIndex)}
                  onAddRowNeeded={addRow}
                  onNavigateRow={dir => handleNavigateRow(globalIndex, dir)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Labour & Misc sections ── */}
      <div className="p-3 space-y-3" style={{ borderTop: `1px solid ${cardBorder}` }}>
        <ServiceSection
          title="Labour & Service Charges"
          icon={<Wrench className="h-3.5 w-3.5" />}
          rows={labourRows}
          onAdd={() => addLabourRow()}
          onUpdate={(gi, updates) => updateRow(gi, updates)}
          onRemove={gi => removeRow(gi)}
          cardBg={cardBg}
          cardBorder={cardBorder}
          textStrong={textStrong}
          textMuted={textMuted}
        />
        <ServiceSection
          title="Miscellaneous Spares"
          icon={<PackageCheck className="h-3.5 w-3.5" />}
          rows={miscRows}
          onAdd={() => addMiscSparesRow()}
          onUpdate={(gi, updates) => updateRow(gi, updates)}
          onRemove={gi => removeRow(gi)}
          cardBg={cardBg}
          cardBorder={cardBorder}
          textStrong={textStrong}
          textMuted={textMuted}
        />
      </div>
    </div>
  );
};
