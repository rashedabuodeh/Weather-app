import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { getCurrentPushToken } from './notifications';
import { removeDeviceToken, setAlertsEnabled } from './userData';

function requireAuth() {
  if (!auth) throw new Error('Firebase is not configured.');
  return auth;
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function signUp(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
  // New accounts get weather alerts by default; they can turn them off on the Account screen.
  await setAlertsEnabled(user.uid, true);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(requireAuth(), email.trim());
}

export async function signOut() {
  const firebaseAuth = requireAuth();
  const uid = firebaseAuth.currentUser?.uid;
  const token = getCurrentPushToken();
  // Stop alerts on this device. Do it before signing out, while we still have permission.
  if (uid && token) {
    await removeDeviceToken(uid, token).catch((e) => console.warn('Could not remove push token', e));
  }
  await firebaseSignOut(firebaseAuth);
}

/** Turns Firebase Auth error codes into messages people can act on. */
export function authErrorMessage(e: unknown) {
  const code = (e as { code?: string }).code;
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email sign-in isn’t enabled in the Firebase console.';
    default:
      return e instanceof Error ? e.message : String(e);
  }
}
