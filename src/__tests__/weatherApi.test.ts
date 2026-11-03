import { fetchForecast, FORECAST_DAYS } from '@/services/weatherApi';

/** A small, deterministic Open-Meteo response; no real network calls occur. */
const apiResponse = {
  latitude: 31.95,
  longitude: 35.93,
  timezone: 'Asia/Amman',
  utc_offset_seconds: 10800,
  current: {
    time: '2026-11-03T12:00',
    temperature_2m: 22.5,
    apparent_temperature: 21.1,
    weather_code: 3,
    is_day: 1,
    relative_humidity_2m: 47,
    wind_speed_10m: 13.5,
  },
  hourly: {
    time: ['2026-11-03T12:00', '2026-11-03T13:00'],
    temperature_2m: [22, 23],
    weather_code: [3, 0],
    precipitation_probability: [null, 10],
    is_day: [1, 0],
  },
  daily: {
    time: ['2026-11-03', '2026-11-04'],
    weather_code: [3, 61],
    temperature_2m_max: [24, 19],
    temperature_2m_min: [15, 11],
    precipitation_probability_max: [null, 80],
  },
};

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  jest.spyOn(Date, 'now').mockReturnValue(1793696400000);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe('fetchForecast', () => {
  it('requests the correct coordinates, timezone, and forecast length', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => apiResponse });

    await fetchForecast({ latitude: 31.95, longitude: 35.93 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain('https://api.open-meteo.com/v1/forecast?');
    expect(requestedUrl).toContain('latitude=31.95');
    expect(requestedUrl).toContain('longitude=35.93');
    expect(requestedUrl).toContain('timezone=auto');
    expect(requestedUrl).toContain(`forecast_days=${FORECAST_DAYS}`);
    expect(requestedUrl).toContain('forecast_hours=48');
  });

  it('converts the Open-Meteo response into the app Forecast model', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => apiResponse });

    const forecast = await fetchForecast({ latitude: 31.95, longitude: 35.93 });

    expect(forecast).toEqual({
      latitude: 31.95,
      longitude: 35.93,
      timezone: 'Asia/Amman',
      utcOffsetSeconds: 10800,
      current: {
        time: '2026-11-03T12:00',
        temperature: 22.5,
        apparentTemperature: 21.1,
        weatherCode: 3,
        isDay: true,
        humidity: 47,
        windSpeed: 13.5,
      },
      hourly: [
        { time: '2026-11-03T12:00', temperature: 22, weatherCode: 3, precipitationChance: null, isDay: true },
        { time: '2026-11-03T13:00', temperature: 23, weatherCode: 0, precipitationChance: 10, isDay: false },
      ],
      daily: [
        { date: '2026-11-03', weatherCode: 3, maxTemp: 24, minTemp: 15, precipitationChance: null },
        { date: '2026-11-04', weatherCode: 61, maxTemp: 19, minTemp: 11, precipitationChance: 80 },
      ],
      fetchedAt: 1793696400000,
    });
  });

  it('throws a useful error for a non-success HTTP status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    await expect(fetchForecast({ latitude: 31.95, longitude: 35.93 })).rejects.toThrow(
      'Weather API returned 503',
    );
  });

  it('propagates a network failure instead of returning an invalid forecast', async () => {
    fetchMock.mockRejectedValue(new Error('Network unavailable'));

    await expect(fetchForecast({ latitude: 31.95, longitude: 35.93 })).rejects.toThrow(
      'Network unavailable',
    );
  });
});
