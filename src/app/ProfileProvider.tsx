import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BranchCode } from '../domain/types';
import type { ProfileRow } from '../db/db';
import { deleteProfile, loadProfile, saveBranch } from '../db/profile';

type ProfileStatus = 'loading' | 'ready';

interface ProfileContextValue {
  readonly profile: ProfileRow | null;
  readonly branch: BranchCode | null;
  readonly status: ProfileStatus;
  /** Non-null when IndexedDB refused a read or write. The session still works in memory. */
  readonly storageError: string | null;
  /** Returns `false` when the choice could not be saved, so callers can warn the user. */
  readonly chooseBranch: (branch: BranchCode) => Promise<boolean>;
  readonly forgetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function describeError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return 'The browser refused to open local storage.';
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const row = await loadProfile();
        if (!cancelled) setProfile(row);
      } catch (error) {
        if (!cancelled) setStorageError(describeError(error));
      } finally {
        if (!cancelled) setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chooseBranch = useCallback(async (branch: BranchCode) => {
    const now = Date.now();
    // Update the UI immediately so a blocked database never traps the user on a form.
    setProfile((previous) => ({
      id: 'profile',
      branch,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    }));

    try {
      const row = await saveBranch(branch);
      setProfile(row);
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(describeError(error));
      return false;
    }
  }, []);

  const forgetProfile = useCallback(async () => {
    setProfile(null);
    try {
      await deleteProfile();
      setStorageError(null);
    } catch (error) {
      setStorageError(describeError(error));
    }
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      branch: profile?.branch ?? null,
      status,
      storageError,
      chooseBranch,
      forgetProfile,
    }),
    [profile, status, storageError, chooseBranch, forgetProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside <ProfileProvider>');
  return value;
}
