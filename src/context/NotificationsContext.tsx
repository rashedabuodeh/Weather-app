import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  addNotificationTapListener,
  registerForPushNotifications,
  type PushRegistration,
} from '@/services/notifications';
import { saveDeviceToken } from '@/services/userData';
import { errorMessage } from '@/utils/forecast';
import { useAuth } from './AuthContext';
import { useLocations } from './LocationsContext';

type NotificationsContextValue = {
  /** null while registering. */
  registration: PushRegistration | null;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setSelectedId } = useLocations();
  const [registration, setRegistration] = useState<PushRegistration | null>(null);

  // Register on every launch, signed in or not, so console campaigns reach all installs.
  useEffect(() => {
    let cancelled = false;
    registerForPushNotifications().then(
      (r) => !cancelled && setRegistration(r),
      (e) => !cancelled && setRegistration({ token: null, reason: errorMessage(e) }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Weather alerts are per account: store this device's token under the signed-in user.
  const token = registration?.token ?? null;
  const uid = user?.uid ?? null;
  useEffect(() => {
    if (uid && token) {
      saveDeviceToken(uid, token).catch((e) => console.warn('Could not save push token', e));
    }
  }, [uid, token]);

  // Tapping a weather alert opens that city's tab.
  useEffect(
    () =>
      addNotificationTapListener((data) => {
        if (typeof data.locationId === 'string') setSelectedId(data.locationId);
      }),
    [setSelectedId],
  );

  return (
    <NotificationsContext.Provider value={{ registration }}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
