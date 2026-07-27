import React, { useState, useEffect } from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { PaymentMode, Customer } from '../../types/billing';
import { searchCustomers } from '../../services/api';
import { Building2, Calendar, Hash, User, Phone, MapPin, CreditCard, Banknote, QrCode, ShieldAlert } from 'lucide-react';

export const BillingHeader: React.FC = () => {
  const { header, setHeaderField } = useBillingStore();
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showCustDropdown, setShowCustDropdown] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!header.customerName || header.customerName.trim().length < 2) {
      setCustomerSuggestions([]);
      setShowCustDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const list = await searchCustomers(header.customerName);
        if (isMounted) {
          setCustomerSuggestions(list);
          setShowCustDropdown(list.length > 0);
        }
      } catch (err) {
        console.error(err);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [header.customerName]);

  const selectCustomer = (cust: Customer) => {
    setHeaderField('customerName', cust.name);
    if (cust.phone) setHeaderField('customerPhone', cust.phone);
    if (cust.address) setHeaderField('customerAddress', cust.address);
    setShowCustDropdown(false);
  };

  const paymentModes: Array<{ id: PaymentMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'UPI', label: 'UPI', icon: QrCode },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'CREDIT', label: 'Credit', icon: ShieldAlert },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-4 transition-colors">
      {/* Top Title Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-wide">
            OWSHIKA ENTERPRISES
          </span>
          <span className="text-xs bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
            Tax Invoice Module
          </span>
        </div>

        {/* Invoice Meta: Number & Date */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Hash className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Inv No:</span>
            <input
              type="text"
              value={header.invoiceNumber}
              onChange={(e) => setHeaderField('invoiceNumber', e.target.value)}
              className="bg-transparent font-mono font-bold text-sm text-sky-700 dark:text-sky-400 w-32 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date:</span>
            <input
              type="date"
              value={header.invoiceDate}
              onChange={(e) => setHeaderField('invoiceDate', e.target.value)}
              className="bg-transparent font-medium text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Customer Info & Payment Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Customer Name */}
        <div className="relative md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> Customer Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={header.customerName}
            onChange={(e) => setHeaderField('customerName', e.target.value)}
            placeholder="Type customer or business name..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-medium"
            required
          />
          {showCustDropdown && customerSuggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {customerSuggestions.map((cust) => (
                <li
                  key={cust.id}
                  onClick={() => selectCustomer(cust)}
                  className="p-2 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                >
                  <div className="font-bold text-sky-900 dark:text-sky-300">{cust.name}</div>
                  {cust.phone && <div className="text-[11px] text-slate-500 dark:text-slate-400">{cust.phone}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Customer Phone */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> Customer Mobile
          </label>
          <input
            type="text"
            value={header.customerPhone}
            onChange={(e) => setHeaderField('customerPhone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          />
        </div>

        {/* Customer Address */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> Customer Address
          </label>
          <input
            type="text"
            value={header.customerAddress}
            onChange={(e) => setHeaderField('customerAddress', e.target.value)}
            placeholder="Street address, City, Pincode"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          />
        </div>

        {/* Payment Mode Selector Bar */}
        <div className="md:col-span-12 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Payment Mode:
          </span>
          <div className="flex items-center space-x-2">
            {paymentModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = header.paymentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setHeaderField('paymentMode', mode.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300 dark:ring-sky-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
