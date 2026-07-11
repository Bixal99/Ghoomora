"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ElevationSample } from "@/lib/route-types";

export function ElevationChart({
  data,
  minElevation,
  maxElevation,
  onProgressChange,
}: {
  data: ElevationSample[];
  minElevation: number;
  maxElevation: number;
  onProgressChange?: (progress: number) => void;
}) {
  const chartData = data.map((item) => ({ ...item, distanceKm: Number((item.distanceMeters / 1000).toFixed(1)) }));
  return (
    <div className="h-64" tabIndex={0} aria-label={`Elevation ranges from ${minElevation} to ${maxElevation} metres`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          onMouseMove={(state) => {
            if (!onProgressChange || state?.activeTooltipIndex == null) return;
            const index = Number(state.activeTooltipIndex);
            if (Number.isFinite(index)) onProgressChange(index / Math.max(1, chartData.length - 1));
          }}
        >
          <defs>
            <linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#397668" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#397668" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,37,31,.12)" />
          <XAxis dataKey="distanceKm" unit=" km" tick={{ fontSize: 11 }} />
          <YAxis unit="m" width={54} tick={{ fontSize: 11 }} domain={["dataMin - 100", "dataMax + 100"]} />
          <Tooltip formatter={(value) => [Number(value).toLocaleString() + " m", "Elevation"]} labelFormatter={(value) => value + " km"} />
          <Area type="monotone" dataKey="elevationMeters" stroke="#173f35" strokeWidth={2} fill="url(#elevationFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
