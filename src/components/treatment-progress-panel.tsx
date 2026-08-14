import { ArrowRight, Droplet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { formatWhen } from "@/lib/history";
import { buildCases } from "@/lib/treatment-progress";

const trendTone = {
  Recovered: "bg-fern text-white",
  Improving: "bg-fern/20 text-fern-ink",
  "No change": "bg-muted text-muted-foreground",
  Worsening: "bg-destructive/15 text-destructive-ink",
} as const;

export function TreatmentProgress({ history }: { history: AnalysisResult[] }) {
  const cases = buildCases(history);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Treatment progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {cases.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Check the same plant again after a few days. Then you will see here whether the disease
            is healing or spreading.
          </p>
        )}

        {cases.map((item) => (
          <div key={item.key} className="rounded-2xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {item.plant} · {item.disease}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.steps.length} checks over {item.days} days
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${trendTone[item.trend]}`}
              >
                {item.trend === "Worsening" ? (
                  <Droplet className="size-4" aria-hidden="true" />
                ) : (
                  <Droplet className="size-4" aria-hidden="true" />
                )}
                {item.trend}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recovery</span>
                <span className="font-semibold text-foreground">{item.recovery}%</span>
              </div>
              <Progress value={item.recovery} className="mt-1" />
            </div>

            <p className="mt-3 text-sm text-foreground">{item.note}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <figure className="space-y-1">
                {item.first.image && (
                  <img
                    src={item.first.image}
                    alt={`First check of ${item.plant}`}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                )}
                <figcaption className="text-xs text-muted-foreground">
                  First check · {formatWhen(item.first.date).date} · {item.first.severity}
                </figcaption>
              </figure>
              <ArrowRight
                className="mx-auto hidden size-5 text-muted-foreground sm:block"
                aria-hidden="true"
              />
              <figure className="space-y-1">
                {item.latest.image && (
                  <img
                    src={item.latest.image}
                    alt={`Latest check of ${item.plant}`}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                )}
                <figcaption className="text-xs text-muted-foreground">
                  Latest check · {formatWhen(item.latest.date).date} ·{" "}
                  {item.latest.healthy ? "Healthy" : item.latest.severity}
                </figcaption>
              </figure>
            </div>

            <ol className="mt-4 space-y-1 text-sm text-muted-foreground">
              {item.steps.map((step) => (
                <li key={step.scan.id} className="flex items-center justify-between gap-2">
                  <span>
                    {formatWhen(step.scan.date).date} ·{" "}
                    {step.scan.healthy ? "Healthy" : `${step.scan.disease} (${step.scan.severity})`}
                  </span>
                  <Badge variant="secondary">Leaf health {step.score}</Badge>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
