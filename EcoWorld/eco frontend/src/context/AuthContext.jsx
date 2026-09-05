import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.data);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.data);
    return res.data;
  }

  async function register(name, email, password) {
    const res = await api.register(name, email, password);
    setToken(res.token);
    setUser(res.data);
    return res.data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
