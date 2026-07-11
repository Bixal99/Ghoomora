import "server-only";
import type { DestinationView } from "@/lib/data";
import type { DailyWeather, TravelRisk, WeatherForecast } from "@/lib/route-types";

function numberAt(value: unknown, index: number): number | null {
  const item = Array.isArray(value) ? value[index] : null;
  return typeof item === "number" && Number.isFinite(item) ? item : null;
}

export function deriveTravelRisk(day: Omit<DailyWeather, "risk">): TravelRisk {
  const severe: string[] = [];
  const caution: string[] = [];
  if ((day.snowfallCm ?? 0) >= 5) severe.push("heavy snowfall");
  if ((day.precipitationMm ?? 0) >= 30) severe.push("heavy precipitation");
  if ((day.windGustMaxKmh ?? 0) >= 60) severe.push("dangerous wind gusts");
  if ([95, 96, 99].includes(day.weatherCode ?? -1)) severe.push("severe thunderstorm");
  if ((day.snowfallCm ?? 0) > 0) caution.push("snowfall");
  if ((day.precipitationMm ?? 0) >= 10) caution.push("significant precipitation");
  if ((day.temperatureMinC ?? Infinity) <= -10) caution.push("extreme cold");
  if ((day.windGustMaxKmh ?? 0) >= 35) caution.push("strong wind gusts");
  if ([45, 48].includes(day.weatherCode ?? -1)) caution.push("fog");
  if (severe.length) return { level: "SEVERE", reasons: severe };
  if (caution.length) return { level: "CAUTION", reasons: caution };
  return { level: "NORMAL", reasons: [] };
}

export function normalizeWeather(payload: unknown, destination: DestinationView): WeatherForecast {
  const root = payload as { generationtime_ms?: number; timezone?: string; daily?: Record<string, unknown> };
  const daily = root.daily ?? {};
  const dates = Array.isArray(daily.time) ? daily.time.filter((item): item is string => typeof item === "string").slice(0, 7) : [];
  const days = dates.map((date, index) => {
    const base = {
      date,
      weatherCode: numberAt(daily.weather_code, index),
      temperatureMaxC: numberAt(daily.temperature_2m_max, index),
      temperatureMinC: numberAt(daily.temperature_2m_min, index),
      precipitationMm: numberAt(daily.precipitation_sum, index),
      snowfallCm: numberAt(daily.snowfall_sum, index),
      windSpeedMaxKmh: numberAt(daily.wind_speed_10m_max, index),
      windGustMaxKmh: numberAt(daily.wind_gusts_10m_max, index),
    };
    return { ...base, risk: deriveTravelRisk(base) };
  });
  if (!days.length) throw new Error("Forecast response did not contain daily data.");
  return { destinationId: destination.id, destinationName: destination.name, generatedAt: new Date().toISOString(), timezone: root.timezone ?? "Asia/Karachi", days, provider: "open-meteo" };
}

export async function getWeatherForecast(destination: DestinationView): Promise<WeatherForecast | null> {
  const query = new URLSearchParams({
    latitude: String(destination.latitude), longitude: String(destination.longitude), elevation: String(destination.elevationMeters),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max",
    timezone: "Asia/Karachi", forecast_days: "7",
  });
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?" + query, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;
    return normalizeWeather(await response.json(), destination);
  } catch { return null; }
}

export function weatherLabel(code: number | null) {
  if (code === null) return "Forecast";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Mixed";
}
