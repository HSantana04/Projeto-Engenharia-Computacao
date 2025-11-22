import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

// ============================================================================
// TIPOS
// ============================================================================

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========== RECUPERAR DO LOCALSTORAGE NA INICIALIZAÇÃO ==========
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔄 Inicializando autenticação...');
        
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          console.log('✅ Token e usuário encontrados no localStorage');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          console.log('❌ Nenhum token ou usuário encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao recuperar autenticação:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        // IMPORTANTE: Marcar como carregado APÓS recuperar tudo
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ========== LOGIN ==========
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Fazendo login...');
      
      const { data } = await api.post('/Auth/login', {
        email,
        password
      });

      console.log('✅ Login bem-sucedido');

      setToken(data.accessToken);
      setUser(data.user);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    }
  };

  // ========== REGISTER ==========
  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    try {
      console.log('📝 Registrando novo usuário...');
      
      const { data } = await api.post('/Auth/register', {
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });

      console.log('✅ Registro bem-sucedido');

      setToken(data.accessToken);
      setUser(data.user);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('❌ Erro ao registrar:', error);
      throw error;
    }
  };

  // ========== LOGOUT ==========
  const logout = (): void => {
    console.log('👋 Fazendo logout...');
    
    setUser(null);
    setToken(null);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    
    console.log('✅ Logout completo');
  };

  // ========== VALOR DO CONTEXTO ==========
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout
    }),
    [user, token, isLoading]
  );

  console.log('📊 Estado Auth:', {
    isLoading,
    isAuthenticated: Boolean(token && user),
    user: user?.email,
    token: token ? '✅ Tem token' : '❌ Sem token'
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}