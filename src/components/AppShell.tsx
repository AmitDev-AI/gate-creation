import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME, APP_VERSION } from '../lib/app';
import { cn } from '../lib/cn';
import { useOnline } from '../hooks/useOnline';
import { SkipLink } from './SkipLink';
import { ThemeToggle } from './ThemeToggle';
import { WifiIcon, WifiOffIcon } from './icons';

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-xl bg-ink-900 text-amber-500 dark:bg-ink-800"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
        <path d="M5.2 7.2h13.6v3.1H5.2z" fill="currentColor" />
        <path d="M7.9 10.3h2.6v7.5H7.9zm5.6 0h2.6v7.5h-2.6z" fill="currentColor" />
      </svg>
    </span>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-200/80 text-slate-900 dark:bg-white/10 dark:text-white'
      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-white/5',
  );

function NetworkStatus() {
  const online = useOnline();
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
      aria-live="polite"
    >
      {online ? (
        <WifiIcon className="text-sm text-emerald-600 dark:text-emerald-400" />
      ) : (
        <WifiOffIcon className="text-sm text-amber-600 dark:text-amber-400" />
      )}
      {online ? 'Online' : 'Offline — everything still works'}
    </span>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/85 backdrop-blur dark:border-white/10 dark:bg-ink-950/85">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2.5 rounded-lg" aria-label={`${APP_NAME} home`}>
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight sm:text-base">{APP_NAME}</span>
          </NavLink>

          <div className="flex items-center gap-1">
            <nav aria-label="Main" className="flex items-center gap-0.5">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
            </nav>
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-5 dark:border-white/10">
        <div className="container-page flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
          <p>
            {APP_NAME} v{APP_VERSION} · Free, no account, your data stays on this device.
          </p>
          <NetworkStatus />
        </div>
      </footer>
    </div>
  );
}
