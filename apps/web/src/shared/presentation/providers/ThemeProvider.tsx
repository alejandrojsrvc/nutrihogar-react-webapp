import { useEffect, useState, type PropsWithChildren } from 'react';

import { ThemeContext, type ThemePreference } from './ThemeContext';

const THEME_STORAGE_KEY = 'nutrihogar-theme';

function getStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
  } catch {
    return 'system';
  }
}

function prefersDarkTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function resolveTheme(preference: ThemePreference) {
  return preference === 'system'
    ? prefersDarkTheme()
      ? 'dark'
      : 'light'
    : preference;
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#000000' : '#2f7d5a');
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] =
    useState<ThemePreference>(getStoredPreference);
  const theme = resolveTheme(preference);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(resolveTheme('system'));
    mediaQuery.addEventListener?.('change', handleChange);

    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, [preference]);

  function updatePreference(nextPreference: ThemePreference) {
    setPreference(nextPreference);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // The theme still applies when storage is unavailable.
    }
  }

  return (
    <ThemeContext
      value={{ preference, theme, setPreference: updatePreference }}
    >
      {children}
    </ThemeContext>
  );
}
