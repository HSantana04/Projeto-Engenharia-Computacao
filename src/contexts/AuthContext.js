import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import userService from '../services/userService';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    // Carrega sessão inicial (sem redirect)
    useEffect(() => {
        const loadSession = async () => {
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const userData = await userService.getCurrentUser(session.user.id);
                    if (userData) {
                        setUser(userData);
                        setIsAuthenticated(true);
                    }
                }
            }
            catch {
                setUser(null);
                setIsAuthenticated(false);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, []);
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
        return data; // A LoginPage faz o redirect
    };
    const signup = async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error)
            throw error;
        if (data.user) {
            await userService.createUser(data.user.id, email, name);
        }
    };
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
    };
    const updateProfile = async (name, bio) => {
        if (!user)
            throw new Error("No user logged in");
        const updated = await userService.updateUserProfile(user.id, { name, email: user.email, bio });
        if (updated)
            setUser({ ...user, name: updated.name });
    };
    return (_jsx(AuthContext.Provider, { value: {
            isAuthenticated,
            isLoading,
            user,
            login,
            signup,
            logout,
            updateProfile
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
