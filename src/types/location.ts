export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** A place the forecast is shown for. */
export type Place = Coordinates & {
  name: string;
  region?: string;
  country?: string;
};

/** A place the user added manually; `id` comes from the geocoding API. */
export type SavedLocation = Place & {
  id: string;
};
