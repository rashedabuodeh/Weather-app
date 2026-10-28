import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { LocationsProvider } from '@/context/LocationsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationsProvider>
        <NotificationsProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="add-location" options={{ title: 'Add location', presentation: 'modal' }} />
            <Stack.Screen name="account" options={{ title: 'Account', presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </NotificationsProvider>
      </LocationsProvider>
    </AuthProvider>
  );
}
