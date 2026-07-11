"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatPKR } from "@/lib/utils";

export function AnalyticsDashboard({ data }: { data: { bookingsByRegion: { region: string; count: number }[]; revenueTotal: number; popularDestinations: { name: string; count: number }[]; bookingCount: number } }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-7"><p className="text-sm text-muted-foreground">Total bookings</p><p className="text-4xl font-extrabold">{data.bookingCount}</p><p className="mt-2 text-sm">Revenue tracked: {formatPKR(data.revenueTotal)}</p></Card>
      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Bookings by region</h2>
        <div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.bookingsByRegion}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#173f35" /></BarChart></ResponsiveContainer></div>
      </Card>
      <Card className="p-7 lg:col-span-2">
        <h2 className="text-xl font-extrabold">Popular destinations</h2>
        <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.popularDestinations}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#397668" /></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  );
}
