import type { CurrentWeather } from './currentWeather';

export type HourlyForecast = {
  time: string; // local time at the location, e.g. "2026-10-17T15:00"
  temperature: number;
  weatherCode: number;
  precipitationChance: number | null;
  isDay: boolean;
};

export type DailyForecast = {
  date: string; // YYYY-MM-DD at the location
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitationChance: number | null;
};

export type Forecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  fetchedAt: number; // ms since epoch
};
