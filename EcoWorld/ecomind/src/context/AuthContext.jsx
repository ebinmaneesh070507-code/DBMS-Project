import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  const loadMe = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch (err) {
      // Token expired/invalid — clear it silently and fall back to signed-out.
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // credential = the ID token string from Google Identity Services
  const loginWithGoogle = useCallback(async (credential) => {
    const result = await api.googleLogin(credential);
    tokenStore.set(result.token);
    setUser(result.data);
    return result;
  }, []);

  const chooseRole = useCallback(async (role) => {
    const updated = await api.setMyRole(role);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isResponder: user?.role === 'responder',
    isCitizen: user?.role === 'citizen',
    needsRoleChoice: !!user && !user.roleConfirmed,
    loginWithGoogle,
    chooseRole,
    logout,
    refresh: loadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
