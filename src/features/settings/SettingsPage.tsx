import { useState } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { MonitorIcon, MoonIcon, RefreshIcon, SunIcon, TrashIcon } from '../../components/icons';
import { useStorageReport } from '../../hooks/useStorageReport';
import { useTheme, type Theme } from '../../hooks/useTheme';
import { APP_NAME, APP_VERSION } from '../../lib/app';
import { formatBytes } from '../../lib/format';
import { clearOfflineCaches } from '../../lib/storage';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string; hint: string; Icon: typeof SunIcon }> =
  [
    { value: 'light', label: 'Light', hint: 'Always light', Icon: SunIcon },
    { value: 'dark', label: 'Dark', hint: 'Always dark', Icon: MoonIcon },
    { value: 'system', label: 'System', hint: 'Follow device', Icon: MonitorIcon },
  ];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { report, loading, refresh } = useStorageReport();
  const [confirmClear, setConfirmClear] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const handleClearCache = async () => {
    const deleted = await clearOfflineCaches();
    setConfirmClear(false);
    setCacheMessage(
      deleted === 0
        ? 'No offline cache found. Nothing to clear.'
        : `Cleared ${deleted} cache${deleted === 1 ? '' : 's'}. Reload while online to cache the app again.`,
    );
  };

  return (
    <div className="container-page max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Everything here is stored on this device only.
        </p>
      </div>

      <Card>
        <fieldset>
          <legend className="text-base font-semibold">Appearance</legend>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dark mode uses less battery on OLED screens.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, hint, Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm transition-colors hover:bg-slate-50 has-checked:border-amber-500 has-checked:bg-amber-50 dark:border-white/10 dark:hover:bg-white/5 dark:has-checked:border-amber-500/60 dark:has-checked:bg-amber-500/10"
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                  className="size-4 shrink-0 accent-amber-500"
                />
                <Icon className="text-lg text-slate-500 dark:text-slate-400" />
                <span className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Storage</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Progress, bookmarks and notes will be saved in IndexedDB on this device.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshIcon /> Refresh
          </Button>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600 dark:text-slate-300">IndexedDB</dt>
            <dd>
              {loading ? (
                <span className="text-slate-500 dark:text-slate-400">Checking…</span>
              ) : report?.indexedDb ? (
                <Badge tone="success">Available</Badge>
              ) : (
                <Badge tone="danger">Blocked</Badge>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600 dark:text-slate-300">Persistent storage granted</dt>
            <dd className="font-medium">{report?.persisted ? 'Yes' : 'No'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600 dark:text-slate-300">Used</dt>
            <dd className="font-medium">
              {formatBytes(report?.usageBytes ?? null)} of {formatBytes(report?.quotaBytes ?? null)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Offline cache</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The app files are cached so it opens without internet. Clearing them does not delete your
          progress — but you must be online once afterwards to cache the app again.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {confirmClear ? (
            <>
              <Button variant="danger" size="sm" onClick={() => void handleClearCache()}>
                <TrashIcon /> Yes, clear cache
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirmClear(true)}>
              <TrashIcon /> Clear offline cache
            </Button>
          )}
        </div>
        {cacheMessage && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
            {cacheMessage}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-semibold">About</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {APP_NAME} v{APP_VERSION}. Free and open. No analytics, no ads, no account, no server. Your
          answers never leave this device unless you export them yourself.
        </p>
      </Card>
    </div>
  );
}
