import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Receipt, History, Package, Keyboard, Sun, Moon } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();

  const navItems = [
    { label: 'New Billing', path: '/', icon: Receipt },
    { label: 'Invoice History', path: '/history', icon: History },
    { label: 'Products', path: '/products', icon: Package },
  ];

  return (
    <nav className="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 dark:border-slate-850 sticky top-0 z-40 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-base sm:text-xl text-white shadow-lg shadow-sky-500/30">
              OE
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white block leading-tight">
                OWSHIKA
                <span className="hidden xs:inline"> ENTERPRISES</span>
              </span>
              <span className="text-[10px] sm:text-xs text-sky-400 font-medium tracking-wider uppercase block">
                Billing System
              </span>
            </div>
          </div>

          {/* Navigation Links & Controls */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-800 dark:bg-slate-900 text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white border border-slate-700 transition"
              title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {mode === 'light' ? (
                <>
                  <Moon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-amber-400 shrink-0" />
                  <span className="hidden md:inline ml-1.5">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-sky-400 shrink-0" />
                  <span className="hidden md:inline ml-1.5">Light</span>
                </>
              )}
            </button>

            {/* Keyboard Shortcuts Trigger Button */}
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 dark:bg-slate-900 text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white border border-slate-700 transition"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="hidden md:inline">Shortcuts</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
