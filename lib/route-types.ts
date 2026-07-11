export type RouteCoordinate = [longitude: number, latitude: number, elevation: number];

export type RouteWaypoint = {
  index: number;
  dayNumber: number;
  stopType: string;
  destinationId: string;
  destinationName: string;
  destinationSlug: string;
  coordinate: RouteCoordinate;
  requiresLocalTransport: boolean;
};

export type RouteInstruction = {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  fromIndex: number;
  toIndex: number;
};

export type ElevationSample = {
  coordinateIndex: number;
  distanceMeters: number;
  elevationMeters: number;
};

export type RouteExtraSegment = {
  fromIndex: number;
  toIndex: number;
  value: number;
};

export type RouteResult = {
  geometry: { type: "LineString"; coordinates: RouteCoordinate[] };
  summary: {
    distanceMeters: number;
    durationSeconds: number;
    minimumElevationMeters: number;
    maximumElevationMeters: number;
    cumulativeAscentMeters: number;
  };
  waypoints: RouteWaypoint[];
  instructions: RouteInstruction[];
  elevationProfile: ElevationSample[];
  extras: { surface: RouteExtraSegment[]; steepness: RouteExtraSegment[]; waytype: RouteExtraSegment[] };
  provider: "openrouteservice";
};

export type RouteErrorBody = {
  code: "INVALID_REQUEST" | "PACKAGE_NOT_FOUND" | "ROUTE_NOT_POSSIBLE" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE";
  message: string;
  retryable: boolean;
};

export type TravelRisk = {
  level: "NORMAL" | "CAUTION" | "SEVERE";
  reasons: string[];
};

export type DailyWeather = {
  date: string;
  weatherCode: number | null;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  precipitationMm: number | null;
  snowfallCm: number | null;
  windSpeedMaxKmh: number | null;
  windGustMaxKmh: number | null;
  risk: TravelRisk;
};

export type WeatherForecast = {
  destinationId: string;
  destinationName: string;
  generatedAt: string;
  timezone: string;
  days: DailyWeather[];
  provider: "open-meteo";
};
