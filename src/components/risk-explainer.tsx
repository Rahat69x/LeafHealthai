import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Assessment } from "@/lib/agri-intelligence";
import type { RiskLevel } from "@/lib/weather";

export const levelTone: Record<RiskLevel, string> = {
  Low: "border-fern/40 bg-fern/15 text-fern-ink",
  Medium: "border-amber/50 bg-amber/20 text-amber-ink",
  High: "border-destructive/40 bg-destructive/10 text-destructive-ink",
  "Very High": "border-destructive bg-destructive/20 text-destructive-ink",
};

export const levelDotClass: Record<RiskLevel, string> = {
  Low: "bg-fern",
  Medium: "bg-amber",
  High: "bg-destructive/70",
  "Very High": "bg-destructive",
};

export function LevelDot({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-block size-2.5 shrink-0 rounded-full ${levelDotClass[level]}`}
      aria-hidden="true"
    />
  );
}

export const levelBar: Record<RiskLevel, string> = {
  Low: "bg-fern",
  Medium: "bg-amber",
  High: "bg-destructive/80",
  "Very High": "bg-destructive",
};

export function RiskExplainer({ assessment }: { assessment: Assessment }) {
  const {
    level,
    percent,
    drivers,
    diseases,
    confirmed,
    dataQuality,
    dataNote,
    summary,
    season,
    place,
  } = assessment;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="risk-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="risk-heading" className="text-lg font-bold text-foreground">
            Disease risk right now
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {place} · {season} season · environmental estimate, not a diagnosis
          </p>
        </div>
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${levelTone[level]}`}
        >
          <LevelDot level={level} /> {level} risk
        </Badge>
      </div>

      {dataQuality === "insufficient" ? (
        <p className="mt-4 flex gap-2 rounded-2xl border border-amber/50 bg-amber/10 p-3 text-sm text-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-ink" aria-hidden="true" />
          Disease risk cannot be estimated accurately right now because the weather data is
          incomplete.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${levelBar[level]}`}
                style={{ width: `${Math.max(6, percent)}%` }}
                role="img"
                aria-label={`Risk ${percent} out of 100`}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Risk score {percent}/100 · {dataNote}
            </p>
          </div>

          <p className="mt-4 rounded-2xl border bg-muted/30 p-4 text-sm font-medium text-foreground">
            {summary}
          </p>

          <h3 className="mt-5 text-sm font-bold text-foreground">
            Why is the risk {level.toLowerCase()}?
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {drivers.map((driver) => (
              <li key={driver} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>{driver}</span>
              </li>
            ))}
          </ul>

          {diseases.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-bold text-foreground">
                Diseases the weather favours
              </h3>
              <ul className="mt-2 space-y-2">
                {diseases.map((item) => (
                  <li key={item.disease} className="rounded-2xl border bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.disease}</span>
                      <Badge variant="outline" className={`rounded-full ${levelTone[item.level]}`}>
                        {item.level} chance
                      </Badge>
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                      {item.because.map((line) => (
                        <li key={line}>· {line}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex gap-2 rounded-2xl border bg-muted/20 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Confirmed disease</span> comes only from
            a leaf photo check.{" "}
            {confirmed
              ? `Your last scan found ${confirmed.disease} on ${confirmed.plant} (${confirmed.confidence}% confidence).`
              : "You have not scanned a leaf yet on this device."}
          </p>
        </div>
        <div className="flex gap-2 rounded-2xl border bg-muted/20 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Estimated risk</span> on this page comes
            from weather, season and your area. It shows how likely a disease is, never that a plant
            is already sick.
          </p>
        </div>
      </div>
    </section>
  );
}
