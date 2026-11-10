import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './client';

export interface Resource<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

/** Carrega um recurso ao montar e a cada reload(). */
export function useResource<T>(loader: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader()
      .then((value) => { if (!cancelled) { setData(value); setError(null); } })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', String(e))); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
