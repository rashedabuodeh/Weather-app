import { FlatList, StyleSheet } from 'react-native';
import type { HourlyForecast } from '@/types/weather';
import { Card } from './Card';
import { HourItem } from './HourItem';

export function HourlyForecastList({ hours }: { hours: HourlyForecast[] }) {
  return (
    <Card title="Next 24 hours">
      <FlatList
        horizontal
        data={hours}
        keyExtractor={(h) => h.time}
        renderItem={({ item, index }) => <HourItem hour={item} isNow={index === 0} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        nestedScrollEnabled
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8, paddingVertical: 4 },
});
