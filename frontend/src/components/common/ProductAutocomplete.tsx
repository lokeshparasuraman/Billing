import React, { useState, useEffect, useRef, useId } from 'react';
import { Product } from '../../types/billing';
import { searchProducts } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

interface ProductAutocompleteProps {
  value: string;
  fieldMode: 'partNumber' | 'name';
  placeholder?: string;
  onSelectProduct: (product: Product) => void;
  onChangeValue: (val: string) => void;
  onKeyDownCustom?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  inputStyle?: React.CSSProperties;
}

export const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
  value, fieldMode, placeholder, onSelectProduct, onChangeValue,
  onKeyDownCustom, inputRef, className = '', inputStyle,
}) => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* Inverted card theme tokens */
  const inStyle: React.CSSProperties = inputStyle ?? {
    background    : isDark ? 'rgba(0,0,0,0.05)'        : 'rgba(255,255,255,0.10)',
    color         : isDark ? '#051c1a'                  : '#ffffff',
    border        : `1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.18)'}`,
    borderRadius  : '6px',
    padding       : '5px 8px',
    fontSize      : '11px',
    fontFamily    : 'monospace',
    fontWeight    : 500,
    width         : '100%',
    outline       : 'none',
  };

  const dropBg     = isDark ? '#f8f8f8'                : '#051c1a';
  const dropBorder = isDark ? 'rgba(0,0,0,0.10)'       : 'rgba(255,255,255,0.12)';
  const dropDivide = isDark ? 'rgba(0,0,0,0.06)'       : 'rgba(255,255,255,0.06)';
  const itemNorm   = isDark ? '#051c1a'                : '#ffffff';
  const itemMuted  = isDark ? 'rgba(5,28,26,0.55)'    : 'rgba(255,255,255,0.60)';
  const itemHover  = isDark ? 'rgba(0,0,0,0.06)'      : 'rgba(255,255,255,0.08)';
  const accent     = isDark ? '#15803d' : '#c9f227';

  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value || value.trim().length === 0) { setSuggestions([]); setIsOpen(false); return; }
    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchProducts(value);
        if (isMounted) { setSuggestions(results); setIsOpen(results.length > 0); setHighlightedIndex(-1); }
      } catch (err) { console.error('Autocomplete error:', err); }
      finally { if (isMounted) setIsLoading(false); }
    }, 120);
    return () => { isMounted = false; clearTimeout(handler); };
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(p => p < suggestions.length - 1 ? p + 1 : 0); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlightedIndex(p => p > 0 ? p - 1 : suggestions.length - 1); return; }
      if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); onSelectProduct(suggestions[highlightedIndex]); setIsOpen(false); return; }
      if (e.key === 'Escape') { setIsOpen(false); return; }
    }
    onKeyDownCustom?.(e);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChangeValue(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (fieldMode === 'partNumber' ? 'e.g. HW-BOLT-M8' : 'Type product name...')}
          style={inStyle}
          className={className}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />
        {isLoading && (
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <div className="animate-spin" style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${accent}`, borderTopColor: 'transparent' }} />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute', zIndex: 60, left: 0, right: 0, top: 'calc(100% + 4px)',
            background: dropBg, border: `1px solid ${dropBorder}`,
            borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
            maxHeight: 220, overflowY: 'auto', padding: '4px',
          }}
        >
          {suggestions.map((product, idx) => {
            const isHL = idx === highlightedIndex;
            return (
              <li
                key={product.id}
                role="option"
                aria-selected={isHL}
                onClick={() => { onSelectProduct(product); setIsOpen(false); }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '8px 10px', borderRadius: '7px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: isHL ? itemHover : 'transparent',
                  borderLeft: isHL ? `3px solid ${accent}` : '3px solid transparent',
                  marginBottom: idx < suggestions.length - 1 ? 1 : 0,
                  borderBottom: `1px solid ${dropDivide}`,
                }}
              >
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: isHL ? accent : itemNorm, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{product.partNumber}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(128,128,128,0.10)', border: `1px solid ${dropDivide}`, color: itemMuted, fontFamily: 'sans-serif' }}>
                      HSN: {product.hsn}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: itemMuted, marginTop: 2 }}>{product.name}</div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: isHL ? accent : itemNorm }}>₹{product.price.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: itemMuted }}>GST {product.gst}%</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
