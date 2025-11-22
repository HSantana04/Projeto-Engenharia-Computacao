import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import userService from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    auth_id: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, bio?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const navigate = useNavigate();

  // Carrega sessão inicial e configura listener
  useEffect(() => {
    let subscription: any;

    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userData = await userService.getCurrentUser(session.user.id);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error('[Auth] Erro ao carregar sessão inicial:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }

      // Listener de mudanças de auth
      subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('[AuthListener] Event:', _event, 'Session:', session);
        if (session?.user) {
          try {
            const userData = await userService.getCurrentUser(session.user.id);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              navigate('/dashboard', { replace: true });
            }
          } catch (err) {
            console.error('[AuthListener] Erro ao buscar usuário:', err);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          navigate('/', { replace: true });
        }
      });
    };

    loadSession();

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Listener vai lidar com redirect
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await userService.createUser(data.user.id, email, name);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, bio?: string) => {
    if (!user) throw new Error('No user logged in');
    const updated = await userService.updateUserProfile(user.id, { name, email: user.email, bio });
    if (updated) setUser({ ...user, name: updated.name });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
