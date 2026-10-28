import { Fragment, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { DailyForecast } from '@/types/weather';
import { formatDateRange, getTemperatureRange } from '@/utils/forecast';
import { Card } from './Card';
import { DayRow } from './DayRow';

const INITIAL_DAYS = 7;

type Props = {
  days: DailyForecast[];
  /** Current temperature, shown as a dot on today's bar. */
  currentTemp: number;
};

export function DailyForecastList({ days, currentTemp }: Props) {
  // Kept per city: each tab's screen stays mounted.
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? days : days.slice(0, INITIAL_DAYS);
  const extra = days.slice(INITIAL_DAYS);
  const extraRange = extra.length ? formatDateRange(extra[0].date, extra[extra.length - 1].date) : '';
  // Scale bars across all days so they don't shift when the list expands.
  const range = getTemperatureRange(days);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <Card title={`${visible.length}-day forecast`}>
      {visible.map((day, index) => (
        <Fragment key={day.date}>
          {index === INITIAL_DAYS && (
            <Text style={styles.weekDivider}>Next week · {extraRange}</Text>
          )}
          <DayRow
            day={day}
            index={index}
            isLast={index === visible.length - 1 || index === INITIAL_DAYS - 1}
            range={range}
            currentTemp={index === 0 ? currentTemp : undefined}
          />
        </Fragment>
      ))}

      {extra.length > 0 && (
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              {expanded
                ? 'Show less'
                : `Show ${extra.length} more ${extra.length === 1 ? 'day' : 'days'} · ${extraRange}`}
            </Text>
            <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
          </View>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  weekDivider: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 2,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  buttonPressed: { opacity: 0.6 },
  buttonContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: '500' },
  chevron: { color: colors.textSecondary, fontSize: 14 },
});
