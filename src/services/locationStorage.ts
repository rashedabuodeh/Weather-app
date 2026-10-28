import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedLocation } from '@/types/location';

const STORAGE_KEY = 'savedLocations';

export async function loadSavedLocations(): Promise<SavedLocation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function storeSavedLocations(locations: SavedLocation[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
}
