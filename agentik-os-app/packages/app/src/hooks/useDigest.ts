import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';

export function useDigest() {
  const { fetchDigests, refreshDigests, loading, error, ironMonkey, growing } = useDashboardStore();

  useEffect(() => {
    // Fetch initially
    fetchDigests();

    // Poll every 5 minutes (300,000 ms)
    const interval = setInterval(() => {
      fetchDigests();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDigests]);

  return {
    loading,
    error,
    ironMonkey,
    growing,
    refreshDigests,
  };
}
