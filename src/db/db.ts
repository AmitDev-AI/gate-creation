import Dexie, { type EntityTable } from 'dexie';
import type { BranchCode } from '../domain/types';

/**
 * One row holds the learner's local profile. There is no account and no server:
 * everything in this database lives in the browser's IndexedDB.
 */
export interface ProfileRow {
  readonly id: 'profile';
  readonly branch: BranchCode | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export class GateDatabase extends Dexie {
  profile!: EntityTable<ProfileRow, 'id'>;

  constructor() {
    super('gate-prep-hub');
    this.version(1).stores({
      profile: 'id',
    });
  }
}

export const db = new GateDatabase();
