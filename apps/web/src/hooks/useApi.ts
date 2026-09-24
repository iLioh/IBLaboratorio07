import { useEffect, useState } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(loader: () => Promise<T>): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'No se pudo conectar con la API';
        setState({ data: null, loading: false, error: message });
      });
    return () => {
      active = false;
    };
  }, [loader]);

  return state;
}
