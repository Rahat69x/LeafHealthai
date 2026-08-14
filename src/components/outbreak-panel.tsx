import { Droplet, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWhen } from "@/lib/history";
import type { NearbyReport, Outbreak } from "@/lib/outbreak";

const levelTone = {
  Outbreak: "border-destructive/60 bg-destructive/10",
  Warning: "border-amber/60 bg-amber/10",
  Watch: "border-muted bg-muted/40",
} as const;

const dotTone = {
  Outbreak: "bg-destructive",
  Warning: "bg-amber",
  Watch: "bg-muted-foreground",
} as const;

/** Simple map: reports are placed by latitude and longitude inside the box. */
function OutbreakMap({ points }: { points: Outbreak[] }) {
  if (!points.length) return null;
  const lats = points.map((point) => point.latitude);
  const lons = points.map((point) => point.longitude);
  const minLat = Math.min(...lats) - 0.7;
  const maxLat = Math.max(...lats) + 0.7;
  const minLon = Math.min(...lons) - 0.7;
  const maxLon = Math.max(...lons) + 0.7;

  return (
    <div
      className="relative h-64 overflow-hidden rounded-2xl border bg-gradient-to-b from-fern/10 to-primary/5"
      role="img"
      aria-label="Map of reported outbreaks"
    >
      {points.map((point) => {
        const left = ((point.longitude - minLon) / (maxLon - minLon)) * 100;
        const top = 100 - ((point.latitude - minLat) / (maxLat - minLat)) * 100;
        return (
          <div
            key={`${point.area}-${point.disease}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span
              className={`mx-auto block size-3 rounded-full ring-4 ring-background ${dotTone[point.level]}`}
            />
            <span className="mt-1 block whitespace-nowrap rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground">
              {point.disease} · {point.area.split(",")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OutbreakPanel({
  outbreaks,
  nearby,
}: {
  outbreaks: Outbreak[];
  nearby: NearbyReport[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Outbreak watch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outbreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No outbreak signal yet. When the same disease is reported several times in one area
              within two weeks, an alert appears here.
            </p>
          ) : (
            <>
              <OutbreakMap points={outbreaks} />
              {outbreaks.map((outbreak) => (
                <div
                  key={`${outbreak.area}-${outbreak.disease}`}
                  className={`rounded-2xl border p-4 ${levelTone[outbreak.level]}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <ShieldCheck className="size-4" aria-hidden="true" />
                      Possible {outbreak.disease} outbreak in {outbreak.area}
                    </p>
                    <Badge variant={outbreak.level === "Outbreak" ? "destructive" : "secondary"}>
                      {outbreak.level}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {outbreak.reports} reports in the last 14 days ({outbreak.recent} this week,
                    trend {outbreak.trend.toLowerCase()}). Affected crops:{" "}
                    {outbreak.crops.join(", ")}.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-foreground">What to do now</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {outbreak.actions.map((action) => (
                      <li key={action} className="ml-4 list-disc">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplet className="size-5 text-primary" aria-hidden="true" /> Nearby disease reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearby.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports near you in the last 30 days.
            </p>
          ) : (
            <ul className="space-y-2">
              {nearby.map((report) => (
                <li
                  key={`${report.area}-${report.disease}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{report.disease}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.area}
                      {report.distanceKm !== null
                        ? ` · about ${report.distanceKm} km away`
                        : ""} · {report.crops.join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last report {formatWhen(report.lastSeen).date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{report.count} reports</Badge>
                    <p className="mt-1 text-sm text-muted-foreground">Trend: {report.trend}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
