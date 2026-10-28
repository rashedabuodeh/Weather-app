import { StyleSheet, View } from 'react-native';
import { colors, temperatureScale } from '@/constants/theme';

type Props = {
  min: number;
  max: number;
  /** Shared scale across all days, so bars line up between rows. */
  rangeMin: number;
  rangeMax: number;
  /** Optional dot for the current temperature (today's row). */
  current?: number;
};

// Rounded, so two rows that both show "30°" get the same colour.
function temperatureColor(t: number) {
  return temperatureScale.find((s) => Math.round(t) <= s.upTo)!.color;
}

/** A min–max bar positioned on a shared temperature scale, like iOS Weather. */
export function TemperatureBar({ min, max, rangeMin, rangeMax, current }: Props) {
  const span = Math.max(rangeMax - rangeMin, 1);
  const toPercent = (t: number) => Math.min(Math.max(((t - rangeMin) / span) * 100, 0), 100);

  const left = toPercent(min);
  const width = Math.max(toPercent(max) - left, 4); // keep a visible sliver on flat days

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { left: `${left}%`, width: `${width}%`, backgroundColor: temperatureColor(max) },
        ]}
      />
      {current !== undefined && (
        <View style={[styles.dot, { left: `${toPercent(current)}%` }]} />
      )}
    </View>
  );
}

const BAR_HEIGHT = 5;
const DOT_SIZE = 9;

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.barTrack,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: BAR_HEIGHT / 2,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    marginLeft: -DOT_SIZE / 2,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.text,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
