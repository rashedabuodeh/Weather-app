import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
});
