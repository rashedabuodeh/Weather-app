import type { DailyForecast, Forecast, HourlyForecast } from '@/types/weather';

/** Current local time at the location as "YYYY-MM-DDTHH", comparable with API time strings. */
function localHourKey(utcOffsetSeconds: number) {
  return new Date(Date.now() + utcOffsetSeconds * 1000).toISOString().slice(0, 13);
}

/** Hours from the current hour onward (a cached forecast may start earlier). */
export function getUpcomingHours(forecast: Forecast, count = 24): HourlyForecast[] {
  const nowKey = localHourKey(forecast.utcOffsetSeconds);
  const start = forecast.hourly.findIndex((h) => h.time.slice(0, 13) >= nowKey);
  return start === -1 ? [] : forecast.hourly.slice(start, start + count);
}

/** Days from today onward at the location. */
export function getUpcomingDays(forecast: Forecast): DailyForecast[] {
  const today = localHourKey(forecast.utcOffsetSeconds).slice(0, 10);
  return forecast.daily.filter((d) => d.date >= today);
}

export function formatHour(time: string) {
  // API times have no offset, so they parse as wall-clock time, which is what we want to show.
  return new Date(time).toLocaleTimeString([], { hour: 'numeric' });
}

// Parse as noon so the date doesn't shift across timezones.
function parseDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

/** "Today", then short weekday and day of month ("Sun 19") so repeated weekdays stay clear. */
export function formatDayLabel(date: string, index: number) {
  if (index === 0) return 'Today';
  const d = parseDate(date);
  return `${d.toLocaleDateString(undefined, { weekday: 'short' })} ${d.getDate()}`;
}

/** "25 – 31 Oct", or "28 Oct – 3 Nov" across months. */
export function formatDateRange(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const month = (d: Date) => d.toLocaleDateString(undefined, { month: 'short' });
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()} – ${end.getDate()} ${month(end)}`
    : `${start.getDate()} ${month(start)} – ${end.getDate()} ${month(end)}`;
}

/** Lowest min and highest max across the days, the shared scale for temperature bars. */
export function getTemperatureRange(days: DailyForecast[]) {
  return {
    min: Math.min(...days.map((d) => d.minTemp)),
    max: Math.max(...days.map((d) => d.maxTemp)),
  };
}

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
