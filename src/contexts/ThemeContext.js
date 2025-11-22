import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const ThemeContext = createContext(undefined);
function getInitialTheme() {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('app:theme') : null;
    if (stored === 'light' || stored === 'dark')
        return stored;
    if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }
    return 'light';
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
        }
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('app:theme', theme);
        }
    }, [theme]);
    const value = useMemo(() => ({
        theme,
        toggle: () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')),
        setTheme,
    }), [theme]);
    return (_jsx(ThemeContext.Provider, { value: value, children: children }));
}
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
