import { Pressable, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { CurrentWeatherHeader } from '@/components/CurrentWeatherHeader';
import { DailyForecastList } from '@/components/DailyForecastList';
import { HourlyForecastList } from '@/components/HourlyForecastList';
import { StateMessage } from '@/components/StateMessage';
import { colors } from '@/constants/theme';
import { useForecast } from '@/hooks/useForecast';
import type { Place } from '@/types/location';
import { getUpcomingDays, getUpcomingHours } from '@/utils/forecast';

type Props = {
  place: Place;
  isCurrentLocation?: boolean;
  onRemove?: () => void;
};

export function WeatherScreen({ place, isCurrentLocation, onRemove }: Props) {
  const { forecast, error, loading, refreshing, refresh } = useForecast(place);

  if (loading) {
    return <StateMessage loading title="Loading forecast…" />;
  }
  if (!forecast) {
    return (
      <StateMessage
        title="Couldn't load the forecast."
        detail={error}
        actionLabel="Try again"
        onAction={refresh}
      />
    );
  }

  const days = getUpcomingDays(forecast);
  const subtitle = isCurrentLocation
    ? '📍 Current location'
    : [place.region, place.country].filter(Boolean).join(', ');

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.text} />
      }
    >
      <CurrentWeatherHeader
        name={place.name}
        subtitle={subtitle}
        current={forecast.current}
        today={days[0]}
      />
      <Text style={styles.updated}>
        Updated {new Date(forecast.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {error && <Text style={styles.warning}>{error}</Text>}

      <HourlyForecastList hours={getUpcomingHours(forecast)} />
      <DailyForecastList days={days} currentTemp={forecast.current.temperature} />

      {onRemove && (
        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeText}>Remove {place.name}</Text>
        </Pressable>
      )}
      <Text style={styles.footer}>Pull down to refresh</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  updated: { color: colors.textMuted, fontSize: 12, marginTop: 12, textAlign: 'center' },
  warning: { color: colors.warning, fontSize: 12, marginTop: 8, textAlign: 'center' },
  removeButton: { alignSelf: 'center', marginTop: 24, padding: 8 },
  removeText: { color: colors.danger, fontSize: 15 },
  footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
