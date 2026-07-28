import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navbar } from './components/common/Navbar';
import { BillingPage } from './pages/BillingPage';
import { InvoiceHistoryPage } from './pages/InvoiceHistoryPage';
import { ProductCatalogPage } from './pages/ProductCatalogPage';
import { AuthPage } from './pages/AuthPage';
import { KeyboardShortcutsHelp } from './components/billing/KeyboardShortcutsHelp';
import { ThemeProviderContext, useThemeMode } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useBillingStore } from './store/useBillingStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
  },
});

/* Helper component inside Router to handle reload redirection & unsaved warning */
const AppNavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const { rows } = useBillingStore();
  const initialChecked = React.useRef(false);

  useEffect(() => {
    if (!initialChecked.current) {
      initialChecked.current = true;
      if (window.location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasEnteredProducts = rows.some(
        (r) =>
          (r.name && r.name.trim() !== '') ||
          (r.partNumber && r.partNumber.trim() !== '') ||
          (typeof r.price === 'number' && r.price > 0)
      );

      if (hasEnteredProducts) {
        e.preventDefault();
        e.returnValue = 'You have unsaved product entries in your invoice. Do you want to reload?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [rows]);

  return null;
};

const MainDashboard: React.FC = () => {
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const { mode } = useThemeMode();

  return (
    <Router>
      <AppNavigationHandler />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: mode === 'dark' ? '#051c1a' : '#f4f5f7',
          color: mode === 'dark' ? '#ffffff' : '#0a0a0a',
          transition: 'background-color 0.2s, color 0.2s',
        }}
      >
        <Navbar onOpenShortcuts={() => setIsShortcutsHelpOpen(true)} />
        <main style={{ flex: 1, paddingTop: '64px' }}>
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
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { mode } = useThemeMode();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#c9f227' },
          secondary: { main: '#051c1a' },
          background: {
            default: mode === 'dark' ? '#051c1a' : '#f4f5f7',
            paper: mode === 'dark' ? '#0a2421' : '#f8f9fa',
          },
        },
        typography: {
          fontFamily: '"Space Grotesk","Outfit","Inter",sans-serif',
        },
      }),
    [mode]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Owshika Billing System...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {!user ? <AuthPage /> : <MainDashboard />}
    </ThemeProvider>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProviderContext>
        <AppContent />
      </ThemeProviderContext>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
