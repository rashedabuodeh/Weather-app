import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { CURRENT_LOCATION_ID, useLocations } from '@/context/LocationsContext';
import { CurrentLocationScreen } from '@/screens/CurrentLocationScreen';
import { WeatherScreen } from '@/screens/WeatherScreen';
import type { SavedLocation } from '@/types/location';
import { LocationTabBar } from './LocationTabBar';

/**
 * One tab for the current location plus one per saved location.
 * Every tab stays mounted so switching back doesn't reload its forecast.
 */
export function LocationTabs() {
  const router = useRouter();
  const { user } = useAuth();
  const { locations, selectedId, setSelectedId, removeLocation } = useLocations();

  const tabs = [
    { id: CURRENT_LOCATION_ID, label: '📍 My Location' },
    ...locations.map((l) => ({ id: l.id, label: l.name })),
  ];

  const confirmRemove = (location: SavedLocation) => {
    Alert.alert('Remove location', `Remove ${location.name} from your tabs?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeLocation(location.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LocationTabBar
        tabs={tabs}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => router.push('/add-location')}
        onAccount={() => router.push('/account')}
        signedIn={user !== null}
      />
      <View style={styles.pages}>
        <TabPage visible={selectedId === CURRENT_LOCATION_ID}>
          <CurrentLocationScreen />
        </TabPage>
        {locations.map((location) => (
          <TabPage key={location.id} visible={selectedId === location.id}>
            <WeatherScreen place={location} onRemove={() => confirmRemove(location)} />
          </TabPage>
        ))}
      </View>
    </SafeAreaView>
  );
}

function TabPage({ visible, children }: { visible: boolean; children: ReactNode }) {
  return <View style={[StyleSheet.absoluteFill, !visible && styles.hidden]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pages: { flex: 1 },
  hidden: { display: 'none' },
});
