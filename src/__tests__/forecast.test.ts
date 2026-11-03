import {
  errorMessage,
  formatDateRange,
  formatDayLabel,
  getTemperatureRange,
  getUpcomingDays,
  getUpcomingHours,
} from '@/utils/forecast';
import type { DailyForecast, Forecast, HourlyForecast } from '@/types/weather';

const hours: HourlyForecast[] = [
  { time: '2026-11-03T09:00', temperature: 18, weatherCode: 0, precipitationChance: null, isDay: true },
  { time: '2026-11-03T10:00', temperature: 20, weatherCode: 0, precipitationChance: null, isDay: true },
  { time: '2026-11-03T11:00', temperature: 22, weatherCode: 0, precipitationChance: 10, isDay: true },
  { time: '2026-11-03T12:00', temperature: 23, weatherCode: 0, precipitationChance: 20, isDay: true },
  { time: '2026-11-03T13:00', temperature: 24, weatherCode: 0, precipitationChance: 30, isDay: true },
  { time: '2026-11-03T14:00', temperature: 25, weatherCode: 0, precipitationChance: 40, isDay: true },
];
const days: DailyForecast[] = [
  { date: '2026-11-02', weatherCode: 0, maxTemp: 27, minTemp: 16, precipitationChance: 0 },
  { date: '2026-11-03', weatherCode: 0, maxTemp: 25, minTemp: 15, precipitationChance: 0 },
  { date: '2026-11-04', weatherCode: 0, maxTemp: 21, minTemp: 11, precipitationChance: 40 },
  { date: '2026-11-05', weatherCode: 0, maxTemp: 24, minTemp: 13, precipitationChance: 20 },
];
function makeForecast(utcOffsetSeconds = 0): Forecast {
  // The date-filtering functions only consume these 3 fields.
  return { utcOffsetSeconds, hourly: hours, daily: days } as Forecast;
}

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-03T10:45:00.000Z'));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('forecast utilities', () => {
  it('returns the current and future hours, without earlier cached hours', () => {
    expect(getUpcomingHours(makeForecast(), 2).map((h) => h.time)).toEqual([
      '2026-11-03T10:00',
      '2026-11-03T11:00',
    ]);
  });

  it('uses the weather location timezone offset when selecting upcoming hours', () => {
    // At 10:45 UTC it is 13:45 in Amman (UTC+3).
    expect(getUpcomingHours(makeForecast(10800), 2).map((h) => h.time)).toEqual([
      '2026-11-03T13:00',
      '2026-11-03T14:00',
    ]);
  });

  it('returns no hours if all cached hours are in the past', () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-07T10:00:00.000Z'));
    expect(getUpcomingHours(makeForecast())).toEqual([]);
  });

  it('excludes past days from an extended forecast', () => {
    expect(getUpcomingDays(makeForecast()).map((d) => d.date)).toEqual([
      '2026-11-03', '2026-11-04', '2026-11-05',
    ]);
  });

  it('handles midnight crossing in the city timezone', () => {
    // 22:30 UTC on Nov 3 becomes 01:30 on Nov 4 at UTC+3.
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-03T22:30:00.000Z'));
    expect(getUpcomingDays(makeForecast(10800)).map((d) => d.date)).toEqual([
      '2026-11-04', '2026-11-05',
    ]);
  });

  it('calculates the common min/max scale for temperature bars', () => {
    expect(getTemperatureRange(days)).toEqual({ min: 11, max: 27 });
  });

  it('labels the first displayed day as Today', () => {
    expect(formatDayLabel('2026-11-03', 0)).toBe('Today');
  });

  it('formats same-month ranges without repeating the month', () => {
    // Month name follows the operating system locale; assert the stable portion.
    expect(formatDateRange('2026-10-25', '2026-10-31')).toMatch(/^25 – 31 /);
  });

  it('turns Error objects and non-Error values into user-readable messages', () => {
    expect(errorMessage(new Error('No connection'))).toBe('No connection');
    expect(errorMessage('Unknown error')).toBe('Unknown error');
  });
});
