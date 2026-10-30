import { useProfile } from '../app/ProfileProvider';
import { AlertIcon } from './icons';

/**
 * Shown wherever the app needs storage. Private windows and locked-down browsers can
 * block IndexedDB; the app keeps working for the session but the choice will not persist.
 */
export function StorageWarning() {
  const { storageError } = useProfile();
  if (!storageError) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <AlertIcon className="mt-0.5 shrink-0 text-lg" />
      <div className="space-y-1">
        <p className="font-semibold">This browser is blocking local storage.</p>
        <p>
          You can keep using the app, but your branch choice will be forgotten when you close the
          tab. Private windows and some locked-down browsers block IndexedDB.
        </p>
        <p className="text-xs opacity-80">Details: {storageError}</p>
      </div>
    </div>
  );
}
