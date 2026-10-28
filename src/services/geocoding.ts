import type { SavedLocation } from '@/types/location';

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

// Free, no API key: https://open-meteo.com/en/docs/geocoding-api
export async function searchPlaces(query: string): Promise<SavedLocation[]> {
  const params = new URLSearchParams({ name: query, count: '10', language: 'en', format: 'json' });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!res.ok) {
    throw new Error(`Location search returned ${res.status}`);
  }
  const json: { results?: GeocodingResult[] } = await res.json();

  return (json.results ?? []).map((r) => ({
    id: String(r.id),
    name: r.name,
    region: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
