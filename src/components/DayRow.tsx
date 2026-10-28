import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { DailyForecast } from '@/types/weather';
import { formatDayLabel } from '@/utils/forecast';
import { describeWeather } from '@/utils/weatherCodes';
import { TemperatureBar } from './TemperatureBar';

type Props = {
  day: DailyForecast;
  index: number;
  isLast: boolean;
  range: { min: number; max: number };
  /** Shown as a dot on the bar; pass for today only. */
  currentTemp?: number;
};

export function DayRow({ day, index, isLast, range, currentTemp }: Props) {
  const { icon, label } = describeWeather(day.weatherCode);

  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <Text style={styles.day} numberOfLines={1}>
        {formatDayLabel(day.date, index)}
      </Text>
      <View style={styles.weather}>
        <Text style={styles.icon} accessibilityLabel={label}>
          {icon}
        </Text>
        {day.precipitationChance ? <Text style={styles.rain}>{day.precipitationChance}%</Text> : null}
      </View>
      <Text style={styles.min}>{Math.round(day.minTemp)}°</Text>
      <View style={styles.bar}>
        <TemperatureBar
          min={day.minTemp}
          max={day.maxTemp}
          rangeMin={range.min}
          rangeMax={range.max}
          current={currentTemp}
        />
      </View>
      <Text style={styles.max}>{Math.round(day.maxTemp)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  day: { width: 64, color: colors.text, fontSize: 16 },
  weather: { width: 40, alignItems: 'center' },
  icon: { fontSize: 22 },
  rain: { color: colors.accent, fontSize: 11 },
  min: { width: 34, color: colors.textMuted, fontSize: 16, textAlign: 'right' },
  bar: { flex: 1 },
  max: { width: 34, color: colors.text, fontSize: 16, fontWeight: '600' },
});
