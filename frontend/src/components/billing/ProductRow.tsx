import React, { useRef } from 'react';
import { InvoiceItemRow, Product } from '../../types/billing';
import { ProductAutocomplete } from '../common/ProductAutocomplete';
import { updateProductPrice } from '../../services/api';
import { Trash2, Wrench, Package } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeContext';

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
  index, row, isLastRow, onUpdate, onSelectProduct, onRemove, onAddRowNeeded, onNavigateRow,
}) => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* ─── Theme tokens: card is INVERTED (white in dark, dark-teal in light) ─── */
  const txtStrong = isDark ? '#051c1a'                : '#ffffff';
  const txtMuted  = isDark ? 'rgba(5,28,26,0.55)'    : 'rgba(255,255,255,0.60)';
  const rowBg     = isDark ? 'rgba(0,0,0,0.02)'      : 'rgba(255,255,255,0.02)';
  const rowHover  = isDark ? 'rgba(0,0,0,0.04)'      : 'rgba(255,255,255,0.05)';
  const divider   = isDark ? 'rgba(0,0,0,0.07)'      : 'rgba(255,255,255,0.07)';

  /* Input styles that are visible against the inverted card */
  const inputStyle: React.CSSProperties = {
    background : isDark ? 'rgba(0,0,0,0.05)'       : 'rgba(255,255,255,0.10)',
    color      : txtStrong,
    border     : `1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.18)'}`,
    borderRadius: '6px',
    padding    : '5px 8px',
    fontSize   : '11px',
    fontFamily : 'monospace',
    fontWeight : 500,
    width      : '100%',
    outline    : 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const tdStyle: React.CSSProperties = {
    verticalAlign: 'top',
    padding: '7px 4px',
    borderBottom: `1px solid ${divider}`,
  };

  const partNumRef   = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const qtyRef       = useRef<HTMLInputElement>(null);
  const priceRef     = useRef<HTMLInputElement>(null);

  const isLabourOrSpares =
    row.itemType === 'LABOUR' || row.itemType === 'SPARES' ||
    row.partNumber === 'LABOUR' || row.partNumber === 'SERVICE' || row.partNumber === 'MISC-SPARES';

  const isInclusive = row.taxMode === 'INCLUSIVE';

  const toggleItemType = () => {
    if (isLabourOrSpares) {
      onUpdate({ itemType: 'PRODUCT', partNumber: '', unit: 'PCS', gstRate: 18 });
    } else {
      onUpdate({ itemType: 'LABOUR', partNumber: 'LABOUR', hsn: 'N/A', gstRate: 0, unit: 'JOB', name: row.name || 'Labour Charges' });
    }
  };

  const toggleTaxMode = () => onUpdate({ taxMode: isInclusive ? 'EXCLUSIVE' : 'INCLUSIVE' });

  const handleKeyDownCommon = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentField: 'partNumber' | 'name' | 'hsn' | 'quantity' | 'price'
  ) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); onNavigateRow('down'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); onNavigateRow('up'); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'partNumber' || currentField === 'name') {
        qtyRef.current?.focus(); qtyRef.current?.select();
      } else if (currentField === 'quantity') {
        priceRef.current?.focus(); priceRef.current?.select();
      } else if (currentField === 'price') {
        if (isLastRow) onAddRowNeeded(); else onNavigateRow('down');
      }
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
    onUpdate({ price: val });
    if (!isLabourOrSpares && typeof val === 'number' && !isNaN(val) && (row.productId || row.partNumber)) {
      updateProductPrice(row.productId || row.partNumber, val);
    }
  };

  /* ════════════════════════════════════════════════════
     MOBILE CARD  (hidden at md+)
  ════════════════════════════════════════════════════ */
  const mobileCard = (
    <div
      className="md:hidden rounded-xl p-3 mb-2 space-y-2.5 border"
      style={{
        background: isDark ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
        borderColor: divider,
      }}
    >
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button" onClick={toggleItemType}
            className="p-1 rounded transition"
            style={{ color: txtMuted, background: 'rgba(128,128,128,0.1)', border: `1px solid ${divider}` }}
          >
            {isLabourOrSpares ? <Wrench className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
          </button>
          <span className="text-xs font-extrabold" style={{ color: txtMuted }}>#{index + 1}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
            style={{ color: txtMuted, border: `1px solid ${divider}`, background: 'rgba(128,128,128,0.08)' }}>
            {isLabourOrSpares ? 'Labour' : 'Product'}
          </span>
        </div>
        <button type="button" onClick={onRemove}
          className="p-1.5 rounded text-red-400 hover:text-red-600 transition">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Part + HSN */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>Part / Code</label>
          {isLabourOrSpares ? (
            <input type="text" value={row.partNumber}
              onChange={e => onUpdate({ partNumber: e.target.value.toUpperCase() })}
              placeholder="Code" style={inputStyle} />
          ) : (
            <ProductAutocomplete
              inputRef={partNumRef} value={row.partNumber} fieldMode="partNumber"
              onSelectProduct={onSelectProduct}
              onChangeValue={val => onUpdate({ partNumber: val })}
              onKeyDownCustom={e => handleKeyDownCommon(e, 'partNumber')}
            />
          )}
        </div>
        <div>
          <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>HSN Code</label>
          <input type="text" value={row.hsn}
            onChange={e => onUpdate({ hsn: e.target.value })}
            placeholder="N/A" style={{ ...inputStyle, textAlign: 'center' }} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>
          {isLabourOrSpares ? 'Labour Description' : 'Product Name'}
        </label>
        {isLabourOrSpares ? (
          <input ref={nameInputRef} type="text" value={row.name}
            onChange={e => onUpdate({ name: e.target.value })}
            placeholder="Type work or spares description..." style={inputStyle} />
        ) : (
          <ProductAutocomplete value={row.name} fieldMode="name" placeholder="Type product name..."
            onSelectProduct={onSelectProduct}
            onChangeValue={val => onUpdate({ name: val })}
            onKeyDownCustom={e => handleKeyDownCommon(e, 'name')}
          />
        )}
      </div>

      {/* Qty + Price */}
      {isLabourOrSpares ? (
        <div>
          <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>Price (₹)</label>
          <input ref={priceRef} type="number" min="0" step="any" value={row.price}
            onChange={handlePriceChange} placeholder="0.00"
            style={{ ...inputStyle, textAlign: 'right' }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>Qty</label>
            <input ref={qtyRef} type="number" min="1" step="any" value={row.quantity}
              onChange={e => onUpdate({ quantity: e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)) })}
              style={{ ...inputStyle, textAlign: 'right' }} />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>Price (₹)</label>
            <input ref={priceRef} type="number" min="0" step="any" value={row.price}
              onChange={handlePriceChange} placeholder="0.00"
              style={{ ...inputStyle, textAlign: 'right' }} />
            <button type="button" onClick={toggleTaxMode}
              className="mt-1 w-full text-[9px] font-bold py-1 px-1 rounded uppercase tracking-wider transition"
              style={{
                background: isInclusive ? 'rgba(128,128,128,0.12)' : 'transparent',
                color: txtMuted,
                border: `1px solid ${divider}`,
              }}>
              {isInclusive ? 'Incl GST' : 'Excl GST'}
            </button>
          </div>
        </div>
      )}

      {/* GST + computed */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>GST %</label>
          {isLabourOrSpares ? (
            <div className="text-[10px] font-bold font-mono text-center py-1.5 rounded"
              style={{ color: txtMuted, border: `1px solid ${divider}`, background: 'rgba(128,128,128,0.06)' }}>
              0%
            </div>
          ) : (
            <select value={row.gstRate}
              onChange={e => onUpdate({ gstRate: parseFloat(e.target.value) })}
              style={selectStyle}>
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          )}
        </div>
        <div className="text-center">
          <div className="text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>GST Amt</div>
          <div className="text-xs font-mono font-semibold pt-1" style={{ color: txtMuted }}>
            ₹{row.gstAmount.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-extrabold uppercase mb-1" style={{ color: txtMuted }}>Total</div>
          <div className="text-sm font-mono font-black pt-0.5" style={{ color: txtStrong }}>
            ₹{row.total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     DESKTOP TABLE ROW  (shown at md+)
  ════════════════════════════════════════════════════ */
  const desktopRow = (
    <tr
      className="hidden md:table-row transition-colors"
      style={{ background: isLabourOrSpares ? rowHover : rowBg }}
      onMouseEnter={e => { if (!isLabourOrSpares) (e.currentTarget as HTMLElement).style.background = rowHover; }}
      onMouseLeave={e => { if (!isLabourOrSpares) (e.currentTarget as HTMLElement).style.background = rowBg; }}
    >
      {/* S.No & Type Toggle */}
      <td style={{ ...tdStyle, textAlign: 'center', width: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <button
            type="button" onClick={toggleItemType}
            className="p-0.5 rounded transition"
            style={{ color: txtMuted, background: 'none' }}
            title={isLabourOrSpares ? 'Labour/Spares (click to switch)' : 'Product (click to switch)'}
          >
            {isLabourOrSpares ? <Wrench className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
          </button>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: txtMuted }}>{index + 1}</span>
        </div>
      </td>

      {/* Part Number */}
      <td style={{ ...tdStyle, minWidth: 120 }}>
        {isLabourOrSpares ? (
          <input type="text" value={row.partNumber}
            onChange={e => onUpdate({ partNumber: e.target.value.toUpperCase() })}
            placeholder="Code" style={inputStyle} />
        ) : (
          <ProductAutocomplete inputRef={partNumRef} value={row.partNumber} fieldMode="partNumber"
            onSelectProduct={onSelectProduct}
            onChangeValue={val => onUpdate({ partNumber: val })}
            onKeyDownCustom={e => handleKeyDownCommon(e, 'partNumber')}
          />
        )}
      </td>

      {/* Description */}
      <td style={{ ...tdStyle, minWidth: 180 }}>
        {isLabourOrSpares ? (
          <input ref={nameInputRef} type="text" value={row.name}
            onChange={e => onUpdate({ name: e.target.value })}
            onKeyDown={e => handleKeyDownCommon(e, 'name')}
            placeholder="Type work or spares description..."
            style={inputStyle} />
        ) : (
          <ProductAutocomplete value={row.name} fieldMode="name" placeholder="Type product name..."
            onSelectProduct={onSelectProduct}
            onChangeValue={val => onUpdate({ name: val })}
            onKeyDownCustom={e => handleKeyDownCommon(e, 'name')}
          />
        )}
      </td>

      {/* HSN */}
      <td style={{ ...tdStyle, width: 80 }}>
        <input type="text" value={row.hsn}
          onChange={e => onUpdate({ hsn: e.target.value })}
          onKeyDown={e => handleKeyDownCommon(e, 'hsn')}
          placeholder="N/A"
          style={{ ...inputStyle, textAlign: 'center' }} />
      </td>

      {/* Qty */}
      <td style={{ ...tdStyle, width: 72 }}>
        {isLabourOrSpares ? (
          <div style={{ textAlign: 'center', fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
            padding: '5px 4px', borderRadius: 6, color: txtMuted,
            border: `1px solid ${divider}`, background: 'rgba(128,128,128,0.06)' }}>
            1
          </div>
        ) : (
          <input ref={qtyRef} type="number" min="1" step="any" value={row.quantity}
            onChange={e => onUpdate({ quantity: e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)) })}
            onKeyDown={e => handleKeyDownCommon(e, 'quantity')}
            style={{ ...inputStyle, textAlign: 'right' }} />
        )}
      </td>

      {/* Price + Tax toggle */}
      <td style={{ ...tdStyle, width: 120 }}>
        <input ref={priceRef} type="number" min="0" step="any" value={row.price}
          onChange={handlePriceChange}
          onKeyDown={e => handleKeyDownCommon(e, 'price')}
          placeholder="0.00"
          style={{ ...inputStyle, textAlign: 'right' }} />
        {!isLabourOrSpares && (
          <button type="button" onClick={toggleTaxMode}
            className="mt-1 w-full text-[9px] font-bold py-0.5 px-1 rounded uppercase tracking-wider transition"
            style={{
              background: isInclusive ? 'rgba(128,128,128,0.12)' : 'transparent',
              color: txtMuted,
              border: `1px solid ${divider}`,
            }}>
            {isInclusive ? 'Incl GST' : 'Excl GST'}
          </button>
        )}
      </td>

      {/* GST % */}
      <td style={{ ...tdStyle, width: 100 }}>
        {isLabourOrSpares ? (
          <div style={{ textAlign: 'center', fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
            padding: '6px 4px', borderRadius: 6, color: txtMuted,
            border: `1px solid ${divider}`, background: 'rgba(128,128,128,0.06)' }}>
            0% (No GST)
          </div>
        ) : (
          <select value={row.gstRate}
            onChange={e => onUpdate({ gstRate: parseFloat(e.target.value) })}
            style={selectStyle}>
            <option value={0}>0% GST</option>
            <option value={5}>5% GST</option>
            <option value={12}>12% GST</option>
            <option value={18}>18% GST</option>
            <option value={28}>28% GST</option>
          </select>
        )}
      </td>

      {/* GST Amount */}
      <td style={{ ...tdStyle, textAlign: 'right', width: 90, fontFamily: 'monospace', fontSize: 12, color: txtMuted }}>
        ₹{row.gstAmount.toFixed(2)}
      </td>

      {/* Line Total */}
      <td style={{ ...tdStyle, textAlign: 'right', width: 100, fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: txtStrong }}>
        ₹{row.total.toFixed(2)}
      </td>

      {/* Delete */}
      <td style={{ ...tdStyle, textAlign: 'center', width: 36 }}>
        <button type="button" onClick={onRemove}
          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          title="Delete Row">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <>
      {mobileCard}
      {desktopRow}
    </>
  );
};
