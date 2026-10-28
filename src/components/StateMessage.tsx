import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

type Props = {
  title: string;
  detail?: string | null;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

/** Full-screen loading or error message. */
export function StateMessage({ title, detail, loading, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={colors.text} />}
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  detail: { color: colors.textSecondary, textAlign: 'center' },
  button: {
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonText: { color: colors.background, fontWeight: '600' },
});
