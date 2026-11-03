import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useForecast } from '@/hooks/useForecast';
import { fetchForecast } from '@/services/weatherApi';
import type { Forecast } from '@/types/weather';

// Mock the data boundary only: the real hook and its loading/error/refresh logic run.
jest.mock('@/services/weatherApi', () => ({ fetchForecast: jest.fn() }));
const mockFetchForecast = fetchForecast as jest.MockedFunction<typeof fetchForecast>;

const coords = { latitude: 31.95, longitude: 35.93 };
const forecast = { latitude: coords.latitude, longitude: coords.longitude, timezone: 'Asia/Amman' } as Forecast;
const updatedForecast = { ...forecast, timezone: 'UTC' } as Forecast;

beforeEach(() => {
  mockFetchForecast.mockReset();
});

describe('useForecast', () => {
  it('loads weather for the provided coordinates', async () => {
    mockFetchForecast.mockResolvedValue(forecast);

    // In React Native Testing Library v14, renderHook is async.
    const { result } = await renderHook(() => useForecast(coords));

    await waitFor(() => expect(result.current.forecast).toEqual(forecast));
    expect(mockFetchForecast).toHaveBeenCalledWith(coords);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes a useful error when the initial request fails', async () => {
    mockFetchForecast.mockRejectedValue(new Error('Weather service is offline'));
    const { result } = await renderHook(() => useForecast(coords));

    await waitFor(() => expect(result.current.error).toBe('Weather service is offline'));
    expect(result.current.loading).toBe(false);
    expect(result.current.forecast).toBeNull();
  });

  it('re-fetches weather when the user refreshes', async () => {
    mockFetchForecast.mockResolvedValueOnce(forecast).mockResolvedValueOnce(updatedForecast);
    const { result } = await renderHook(() => useForecast(coords));
    await waitFor(() => expect(result.current.forecast).toEqual(forecast));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockFetchForecast).toHaveBeenCalledTimes(2);
    expect(result.current.forecast).toEqual(updatedForecast);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('retries after a failed initial request', async () => {
    mockFetchForecast.mockRejectedValueOnce(new Error('Temporary outage')).mockResolvedValueOnce(forecast);
    const { result } = await renderHook(() => useForecast(coords));
    await waitFor(() => expect(result.current.error).toBe('Temporary outage'));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.forecast).toEqual(forecast);
    expect(result.current.error).toBeNull();
  });
});
