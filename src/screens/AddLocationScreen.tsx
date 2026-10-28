import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useLocations } from '@/context/LocationsContext';
import { searchPlaces } from '@/services/geocoding';
import type { SavedLocation } from '@/types/location';
import { errorMessage } from '@/utils/forecast';

const MIN_QUERY_LENGTH = 2;

export function AddLocationScreen() {
  const router = useRouter();
  const { locations, addLocation } = useLocations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SavedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

  // Search after the user stops typing for a moment.
  useEffect(() => {
    if (!canSearch) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const places = await searchPlaces(trimmed);
        if (!cancelled) {
          setResults(places);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, canSearch]);

  const onSelect = (place: SavedLocation) => {
    addLocation(place);
    router.back();
  };

  const visibleResults = canSearch ? results : [];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a city"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
      />
      {searching && <ActivityIndicator style={styles.spinner} color={colors.text} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {canSearch && !searching && !error && visibleResults.length === 0 && (
        <Text style={styles.message}>No places found.</Text>
      )}
      <FlatList
        data={visibleResults}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const saved = locations.some((l) => l.id === item.id);
          return (
            <Pressable style={styles.result} onPress={() => onSelect(item)}>
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultRegion}>
                  {[item.region, item.country].filter(Boolean).join(', ')}
                </Text>
              </View>
              {saved && <Text style={styles.saved}>Added</Text>}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  spinner: { marginTop: 16 },
  message: { color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultText: { flex: 1 },
  resultName: { color: colors.text, fontSize: 17 },
  resultRegion: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  saved: { color: colors.accent, fontSize: 13 },
});
