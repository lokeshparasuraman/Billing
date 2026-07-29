import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { loginApi, registerApi, getMeApi, setAuthToken, deleteAccountApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'owshika_auth_token';
const USER_KEY = 'owshika_user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    return null;
  });

  // Always false initially if user & token are cached, ensuring 0ms instant page render with NO loading screen!
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthInBackground = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const me = await getMeApi();
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        } catch (error: any) {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            console.warn('Session expired or invalid, logging out:', error);
            logout();
          }
        }
      }
    };

    checkAuthInBackground();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await registerApi(email, password, name);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  };

  const deleteAccount = async () => {
    await deleteAccountApi();
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
