import React, { useEffect, useState } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import {
  ThemeContext,
  getSystemTheme,
  getInitialTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
  type ResolvedTheme,
} from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const initial = getInitialTheme();
    return initial === 'system' ? getSystemTheme() : initial;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage write failures (e.g. private browsing quota)
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // Sync resolved theme whenever theme mode changes or system preference changes
  useEffect(() => {
    const updateResolved = () => {
      const active = theme === 'system' ? getSystemTheme() : theme;
      setResolvedTheme(active);

      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(active);
      root.setAttribute('data-theme', active);
      root.style.colorScheme = active;
    };

    updateResolved();

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => {
        updateResolved();
      };

      mediaQuery.addEventListener('change', handleMediaChange);
      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    }
  }, [theme]);

  // Ant Design theme configuration synced with resolved theme
  const antdThemeConfig = {
    algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1677ff',
      borderRadius: 8,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      ...(resolvedTheme === 'dark'
        ? {
            colorBgBase: '#121212',
            colorBgContainer: '#1c1c1e',
            colorBgElevated: '#252528',
            colorBgLayout: '#121212',
            colorBorder: '#2e2e32',
            colorBorderSecondary: '#242426',
            colorText: '#f3f4f6',
            colorTextSecondary: '#9ca3af',
          }
        : {
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            colorBgLayout: '#f4f5f7',
            colorBorder: '#e5e7eb',
            colorBorderSecondary: '#f0f0f0',
            colorText: '#1f2937',
            colorTextSecondary: '#6b7280',
          }),
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <ConfigProvider theme={antdThemeConfig}>
        <AntdApp>
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
