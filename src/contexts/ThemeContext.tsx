import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('app:theme') : null
  if (stored === 'light' || stored === 'dark') return stored
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-light', 'theme-dark')
      document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app:theme', theme)
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggle: () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')),
    setTheme,
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


