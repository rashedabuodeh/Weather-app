import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { colors } from '@/constants/theme';

export type LocationTab = { id: string; label: string };

type Props = {
  tabs: LocationTab[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onAccount: () => void;
  signedIn: boolean;
};

/**
 * Horizontally scrollable row of location tabs with a "+" button at the end,
 * and an account button pinned to the right.
 */
export function LocationTabBar({ tabs, selectedId, onSelect, onAdd, onAccount, signedIn }: Props) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const tabCount = useRef(tabs.length);

  // Reveal a newly added tab, which is always last.
  useEffect(() => {
    if (tabs.length > tabCount.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
    tabCount.current = tabs.length;
  }, [tabs.length]);

  return (
    <View style={styles.bar}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => {
          const selected = tab.id === selectedId;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelect(tab.id)}
              style={[styles.tab, selected && styles.tabSelected]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={onAdd} style={styles.tab} accessibilityLabel="Add location">
          <Text style={styles.label}>＋ Add</Text>
        </Pressable>
      </ScrollView>

      <Pressable
        onPress={onAccount}
        style={styles.account}
        accessibilityLabel={signedIn ? 'Account' : 'Sign in'}
      >
        <Text style={styles.accountIcon}>👤</Text>
        {signedIn && <View style={styles.signedInDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.card,
    maxWidth: 180,
  },
  tabSelected: { backgroundColor: colors.text },
  label: { color: colors.text, fontSize: 14, fontWeight: '500' },
  labelSelected: { color: colors.background },
  account: { paddingHorizontal: 14, paddingVertical: 8 },
  accountIcon: { fontSize: 22 },
  signedInDot: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#4ade80',
  },
});
