export interface StorageReport {
  indexedDb: boolean;
  persisted: boolean;
  usageBytes: number | null;
  quotaBytes: number | null;
}

function canUseIndexedDb(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(false);
      return;
    }
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    try {
      const request = indexedDB.open('gate-storage-probe', 1);
      request.onerror = () => finish(false);
      request.onblocked = () => finish(false);
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('gate-storage-probe');
        finish(true);
      };
    } catch {
      finish(false);
    }
  });
}

/** Real capability check: private-mode Safari and some locked-down browsers block IndexedDB. */
export async function readStorageReport(): Promise<StorageReport> {
  const report: StorageReport = {
    indexedDb: await canUseIndexedDb(),
    persisted: false,
    usageBytes: null,
    quotaBytes: null,
  };

  try {
    if (navigator.storage?.persisted) report.persisted = await navigator.storage.persisted();
  } catch {
    // Not supported: leave as false.
  }

  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      report.usageBytes = estimate.usage ?? null;
      report.quotaBytes = estimate.quota ?? null;
    }
  } catch {
    // Not supported: leave as null.
  }

  return report;
}

/** Deletes the service worker's offline cache. User progress in IndexedDB is untouched. */
export async function clearOfflineCaches(): Promise<number> {
  if (!('caches' in window)) return 0;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  return keys.length;
}
