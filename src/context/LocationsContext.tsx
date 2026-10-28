import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { loadSavedLocations, storeSavedLocations } from '@/services/locationStorage';
import { saveUserLocations, subscribeToUserData } from '@/services/userData';
import type { SavedLocation } from '@/types/location';
import { useAuth } from './AuthContext';

export const CURRENT_LOCATION_ID = 'current';

type LocationsContextValue = {
  locations: SavedLocation[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  addLocation: (location: SavedLocation) => void;
  removeLocation: (id: string) => void;
  /** True when the list is synced with Firestore through the signed-in account. */
  isSynced: boolean;
  syncError: string | null;
};

const LocationsContext = createContext<LocationsContextValue | null>(null);

/**
 * Saved cities. Signed out, they live only on this device. Signed in, Firestore is the
 * source of truth and keeps every device in sync; a copy is kept on the device for offline starts.
 */
export function LocationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [localLoaded, setLocalLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(CURRENT_LOCATION_ID);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Latest list, for merging inside the Firestore listener without resubscribing.
  const locationsRef = useRef(locations);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  useEffect(() => {
    loadSavedLocations()
      .then(setLocations)
      .catch((e) => console.warn('Could not load saved locations', e))
      .finally(() => setLocalLoaded(true));
  }, []);

  // While signed in, mirror the account's list from Firestore.
  useEffect(() => {
    if (!uid || !localLoaded) return;
    let merged = false;

    return subscribeToUserData(
      uid,
      (data) => {
        // On first sign-in on this device, upload cities that were added while signed out.
        if (!merged) {
          merged = true;
          const missing = locationsRef.current.filter(
            (local) => !data.locations.some((cloud) => cloud.id === local.id),
          );
          if (missing.length) {
            saveUserLocations(uid, [...data.locations, ...missing]).catch((e) =>
              setSyncError(String(e)),
            );
            return; // The write triggers another snapshot with the merged list.
          }
        }
        setSyncError(null);
        setLocations(data.locations);
        storeSavedLocations(data.locations).catch(() => {});
      },
      (e) => setSyncError(e.message),
    );
  }, [uid, localLoaded]);

  const update = useCallback(
    (next: SavedLocation[]) => {
      setLocations(next);
      storeSavedLocations(next).catch((e) => console.warn('Could not save locations', e));
      if (uid) {
        saveUserLocations(uid, next).catch((e) => setSyncError(String(e)));
      }
    },
    [uid],
  );

  const addLocation = useCallback(
    (location: SavedLocation) => {
      if (!locations.some((l) => l.id === location.id)) {
        update([...locations, location]);
      }
      setSelectedId(location.id);
    },
    [locations, update],
  );

  const removeLocation = useCallback(
    (id: string) => update(locations.filter((l) => l.id !== id)),
    [locations, update],
  );

  // A city removed here or on another device falls back to the current-location tab.
  const effectiveSelectedId = locations.some((l) => l.id === selectedId)
    ? selectedId
    : CURRENT_LOCATION_ID;

  const value = useMemo(
    () => ({
      locations,
      selectedId: effectiveSelectedId,
      setSelectedId,
      addLocation,
      removeLocation,
      isSynced: uid !== null && syncError === null,
      syncError,
    }),
    [locations, effectiveSelectedId, addLocation, removeLocation, uid, syncError],
  );

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
}

export function useLocations() {
  const ctx = useContext(LocationsContext);
  if (!ctx) throw new Error('useLocations must be used inside LocationsProvider');
  return ctx;
}
