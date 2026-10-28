// Checks the next 24 hours of a city's forecast for weather worth alerting about.

export type Place = { id: string; name: string; latitude: number; longitude: number };

export type WeatherAlert = {
  type: string;
  date: string; // YYYY-MM-DD at the city, used to send each alert type once per day
  title: string;
  body: string;
};

type Hour = {
  time: string; // local time at the city, e.g. "2026-10-17T15:00"
  temperature: number;
  weatherCode: number;
  precipitationChance: number;
  windGusts: number;
};

type Rule = {
  type: string;
  title: string;
  matches: (h: Hour) => boolean;
  describe: (h: Hour, city: string, at: string) => string;
};

const isSnow = (code: number) => (code >= 71 && code <= 77) || code === 85 || code === 86;
const isHeavyRain = (code: number) => code === 65 || code === 82;

const RULES: Rule[] = [
  {
    type: 'storm',
    title: '⛈️ Thunderstorm warning',
    matches: (h) => h.weatherCode >= 95,
    describe: (_h, city, at) => `Thunderstorms are expected in ${city} around ${at}.`,
  },
  {
    type: 'heavy-rain',
    title: '🌧️ Heavy rain',
    matches: (h) => isHeavyRain(h.weatherCode) && h.precipitationChance >= 60,
    describe: (h, city, at) =>
      `Heavy rain likely in ${city} around ${at} (${h.precipitationChance}% chance).`,
  },
  {
    type: 'snow',
    title: '❄️ Snow on the way',
    matches: (h) => isSnow(h.weatherCode),
    describe: (_h, city, at) => `Snow is expected in ${city} around ${at}.`,
  },
  {
    type: 'heat',
    title: '🔥 Extreme heat',
    matches: (h) => h.temperature >= 40,
    describe: (h, city, at) => `${city} will reach ${Math.round(h.temperature)}°C around ${at}.`,
  },
  {
    type: 'freeze',
    title: '🥶 Freezing temperatures',
    matches: (h) => h.temperature <= 0,
    describe: (h, city, at) => `${city} will drop to ${Math.round(h.temperature)}°C around ${at}.`,
  },
  {
    type: 'wind',
    title: '💨 Strong wind',
    matches: (h) => h.windGusts >= 70,
    describe: (h, city, at) => `Wind gusts up to ${Math.round(h.windGusts)} km/h in ${city} around ${at}.`,
  },
];

/** The next 24 hours at the given coordinates, from Open-Meteo. */
export async function fetchNext24Hours(latitude: number, longitude: number): Promise<Hour[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'temperature_2m,weather_code,precipitation_probability,wind_gusts_10m',
    timezone: 'auto',
    forecast_days: '2',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
  const json = await res.json();
  const h = json.hourly;

  // "YYYY-MM-DDTHH" for the current hour at the city, comparable with the API's local times.
  const nowKey = new Date(Date.now() + json.utc_offset_seconds * 1000).toISOString().slice(0, 13);

  const hours: Hour[] = h.time.map((time: string, i: number) => ({
    time,
    temperature: h.temperature_2m[i],
    weatherCode: h.weather_code[i],
    precipitationChance: h.precipitation_probability[i] ?? 0,
    windGusts: h.wind_gusts_10m[i] ?? 0,
  }));
  const start = hours.findIndex((hour) => hour.time.slice(0, 13) >= nowKey);
  return start === -1 ? [] : hours.slice(start, start + 24);
}

/** At most one alert per rule: the first hour that matches it. */
export function findAlerts(place: Place, hours: Hour[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  for (const rule of RULES) {
    const hour = hours.find(rule.matches);
    if (!hour) continue;
    const at = hour.time.slice(11, 16); // "15:00"
    alerts.push({
      type: rule.type,
      date: hour.time.slice(0, 10),
      title: rule.title,
      body: rule.describe(hour, place.name, at),
    });
  }
  return alerts;
}
