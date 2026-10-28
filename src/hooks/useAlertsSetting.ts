import { useCallback, useEffect, useState } from 'react';
import { setAlertsEnabled, subscribeToUserData } from '@/services/userData';

/** The signed-in user's "weather alerts" switch, synced with Firestore. */
export function useAlertsSetting(uid: string) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeToUserData(
        uid,
        (data) => setEnabled(data.alertsEnabled),
        (e) => setError(e.message),
      ),
    [uid],
  );

  const toggle = useCallback(
    (value: boolean) => {
      setEnabled(value);
      setAlertsEnabled(uid, value).catch((e) => setError(String(e)));
    },
    [uid],
  );

  return { enabled, toggle, error };
}
