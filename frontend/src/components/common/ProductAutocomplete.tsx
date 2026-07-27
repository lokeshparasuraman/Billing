import React, { useState, useEffect, useRef, useId } from 'react';
import { Product } from '../../types/billing';
import { searchProducts } from '../../services/api';
import { Search } from 'lucide-react';

interface ProductAutocompleteProps {
  value: string;
  fieldMode: 'partNumber' | 'name';
  placeholder?: string;
  onSelectProduct: (product: Product) => void;
  onChangeValue: (val: string) => void;
  onKeyDownCustom?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

export const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
  value,
  fieldMode,
  placeholder,
  onSelectProduct,
  onChangeValue,
  onKeyDownCustom,
  inputRef,
  className = '',
}) => {
  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    let isMounted = true;
    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchProducts(value);
        if (isMounted) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        console.error('Error fetching autocomplete:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        onSelectProduct(suggestions[highlightedIndex]);
        setIsOpen(false);
        return;
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
    }

    if (onKeyDownCustom) {
      onKeyDownCustom(e);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (fieldMode === 'partNumber' ? 'e.g. HW-BOLT-M8' : 'Search product name...')}
          className={`w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-mono ${className}`}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />
        {isLoading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin h-3 w-3 border-2 border-sky-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs"
        >
          {suggestions.map((product, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={product.id}
                role="option"
                aria-selected={isHighlighted}
                onClick={() => {
                  onSelectProduct(product);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`p-2 cursor-pointer transition-colors flex justify-between items-center ${
                  isHighlighted ? 'bg-sky-50 text-sky-900 border-l-4 border-sky-600' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="font-semibold font-mono text-sky-700 flex items-center gap-1.5">
                    <span>{product.partNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans">
                      HSN: {product.hsn}
                    </span>
                  </div>
                  <div className="text-slate-900 font-medium line-clamp-1">{product.name}</div>
                </div>

                <div className="text-right ml-2 flex-shrink-0">
                  <div className="font-bold text-emerald-600">₹{product.price.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-600">
                    GST {product.gst}% | {product.unit}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
