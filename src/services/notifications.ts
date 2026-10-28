import * as Device from 'expo-device';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');
type NotificationResponse = import('expo-notifications').NotificationResponse;

/** Must match the channelId the Cloud Functions send weather alerts with. */
export const ALERTS_CHANNEL_ID = 'weather-alerts';
/** Used by Firebase console campaigns (set as defaultChannel in app.json). */
export const DEFAULT_CHANNEL_ID = 'default';

// The same check expo-router uses. `Constants.executionEnvironment` can't tell Expo Go
// apart from a development build: both report "storeClient".
const isExpoGo = Boolean(
  (globalThis as { expo?: { modules?: Record<string, unknown> } }).expo?.modules?.ExpoGo,
);

// Expo Go on Android lacks some of expo-notifications' native modules, so even importing it
// crashes there. Load it only in development and release builds.
const Notifications: NotificationsModule | null = isExpoGo
  ? null
  : // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-notifications');

// Show notifications even while the app is open.
Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushRegistration = { token: string; reason?: undefined } | { token: null; reason: string };

let currentToken: string | null = null;

/** The FCM token from the last successful registration, if any. */
export function getCurrentPushToken() {
  return currentToken;
}

/**
 * Asks for notification permission and returns this device's FCM token.
 * Getting the token also registers the app with FCM, so Firebase console campaigns reach it.
 */
export async function registerForPushNotifications(): Promise<PushRegistration> {
  if (Platform.OS !== 'android') {
    return { token: null, reason: 'Push notifications are set up for Android only.' };
  }
  if (!Notifications) {
    return { token: null, reason: 'Push notifications need a development build. They don’t work in Expo Go.' };
  }
  if (!Device.isDevice) {
    return { token: null, reason: 'Push notifications need a real device.' };
  }

  // Android 13+ needs a channel before the permission prompt can appear.
  await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL_ID, {
    name: 'Weather alerts',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'News and updates',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') {
    return { token: null, reason: 'Notification permission was denied. Allow it in your phone settings.' };
  }

  const { data } = await Notifications.getDevicePushTokenAsync();
  currentToken = String(data);
  return { token: currentToken };
}

/**
 * Calls `onTap` with the notification's data when the user taps a notification,
 * including the one that launched the app. Returns an unsubscribe function.
 */
export function addNotificationTapListener(onTap: (data: Record<string, unknown>) => void) {
  if (!Notifications) return () => {};

  const handle = (response: NotificationResponse) =>
    onTap(response.notification.request.content.data ?? {});

  Notifications.getLastNotificationResponseAsync().then((r) => r && handle(r));
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
