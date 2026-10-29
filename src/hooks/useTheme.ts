import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '../lib/app';

export type Theme = 'light' | 'dark' | 'system';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Storage can be blocked in private mode; the default is fine.
  }
  return 'system';
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

let currentTheme: Theme = readStoredTheme();

if (typeof document !== 'undefined') {
  applyTheme(currentTheme);
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme('system');
  });
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persisting the preference is best-effort; the current session still updates.
  }
  applyTheme(theme);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => 'system' as Theme,
  );
  return { theme, setTheme };
}
