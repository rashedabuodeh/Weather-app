import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import type { Place } from '@/types/location';
import { errorMessage } from '@/utils/forecast';

type State = { place: Place | null; error: string | null; loading: boolean };

async function findCurrentPlace(): Promise<State> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        place: null,
        loading: false,
        error: 'Location permission was denied. Allow it in your phone settings, or add a city with the + tab.',
      };
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };

    let name = 'My Location';
    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      name = address?.city ?? address?.region ?? name;
    } catch {
      // Reverse geocoding is optional.
    }
    return { place: { ...coords, name }, error: null, loading: false };
  } catch (e) {
    return { place: null, loading: false, error: `Couldn't get your location: ${errorMessage(e)}` };
  }
}

export function useCurrentLocation() {
  const [state, setState] = useState<State>({ place: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    findCurrentPlace().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setState(await findCurrentPlace());
  }, []);

  return { ...state, retry };
}
