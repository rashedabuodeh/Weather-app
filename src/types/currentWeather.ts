export type CurrentWeather = {
  time: string; // local time at the location, e.g. "2026-10-17T15:30"
  temperature: number; // °C
  apparentTemperature: number; // °C, "feels like"
  weatherCode: number; // WMO code
  isDay: boolean;
  humidity: number; // %
  windSpeed: number; // km/h
};
