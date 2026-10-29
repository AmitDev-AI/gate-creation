import { useTheme, type Theme } from '../hooks/useTheme';
import { cn } from '../lib/cn';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

const NEXT_THEME: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const ICON: Record<Theme, typeof SunIcon> = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next = NEXT_THEME[theme];
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[theme]}`}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition-colors',
        'hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10',
        className,
      )}
    >
      <Icon className="text-base" />
      <span className="hidden sm:inline">{LABEL[theme]}</span>
    </button>
  );
}
