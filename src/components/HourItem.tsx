import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { HourlyForecast } from '@/types/weather';
import { formatHour } from '@/utils/forecast';
import { describeWeather } from '@/utils/weatherCodes';

export function HourItem({ hour, isNow }: { hour: HourlyForecast; isNow: boolean }) {
  const { icon, label } = describeWeather(hour.weatherCode, hour.isDay);

  return (
    <View style={styles.container}>
      <Text style={[styles.time, isNow && styles.now]}>{isNow ? 'Now' : formatHour(hour.time)}</Text>
      <Text style={styles.icon} accessibilityLabel={label}>
        {icon}
      </Text>
      <Text style={styles.rain}>
        {hour.precipitationChance ? `${hour.precipitationChance}%` : ' '}
      </Text>
      <Text style={styles.temp}>{Math.round(hour.temperature)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 56, gap: 4 },
  time: { color: colors.textSecondary, fontSize: 13 },
  now: { color: colors.text, fontWeight: '700' },
  icon: { fontSize: 26 },
  rain: { color: colors.accent, fontSize: 11 },
  temp: { color: colors.text, fontSize: 17, fontWeight: '600' },
});
