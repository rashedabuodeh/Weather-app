import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Platform } from 'react-native';
import type { SavedLocation } from '@/types/location';
import type { UserData } from '@/types/user';
import { db, functions } from './firebase';

function requireDb() {
  if (!db) throw new Error('Firebase is not configured.');
  return db;
}

function userRef(uid: string) {
  return doc(requireDb(), 'users', uid);
}

export function subscribeToUserData(
  uid: string,
  onData: (data: UserData) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    userRef(uid),
    (snap) => {
      const data = snap.data();
      onData({
        locations: (data?.locations as SavedLocation[] | undefined) ?? [],
        alertsEnabled: data?.alertsEnabled === true,
      });
    },
    onError,
  );
}

export async function saveUserLocations(uid: string, locations: SavedLocation[]) {
  await setDoc(userRef(uid), { locations, updatedAt: serverTimestamp() }, { merge: true });
}

export async function setAlertsEnabled(uid: string, alertsEnabled: boolean) {
  await setDoc(userRef(uid), { alertsEnabled, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveDeviceToken(uid: string, token: string) {
  await setDoc(doc(requireDb(), 'users', uid, 'devices', token), {
    token,
    platform: Platform.OS,
    updatedAt: serverTimestamp(),
  });
}

export async function removeDeviceToken(uid: string, token: string) {
  await deleteDoc(doc(requireDb(), 'users', uid, 'devices', token));
}

/** Asks the sendTestAlert Cloud Function to push a sample alert to this user's devices. */
export async function sendTestAlert() {
  if (!functions) throw new Error('Firebase is not configured.');
  const result = await httpsCallable<void, { sent: number }>(functions, 'sendTestAlert')();
  return result.data.sent;
}
