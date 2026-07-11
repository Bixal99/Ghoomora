import { describe, expect, it, vi } from "vitest";
import type { DestinationView } from "../lib/data";
import { deriveTravelRisk, normalizeWeather, weatherLabel } from "../lib/weather";

vi.mock("server-only", () => ({}));

const destination: DestinationView = {
  id: "deosai", name: "Deosai", slug: "deosai", latitude: 35.03, longitude: 75.41, elevationMeters: 4250,
  difficulty: "hard", description: "Plateau", bestSeasonStart: 6, bestSeasonEnd: 9, requiresLocalTransport: true,
  localTransportNote: "4x4", heroImageUrl: null, region: { id: "gb", name: "Gilgit-Baltistan", slug: "gilgit-baltistan" },
};

const baseDay = { date: "2026-07-11", weatherCode: 0, temperatureMaxC: 20, temperatureMinC: 8, precipitationMm: 0, snowfallCm: 0, windSpeedMaxKmh: 10, windGustMaxKmh: 15 };

describe("weather travel risk", () => {
  it.each([
    [{ snowfallCm: 5 }, "heavy snowfall"],
    [{ precipitationMm: 30 }, "heavy precipitation"],
    [{ windGustMaxKmh: 60 }, "dangerous wind gusts"],
    [{ weatherCode: 95 }, "severe thunderstorm"],
  ])("marks severe conditions", (change, reason) => {
    const risk = deriveTravelRisk({ ...baseDay, ...change });
    expect(risk.level).toBe("SEVERE");
    expect(risk.reasons).toContain(reason);
  });
  it.each([
    [{ snowfallCm: 1 }, "snowfall"],
    [{ precipitationMm: 10 }, "significant precipitation"],
    [{ temperatureMinC: -10 }, "extreme cold"],
    [{ windGustMaxKmh: 35 }, "strong wind gusts"],
    [{ weatherCode: 45 }, "fog"],
  ])("marks caution conditions", (change, reason) => {
    const risk = deriveTravelRisk({ ...baseDay, ...change });
    expect(risk.level).toBe("CAUTION");
    expect(risk.reasons).toContain(reason);
  });
  it("keeps ordinary conditions normal", () => expect(deriveTravelRisk(baseDay)).toEqual({ level: "NORMAL", reasons: [] }));
});

describe("weather normalization", () => {
  it("normalizes nullable daily arrays without inventing values", () => {
    const forecast = normalizeWeather({ timezone: "Asia/Karachi", daily: { time: ["2026-07-11"], weather_code: [2], temperature_2m_max: [12], temperature_2m_min: [3], precipitation_sum: [null], snowfall_sum: [0], wind_speed_10m_max: [20], wind_gusts_10m_max: [40] } }, destination);
    expect(forecast.days[0]).toMatchObject({ weatherCode: 2, temperatureMaxC: 12, precipitationMm: null, risk: { level: "CAUTION", reasons: ["strong wind gusts"] } });
    expect(forecast.provider).toBe("open-meteo");
  });
  it("rejects responses without daily dates", () => expect(() => normalizeWeather({ daily: {} }, destination)).toThrow(/daily data/));
  it("maps common WMO groups to readable labels", () => {
    expect(weatherLabel(0)).toBe("Clear");
    expect(weatherLabel(71)).toBe("Snow");
    expect(weatherLabel(95)).toBe("Thunderstorm");
  });
});
