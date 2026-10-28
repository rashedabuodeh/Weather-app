import { StateMessage } from '@/components/StateMessage';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { WeatherScreen } from './WeatherScreen';

/** The default tab: weather for the device's current location. */
export function CurrentLocationScreen() {
  const { place, error, loading, retry } = useCurrentLocation();

  if (loading) {
    return <StateMessage loading title="Finding your location…" />;
  }
  if (!place) {
    return (
      <StateMessage title="Location unavailable" detail={error} actionLabel="Try again" onAction={retry} />
    );
  }
  return <WeatherScreen place={place} isCurrentLocation />;
}
