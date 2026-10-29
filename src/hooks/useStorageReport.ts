import { useCallback, useEffect, useState } from 'react';
import { readStorageReport, type StorageReport } from '../lib/storage';

export function useStorageReport(): {
  report: StorageReport | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [report, setReport] = useState<StorageReport | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await readStorageReport();
    setReport(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { report, loading, refresh };
}
