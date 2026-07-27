import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navbar } from './components/common/Navbar';
import { BillingPage } from './pages/BillingPage';
import { InvoiceHistoryPage } from './pages/InvoiceHistoryPage';
import { ProductCatalogPage } from './pages/ProductCatalogPage';
import { KeyboardShortcutsHelp } from './components/billing/KeyboardShortcutsHelp';
import { ThemeProviderContext, useThemeMode } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

const AppContent: React.FC = () => {
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const { mode } = useThemeMode();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: {
            main: '#0284c7',
          },
          secondary: {
            main: '#0f172a',
          },
          background: {
            default: mode === 'dark' ? '#020617' : '#f8fafc',
            paper: mode === 'dark' ? '#0f172a' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
          <Navbar onOpenShortcuts={() => setIsShortcutsHelpOpen(true)} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<BillingPage />} />
              <Route path="/history" element={<InvoiceHistoryPage />} />
              <Route path="/products" element={<ProductCatalogPage />} />
            </Routes>
          </main>
        </div>
        <KeyboardShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
        />
      </Router>
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderContext>
        <AppContent />
      </ThemeProviderContext>
    </QueryClientProvider>
  );
};

export default App;
