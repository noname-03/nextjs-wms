'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  const body = window.document.body;
  const isDark = theme === 'dark';
  
  // Remove all theme classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(theme);
  body.classList.add(theme);
  
  // Also update data attribute as fallback
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  
  // Force CSS custom properties update for comprehensive theming
  if (isDark) {
    root.style.setProperty('--tw-bg-white', 'rgb(31 41 55)'); // gray-800
    root.style.setProperty('--tw-bg-gray-50', 'rgb(55 65 81)'); // gray-700
    root.style.setProperty('--tw-text-gray-900', 'rgb(243 244 246)'); // gray-100
    root.style.setProperty('--tw-border-gray-200', 'rgb(55 65 81)'); // gray-700
  } else {
    root.style.setProperty('--tw-bg-white', 'rgb(255 255 255)'); // pure white
    root.style.setProperty('--tw-bg-gray-50', 'rgb(249 250 251)'); // gray-50
    root.style.setProperty('--tw-text-gray-900', 'rgb(17 24 39)'); // gray-900
    root.style.setProperty('--tw-border-gray-200', 'rgb(229 231 235)'); // gray-200
  }
  
  // Force style recalculation on all elements
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = el.style.display; // Force style recalculation
    }
  });
  
  console.log('Applied theme:', theme, 'isDark:', isDark, 'HTML classes:', root.className, 'Body classes:', body.className);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemPreference;
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling from', theme, 'to', newTheme);
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}