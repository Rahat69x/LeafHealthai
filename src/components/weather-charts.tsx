import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { clockLabel, type HourPoint } from "@/lib/hourly-weather";
import { cn } from "@/lib/utils";

type MetricKey = "temperature" | "humidity" | "rain" | "wind" | "uvIndex" | "pressure";

const METRICS: {
  key: MetricKey;
  label: string;
  unit: string;
  shape: "area" | "line" | "bar";
  colour: string;
}[] = [
  { key: "temperature", label: "Temperature", unit: "°C", shape: "area", colour: "var(--primary)" },
  { key: "humidity", label: "Humidity", unit: "%", shape: "area", colour: "var(--sky, #2f7d95)" },
  { key: "rain", label: "Rain", unit: "mm", shape: "bar", colour: "var(--sky, #2f7d95)" },
  { key: "wind", label: "Wind", unit: "km/h", shape: "line", colour: "var(--fern, #6b7f4a)" },
  { key: "uvIndex", label: "UV index", unit: "", shape: "line", colour: "var(--amber, #c9a227)" },
  {
    key: "pressure",
    label: "Pressure",
    unit: "hPa",
    shape: "line",
    colour: "var(--muted-foreground)",
  },
];

export function WeatherCharts({ hours }: { hours: HourPoint[] }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("temperature");
  const metric = METRICS.find((item) => item.key === metricKey) ?? METRICS[0]!;

  const data = hours.slice(0, 36).map((hour) => ({
    label: clockLabel(hour.time),
    value: hour[metric.key],
  }));

  const tooltip = (
    <Tooltip
      cursor={{ stroke: "var(--border)" }}
      contentStyle={{
        borderRadius: "0.75rem",
        border: "1px solid var(--border)",
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        fontSize: "0.8rem",
      }}
      formatter={(value: number) => [`${value}${metric.unit}`, metric.label]}
    />
  );

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fontSize: 11 }}
        interval={3}
        tickLine={false}
        axisLine={false}
      />
      <YAxis tick={{ fontSize: 11 }} width={38} tickLine={false} axisLine={false} />
    </>
  );

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="charts-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="charts-heading" className="text-lg font-bold text-foreground">
            Next 36 hours in detail
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hover or tap any point to read the exact value for that hour.
          </p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Choose a weather measure">
          {METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMetricKey(item.key)}
              aria-pressed={item.key === metricKey}
              className={cn(
                "min-h-9 rounded-full border px-3 text-xs font-semibold transition",
                item.key === metricKey
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric.shape === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              {axes}
              {tooltip}
              <Bar dataKey="value" fill={metric.colour} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : metric.shape === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              {axes}
              {tooltip}
              <Area
                dataKey="value"
                stroke={metric.colour}
                fill={metric.colour}
                fillOpacity={0.18}
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              {axes}
              {tooltip}
              <Line
                dataKey="value"
                stroke={metric.colour}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="sr-only">
        {metric.label} over the next 36 hours, from {data[0]?.value ?? 0}
        {metric.unit} to {data[data.length - 1]?.value ?? 0}
        {metric.unit}.
      </p>
    </section>
  );
}

export default WeatherCharts;
