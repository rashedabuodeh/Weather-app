import type { Coordinates } from '@/types/location';
import type { Forecast } from '@/types/weather';

type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    is_day: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
};

/** Days in the daily forecast; the list shows 7 and can expand to all of them. */
export const FORECAST_DAYS = 14;

// Free, no API key: https://open-meteo.com/en/docs
export async function fetchForecast({ latitude, longitude }: Coordinates): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current:
      'temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
    // Today and tomorrow (from midnight) always contain the next 24 hours.
    forecast_hours: '48',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) {
    throw new Error(`Weather API returned ${res.status}`);
  }
  const json: OpenMeteoResponse = await res.json();
  const { current, hourly, daily } = json;

  return {
    latitude: json.latitude,
    longitude: json.longitude,
    timezone: json.timezone,
    utcOffsetSeconds: json.utc_offset_seconds,
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
    },
    hourly: hourly.time.map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i],
      weatherCode: hourly.weather_code[i],
      precipitationChance: hourly.precipitation_probability[i] ?? null,
      isDay: hourly.is_day[i] === 1,
    })),
    daily: daily.time.map((date, i) => ({
      date,
      weatherCode: daily.weather_code[i],
      maxTemp: daily.temperature_2m_max[i],
      minTemp: daily.temperature_2m_min[i],
      precipitationChance: daily.precipitation_probability_max[i] ?? null,
    })),
    fetchedAt: Date.now(),
  };
}
