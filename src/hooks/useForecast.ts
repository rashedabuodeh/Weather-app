import { useCallback, useEffect, useState } from 'react';
import { fetchForecast } from '@/services/weatherApi';
import type { Coordinates } from '@/types/location';
import type { Forecast } from '@/types/weather';
import { errorMessage } from '@/utils/forecast';

export function useForecast({ latitude, longitude }: Coordinates) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchForecast({ latitude, longitude }).then(
      (next) => {
        if (cancelled) return;
        setForecast(next);
        setError(null);
      },
      (e) => {
        if (!cancelled) setError(errorMessage(e));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  /** Pull-to-refresh and "Try again". */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setForecast(await fetchForecast({ latitude, longitude }));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [latitude, longitude]);

  return {
    forecast,
    error,
    loading: !forecast && !error,
    refreshing,
    refresh,
  };
}
