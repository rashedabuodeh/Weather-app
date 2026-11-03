import { searchPlaces } from '@/services/geocoding';

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('searchPlaces', () => {
  it('encodes a city query and requests up to 10 English results', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });

    await searchPlaces('New York');

    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain('https://geocoding-api.open-meteo.com/v1/search?');
    expect(requestedUrl).toMatch(/name=New(?:\+|%20)York/);
    expect(requestedUrl).toContain('count=10');
    expect(requestedUrl).toContain('language=en');
    expect(requestedUrl).toContain('format=json');
  });

  it('maps results into SavedLocation objects with string IDs', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 250441, name: 'Amman', latitude: 31.955, longitude: 35.945, admin1: 'Amman', country: 'Jordan' },
          { id: 123, name: 'Example', latitude: 30, longitude: 36 },
        ],
      }),
    });

    const results = await searchPlaces('Amman');

    expect(results).toEqual([
      { id: '250441', name: 'Amman', region: 'Amman', country: 'Jordan', latitude: 31.955, longitude: 35.945 },
      { id: '123', name: 'Example', region: undefined, country: undefined, latitude: 30, longitude: 36 },
    ]);
  });

  it('returns an empty array when the API has no results field', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await expect(searchPlaces('unfindable-city')).resolves.toEqual([]);
  });

  it('throws a clear message on an unsuccessful response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 });

    await expect(searchPlaces('Amman')).rejects.toThrow('Location search returned 429');
  });

  it('propagates request errors', async () => {
    fetchMock.mockRejectedValue(new Error('Offline'));

    await expect(searchPlaces('Amman')).rejects.toThrow('Offline');
  });
});
