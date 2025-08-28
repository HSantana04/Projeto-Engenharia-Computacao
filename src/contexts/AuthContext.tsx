import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('finansmartai_token');
    const storedUser = localStorage.getItem('finansmartai_user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string) => {
    // Ajuste para seu backend: endpoint e estrutura de retorno
    // Exemplo esperado: { token: string, user: { id, name, email } }
    if (email === 'demo@finansmart.ai' && password === '123456') {
      const data = { token: 'dev-token', user: { id: '1', name: 'Dev User', email } };
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('finansmartai_token', data.token);
      localStorage.setItem('finansmartai_user', JSON.stringify(data.user));
      return;
    }
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('finansmartai_token', data.token);
    localStorage.setItem('finansmartai_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finansmartai_token');
    localStorage.removeItem('finansmartai_user');
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
