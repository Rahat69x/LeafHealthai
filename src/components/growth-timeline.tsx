import { useMemo, useState } from "react";
import { Droplet } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { buildTimelines, type PlantTimeline } from "@/lib/timeline";

const TREND_STYLE = {
  Recovered: "border-fern/40 bg-fern/15 text-fern-ink",
  Improving: "border-fern/40 bg-fern/15 text-fern-ink",
  Steady: "border-amber/40 bg-amber/15 text-amber-ink",
  Worsening: "border-destructive/40 bg-destructive/10 text-destructive-ink",
} as const;

function TimelineView({ timeline }: { timeline: PlantTimeline }) {
  const chart = timeline.points.map((point) => ({
    day: `Day ${point.day}`,
    Health: point.health,
    Damage: point.severity,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{timeline.tag}</p>
          <p className="text-xs text-muted-foreground">
            {timeline.points.length} checks over {timeline.days} days · {timeline.plant}
          </p>
        </div>
        <Badge variant="outline" className={`shrink-0 rounded-full ${TREND_STYLE[timeline.trend]}`}>
          {timeline.trend === "Worsening" ? (
            <Droplet className="size-3.5" aria-hidden="true" />
          ) : (
            <Droplet className="size-3.5" aria-hidden="true" />
          )}
          {timeline.trend}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl border bg-muted">
          <img
            src={timeline.first.image}
            alt={`First check of ${timeline.tag}`}
            className="h-44 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="border-t bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            First check · {new Date(timeline.first.date).toLocaleDateString()}
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-2xl border bg-muted">
          <img
            src={timeline.latest.image}
            alt={`Latest check of ${timeline.tag}`}
            className="h-44 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="border-t bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            Latest check · {new Date(timeline.latest.date).toLocaleDateString()}
          </figcaption>
        </figure>
      </div>

      <div className="h-56 w-full rounded-2xl border bg-background/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--popover-foreground)",
              }}
            />
            <Line type="monotone" dataKey="Health" stroke="var(--fern)" strokeWidth={2.5} dot />
            <Line
              type="monotone"
              dataKey="Damage"
              stroke="var(--destructive)"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Health change</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {timeline.healthChange > 0 ? "+" : ""}
            {timeline.healthChange} points
          </p>
        </div>
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Recovery</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {Math.max(0, timeline.recovery)}%
          </p>
        </div>
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Days watched</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{timeline.days}</p>
        </div>
      </div>

      <ul className="space-y-1.5 text-sm text-foreground">
        {timeline.summary.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {(timeline.improvements.length > 0 || timeline.newSymptoms.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {timeline.improvements.length > 0 && (
            <div className="rounded-xl border bg-background/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-fern-ink">
                Gone since the first check
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {timeline.improvements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {timeline.newSymptoms.length > 0 && (
            <div className="rounded-xl border bg-background/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-ink">
                New since the first check
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {timeline.newSymptoms.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Growth and recovery timeline for every plant the user follows by name. */
export function GrowthTimeline({ history }: { history: AnalysisResult[] }) {
  const timelines = useMemo(() => buildTimelines(history), [history]);
  const [active, setActive] = useState(0);
  const current = timelines[Math.min(active, timelines.length - 1)];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplet className="size-5 text-primary" aria-hidden="true" /> Growth and recovery
        </CardTitle>
        <CardDescription>
          Give a plant the same name each time you check it, and we show how it changes over the
          days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!current ? (
          <div className="rounded-2xl border border-dashed p-6 text-center">
            <Droplet className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-foreground">No timeline yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check the same plant at least twice, using the same plant name, to see its progress
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelines.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {timelines.map((timeline, index) => (
                  <Button
                    key={timeline.tag}
                    variant={index === active ? "default" : "outline"}
                    className="min-h-11"
                    onClick={() => setActive(index)}
                  >
                    {timeline.tag}
                  </Button>
                ))}
              </div>
            )}
            <TimelineView timeline={current} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
