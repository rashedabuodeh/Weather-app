import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { CurrentWeather } from '@/types/currentWeather';
import type { DailyForecast } from '@/types/weather';
import { describeWeather } from '@/utils/weatherCodes';

type Props = {
  name: string;
  subtitle?: string;
  current: CurrentWeather;
  today?: DailyForecast;
};

export function CurrentWeatherHeader({ name, subtitle, current, today }: Props) {
  const { icon, label } = describeWeather(current.weatherCode, current.isDay);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.temp}>{Math.round(current.temperature)}°</Text>
      <Text style={styles.label}>{label}</Text>
      {today && (
        <Text style={styles.highLow}>
          H: {Math.round(today.maxTemp)}°  L: {Math.round(today.minTemp)}°
        </Text>
      )}
      <View style={styles.details}>
        <Detail label="Feels like" value={`${Math.round(current.apparentTemperature)}°`} />
        <Detail label="Humidity" value={`${current.humidity}%`} />
        <Detail label="Wind" value={`${Math.round(current.windSpeed)} km/h`} />
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 8 },
  name: { color: colors.text, fontSize: 30, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  icon: { fontSize: 64, marginTop: 8 },
  temp: { color: colors.text, fontSize: 80, fontWeight: '200', lineHeight: 92 },
  label: { color: colors.textSecondary, fontSize: 18 },
  highLow: { color: colors.text, fontSize: 16, marginTop: 4 },
  details: { flexDirection: 'row', marginTop: 16, gap: 24 },
  detail: { alignItems: 'center' },
  detailValue: { color: colors.text, fontSize: 16, fontWeight: '600' },
  detailLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
