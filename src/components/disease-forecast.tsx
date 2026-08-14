import { Badge } from "@/components/ui/badge";
import { LevelDot, levelBar, levelTone } from "@/components/risk-explainer";
import type { Assessment } from "@/lib/agri-intelligence";

export function DiseaseForecast({ assessment }: { assessment: Assessment }) {
  const days = assessment.forecast;
  if (!days.length) return null;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="disease-forecast-heading"
    >
      <h2 id="disease-forecast-heading" className="text-lg font-bold text-foreground">
        Seven day disease risk forecast
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Built from the weather forecast for {assessment.place}. This is a risk estimate, not a
        confirmed diagnosis.
      </p>

      <div className="mt-5 grid grid-cols-7 items-end gap-1.5 sm:gap-3">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">{day.percent}</span>
            <div className="flex h-24 w-full items-end rounded-lg bg-muted/50">
              <div
                className={`w-full rounded-lg transition-all duration-700 ${levelBar[day.level]}`}
                style={{ height: `${Math.max(10, day.percent)}%` }}
                role="img"
                aria-label={`${day.label}: ${day.level} risk`}
              />
            </div>
            <span className="text-center text-[11px] leading-tight text-muted-foreground">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2">
        {days.map((day) => (
          <li key={day.date} className="rounded-2xl border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <LevelDot level={day.level} /> {day.label}
              </span>
              <Badge variant="outline" className={`rounded-full ${levelTone[day.level]}`}>
                {day.level} risk
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{day.why}</p>
            {day.watch.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Watch for: {day.watch.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>

      {assessment.futureWatch.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber/50 bg-amber/10 p-4">
          <h3 className="text-sm font-bold text-foreground">Diseases that may appear soon</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This is a risk prediction from weather patterns, not a confirmed diagnosis.
          </p>
          <ul className="mt-2 space-y-2">
            {assessment.futureWatch.map((item) => (
              <li key={`${item.disease}-${item.window}`} className="text-sm text-foreground">
                <span className="font-semibold">{item.disease}</span> — possible around{" "}
                {item.window}. <span className="text-muted-foreground">{item.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
