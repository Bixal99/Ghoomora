import { AlertTriangle, CloudRain, Snowflake, Sun, Thermometer, Wind } from "lucide-react";
import type { WeatherForecast } from "@/lib/route-types";
import { weatherLabel } from "@/lib/weather";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function riskClasses(level: "NORMAL" | "CAUTION" | "SEVERE") {
  if (level === "SEVERE") return "border-[#a64b42] bg-[#f8dfdc] text-[#7e2922]";
  if (level === "CAUTION") return "border-[#d4a14f] bg-[#fff4dc] text-[#805b21]";
  return "border-[#5b927f] bg-[#e2f1eb] text-[#23594c]";
}

export function WeatherForecastPanel({ forecast }: { forecast: WeatherForecast | null }) {
  if (!forecast) return <Card className="p-7"><CloudRain className="text-[#5a7f73]" /><h3 className="mt-4 text-xl font-extrabold">Forecast temporarily unavailable</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Confirm current mountain conditions with your operator or local authority before departure.</p></Card>;
  const current = forecast.days[0];
  return (
    <Card className="overflow-hidden">
      <div className="bg-[#173f35] p-7 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-accent">Seven-day outlook</p><h3 className="display-title mt-2 text-4xl">{forecast.destinationName}</h3></div><Badge className={riskClasses(current.risk.level)}>{current.risk.level === "NORMAL" ? <Sun size={13} /> : <AlertTriangle size={13} />} {current.risk.level} today</Badge></div><p className="mt-4 text-sm text-white/65">{weatherLabel(current.weatherCode)} · {current.temperatureMinC ?? "–"}° to {current.temperatureMaxC ?? "–"}°C · gusts {current.windGustMaxKmh ?? "–"} km/h</p></div>
      <div className="grid gap-px bg-border sm:grid-cols-7">{forecast.days.map((day) => <div key={day.date} className="bg-card p-4"><p className="text-xs font-extrabold">{new Intl.DateTimeFormat("en-PK", { weekday: "short" }).format(new Date(day.date + "T12:00:00"))}</p><p className="mt-2 text-xs text-muted-foreground">{weatherLabel(day.weatherCode)}</p><p className="mt-4 flex items-center gap-1 text-sm font-bold"><Thermometer size={14} /> {day.temperatureMaxC ?? "–"}°</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><CloudRain size={13} /> {day.precipitationMm ?? 0}mm</p>{(day.snowfallCm ?? 0) > 0 && <p className="mt-2 flex items-center gap-1 text-xs text-[#456782]"><Snowflake size={13} /> {day.snowfallCm}cm</p>}<Badge className={"mt-3 px-2 " + riskClasses(day.risk.level)}>{day.risk.level}</Badge></div>)}</div>
      <div className="border-t p-5"><div className="flex gap-3 text-xs leading-5 text-muted-foreground"><Wind size={16} className="shrink-0" /><p>This is a weather-based travel advisory, not a confirmed road-closure report. Confirm conditions with your operator or local authority. Forecast by Open-Meteo · updated {new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }).format(new Date(forecast.generatedAt))} PKT.</p></div>{current.risk.reasons.length > 0 && <p className="mt-3 text-xs font-bold text-[#805b21]">Today’s advisory: {current.risk.reasons.join(", ")}.</p>}</div>
    </Card>
  );
}

export function JourneyWeather({ forecasts }: { forecasts: Array<WeatherForecast | null> }) {
  const available = forecasts.filter((item): item is WeatherForecast => Boolean(item));
  if (!available.length) return <p className="text-sm text-muted-foreground">Weather outlooks are temporarily unavailable. Confirm conditions directly with the operator.</p>;
  return <div className="grid gap-3 md:grid-cols-2">{available.map((forecast) => { const today = forecast.days[0]; return <Card key={forecast.destinationId} className="p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-extrabold">{forecast.destinationName}</h4><p className="mt-1 text-xs text-muted-foreground">{weatherLabel(today.weatherCode)} · {today.temperatureMinC ?? "–"}° to {today.temperatureMaxC ?? "–"}°C</p></div><Badge className={riskClasses(today.risk.level)}>{today.risk.level}</Badge></div><div className="mt-4 flex gap-4 text-xs text-muted-foreground"><span className="flex gap-1"><CloudRain size={13} />{today.precipitationMm ?? 0}mm</span><span className="flex gap-1"><Wind size={13} />{today.windGustMaxKmh ?? 0}km/h gusts</span></div>{today.risk.reasons.length > 0 && <p className="mt-3 text-xs font-bold text-[#805b21]">{today.risk.reasons.join(", ")}</p>}</Card>; })}</div>;
}
