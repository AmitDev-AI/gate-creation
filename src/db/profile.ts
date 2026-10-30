import type { BranchCode } from '../domain/types';
import { db, type ProfileRow } from './db';

const PROFILE_ID = 'profile' as const;

/** Reads the single profile row, or `null` on a first run. Throws if storage is blocked. */
export async function loadProfile(): Promise<ProfileRow | null> {
  const row = await db.profile.get(PROFILE_ID);
  return row ?? null;
}

/**
 * Stores the chosen branch. `createdAt` is preserved so switching branches never looks
 * like a brand-new install, and `updatedAt` records the change.
 */
export async function saveBranch(branch: BranchCode): Promise<ProfileRow> {
  const existing = await db.profile.get(PROFILE_ID);
  const now = Date.now();
  const row: ProfileRow = {
    id: PROFILE_ID,
    branch,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.profile.put(row);
  return row;
}

/** Removes the profile row. Used by "reset this device" once that control ships. */
export async function deleteProfile(): Promise<void> {
  await db.profile.delete(PROFILE_ID);
}
