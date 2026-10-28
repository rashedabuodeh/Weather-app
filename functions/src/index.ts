import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type DocumentReference } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchNext24Hours, findAlerts, type Place } from './weather.js';

initializeApp();
const db = getFirestore();

/** Must match ALERTS_CHANNEL_ID in the app (src/services/notifications.ts). */
const ALERTS_CHANNEL_ID = 'weather-alerts';

// Firestore's gRPC code for "document already exists".
const ALREADY_EXISTS = 6;

type Message = { title: string; body: string; data: Record<string, string> };

/**
 * Sends a notification to every device registered under a user, and deletes
 * tokens FCM reports as no longer valid (app uninstalled, data cleared, ...).
 */
async function sendToUser(userRef: DocumentReference, message: Message) {
  const devices = await userRef.collection('devices').get();
  if (devices.empty) return 0;

  const response = await getMessaging().sendEachForMulticast({
    tokens: devices.docs.map((d) => d.get('token') as string),
    notification: { title: message.title, body: message.body },
    data: message.data,
    android: { priority: 'high', notification: { channelId: ALERTS_CHANNEL_ID } },
  });

  await Promise.all(
    response.responses.map((r, i) => {
      const code = r.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        return devices.docs[i].ref.delete();
      }
      return null;
    }),
  );
  return response.successCount;
}

/**
 * Every 3 hours: for each user with alerts on, check the next 24 hours in each
 * saved city and push any new alerts. Each alert type is sent once per city per day.
 */
export const sendWeatherAlerts = onSchedule(
  { schedule: 'every 3 hours', timeoutSeconds: 300 },
  async () => {
    const users = await db.collection('users').where('alertsEnabled', '==', true).get();

    // Several users often save the same city; fetch each forecast once per run.
    const forecasts = new Map<string, ReturnType<typeof fetchNext24Hours>>();
    const hoursFor = (place: Place) => {
      const key = `${place.latitude.toFixed(2)}_${place.longitude.toFixed(2)}`;
      if (!forecasts.has(key)) forecasts.set(key, fetchNext24Hours(place.latitude, place.longitude));
      return forecasts.get(key)!;
    };

    let sent = 0;
    for (const user of users.docs) {
      const places = (user.get('locations') as Place[] | undefined) ?? [];
      for (const place of places) {
        try {
          const alerts = findAlerts(place, await hoursFor(place));
          for (const alert of alerts) {
            // create() fails if this alert was already sent, which makes reruns safe.
            try {
              await user.ref.collection('alerts').doc(`${place.id}_${alert.date}_${alert.type}`).create({
                ...alert,
                locationId: place.id,
                locationName: place.name,
                createdAt: FieldValue.serverTimestamp(),
              });
            } catch (e) {
              if ((e as { code?: unknown }).code === ALREADY_EXISTS) continue;
              throw e;
            }
            sent += await sendToUser(user.ref, {
              title: alert.title,
              body: alert.body,
              data: { locationId: place.id, type: alert.type },
            });
          }
        } catch (e) {
          logger.error(`Alert check failed for ${place.name} (user ${user.id})`, e);
        }
      }
    }
    logger.info(`Checked ${users.size} users, sent ${sent} notifications.`);
  },
);

/** Called from the Account screen to check that alerts reach the user's devices. */
export const sendTestAlert = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to send a test notification.');
  }
  const sent = await sendToUser(db.collection('users').doc(request.auth.uid), {
    title: '🌤️ Test alert',
    body: 'Weather alerts are working on this device.',
    data: { type: 'test' },
  });
  return { sent };
});
