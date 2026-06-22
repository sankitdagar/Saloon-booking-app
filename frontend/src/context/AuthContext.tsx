import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: object) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      clearSession();
      return;
    }

    try {
      const { data } = await authApi.me();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    validateSession().finally(() => setLoading(false));
  }, [validateSession]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email: email.toLowerCase().trim(), password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (formData: object) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearSession();
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    setUser(data.data);
    localStorage.setItem('user', JSON.stringify(data.data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
