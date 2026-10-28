import type { SavedLocation } from './location';

/** Stored in Firestore at users/{uid}. */
export type UserData = {
  locations: SavedLocation[];
  alertsEnabled: boolean;
};
