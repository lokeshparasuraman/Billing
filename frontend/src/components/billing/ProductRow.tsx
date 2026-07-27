import React, { useRef } from 'react';
import { InvoiceItemRow, Product } from '../../types/billing';
import { ProductAutocomplete } from '../common/ProductAutocomplete';
import { Trash2, Wrench, Package } from 'lucide-react';

interface ProductRowProps {
  index: number;
  row: InvoiceItemRow;
  isLastRow: boolean;
  onUpdate: (updates: Partial<InvoiceItemRow>) => void;
  onSelectProduct: (product: Product) => void;
  onRemove: () => void;
  onAddRowNeeded: () => void;
  onNavigateRow: (direction: 'up' | 'down') => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  index,
  row,
  isLastRow,
  onUpdate,
  onSelectProduct,
  onRemove,
  onAddRowNeeded,
  onNavigateRow,
}) => {
  const partNumRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);

  const isLabour = row.itemType === 'LABOUR' || row.partNumber === 'LABOUR' || row.partNumber === 'SERVICE';
  const isInclusive = row.taxMode === 'INCLUSIVE';

  const toggleItemType = () => {
    if (isLabour) {
      onUpdate({
        itemType: 'PRODUCT',
        partNumber: '',
        unit: 'PCS',
        gstRate: 18,
      });
    } else {
      onUpdate({
        itemType: 'LABOUR',
        partNumber: 'LABOUR',
        hsn: 'N/A',
        gstRate: 0,
        unit: 'JOB',
        name: row.name || 'Labour Charges',
      });
    }
  };

  const toggleTaxMode = () => {
    onUpdate({
      taxMode: isInclusive ? 'EXCLUSIVE' : 'INCLUSIVE',
    });
  };

  // Common KeyDown handler for field-to-field Enter & Arrow navigation
  const handleKeyDownCommon = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentField: 'partNumber' | 'name' | 'hsn' | 'quantity' | 'price' | 'discount'
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onNavigateRow('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onNavigateRow('up');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'partNumber' || currentField === 'name') {
        qtyRef.current?.focus();
        qtyRef.current?.select();
      } else if (currentField === 'quantity') {
        priceRef.current?.focus();
        priceRef.current?.select();
      } else if (currentField === 'price') {
        discountRef.current?.focus();
        discountRef.current?.select();
      } else if (currentField === 'discount') {
        if (isLastRow) {
          onAddRowNeeded();
        } else {
          onNavigateRow('down');
        }
      }
    }
  };

  const cgst = (row.gstRate / 2).toFixed(1);
  const sgst = (row.gstRate / 2).toFixed(1);

  return (
    <tr
      className={`transition-colors border-b border-slate-200 dark:border-slate-800 ${
        isLabour
          ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
          : 'hover:bg-sky-50/50 dark:hover:bg-slate-800/60'
      }`}
    >
      {/* S.No & Type Toggle */}
      <td className="px-2 py-1.5 text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center space-x-1">
          <button
            type="button"
            onClick={toggleItemType}
            className={`p-0.5 rounded transition ${
              isLabour
                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900'
                : 'text-slate-400 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isLabour ? 'Labour Charge (Click to switch to Product)' : 'Hardware Product (Click to switch to Labour)'}
          >
            {isLabour ? <Wrench className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
          </button>
          <span>{index + 1}</span>
        </div>
      </td>

      {/* Part Number / Service Code */}
      <td className="px-1.5 py-1.5 min-w-[130px]">
        {isLabour ? (
          <div className="flex items-center space-x-1">
            <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase border border-amber-400/40 shrink-0">
              LABOUR
            </span>
            <input
              type="text"
              value={row.partNumber}
              onChange={(e) => onUpdate({ partNumber: e.target.value.toUpperCase() })}
              placeholder="Code"
              className="w-full px-1.5 py-1 text-xs font-mono font-bold rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        ) : (
          <ProductAutocomplete
            inputRef={partNumRef}
            value={row.partNumber}
            fieldMode="partNumber"
            onSelectProduct={onSelectProduct}
            onChangeValue={(val) => onUpdate({ partNumber: val })}
            onKeyDownCustom={(e) => handleKeyDownCommon(e, 'partNumber')}
          />
        )}
      </td>

      {/* Product Description / Labour Details */}
      <td className="px-1.5 py-1.5 min-w-[200px]">
        {isLabour ? (
          <input
            ref={nameInputRef}
            type="text"
            value={row.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onKeyDown={(e) => handleKeyDownCommon(e, 'name')}
            placeholder="Type labour work or service description..."
            className="w-full px-2 py-1.5 text-xs font-medium rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        ) : (
          <ProductAutocomplete
            value={row.name}
            fieldMode="name"
            placeholder="Type product name..."
            onSelectProduct={onSelectProduct}
            onChangeValue={(val) => onUpdate({ name: val })}
            onKeyDownCustom={(e) => handleKeyDownCommon(e, 'name')}
          />
        )}
      </td>

      {/* Editable HSN / SAC Code */}
      <td className="px-1.5 py-1.5 w-20">
        <input
          type="text"
          value={row.hsn}
          onChange={(e) => onUpdate({ hsn: e.target.value.trim() })}
          onKeyDown={(e) => handleKeyDownCommon(e, 'hsn')}
          placeholder="HSN/SAC"
          className="w-full px-1.5 py-1.5 text-xs text-center font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
          title="Editable HSN or SAC code"
        />
      </td>

      {/* Quantity / Units */}
      <td className="px-1.5 py-1.5 w-20">
        <input
          ref={qtyRef}
          type="number"
          min="1"
          step="any"
          value={row.quantity}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
            onUpdate({ quantity: val });
          }}
          onKeyDown={(e) => handleKeyDownCommon(e, 'quantity')}
          className="w-full px-2 py-1.5 text-xs text-right font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </td>

      {/* Editable Unit */}
      <td className="px-1.5 py-1.5 w-20">
        <input
          type="text"
          value={row.unit}
          onChange={(e) => onUpdate({ unit: e.target.value.toUpperCase() })}
          placeholder={isLabour ? 'JOB' : 'PCS'}
          className="w-full px-1.5 py-1.5 text-xs text-center font-mono uppercase bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700"
        />
      </td>

      {/* Price Input & Tax Inclusive/Exclusive Toggle */}
      <td className="px-1.5 py-1.5 w-32">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <input
              ref={priceRef}
              type="number"
              min="0"
              step="any"
              value={row.price}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                onUpdate({ price: val });
              }}
              onKeyDown={(e) => handleKeyDownCommon(e, 'price')}
              placeholder="0.00"
              className="w-full px-2 py-1.5 text-xs text-right font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          {/* Inclusive / Exclusive Tax Toggle Button (Hardware Products Only) */}
          {!isLabour && (
            <button
              type="button"
              onClick={toggleTaxMode}
              className={`w-full text-[9px] font-bold py-0.5 px-1 rounded uppercase tracking-wider transition ${
                isInclusive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
              }`}
              title="Click to toggle between Tax Inclusive (Owner overall price) and Tax Exclusive"
            >
              {isInclusive ? 'Incl GST (Overall)' : 'Excl GST'}
            </button>
          )}
        </div>
      </td>

      {/* Discount % */}
      <td className="px-1.5 py-1.5 w-16">
        <input
          ref={discountRef}
          type="number"
          min="0"
          max="100"
          step="any"
          value={row.discount}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : Math.max(0, Math.min(100, parseFloat(e.target.value)));
            onUpdate({ discount: val });
          }}
          onKeyDown={(e) => handleKeyDownCommon(e, 'discount')}
          placeholder="0%"
          className="w-full px-1.5 py-1.5 text-xs text-right font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition"
        />
      </td>

      {/* GST % Column */}
      <td className="px-1.5 py-1.5 w-24">
        <div className="space-y-1 text-center">
          {isLabour ? (
            <div className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 select-none">
              0% (No GST)
            </div>
          ) : (
            <>
              <select
                value={row.gstRate}
                onChange={(e) => onUpdate({ gstRate: parseFloat(e.target.value) })}
                className="w-full px-1 py-1 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
              >
                <option value={0}>0% GST</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
              {row.gstRate > 0 && (
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  C:{cgst}% + S:{sgst}%
                </div>
              )}
            </>
          )}
        </div>
      </td>

      {/* CGST & SGST Amounts Breakdown */}
      <td className="px-2 py-1.5 text-right font-mono text-[11px] text-slate-600 dark:text-slate-300 w-24">
        <div>₹{row.gstAmount.toFixed(2)}</div>
        {row.gstAmount > 0 && (
          <div className="text-[9px] text-slate-400">
            C:₹{(row.gstAmount / 2).toFixed(2)}
          </div>
        )}
      </td>

      {/* Line Total Amount */}
      <td className="px-2 py-1.5 text-right font-mono text-xs font-bold text-sky-900 dark:text-sky-400 w-28 bg-slate-50/50 dark:bg-slate-950/40">
        ₹{row.total.toFixed(2)}
      </td>

      {/* Delete Action */}
      <td className="px-1.5 py-1.5 text-center w-10">
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          title="Delete Row"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};
