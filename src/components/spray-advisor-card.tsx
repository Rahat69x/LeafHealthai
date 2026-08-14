import { Droplet, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SprayAdvice } from "@/lib/spray-advisor";

const tone: Record<SprayAdvice["decision"], string> = {
  "spray-now": "border-fern/50 bg-fern/10",
  wait: "border-amber/50 bg-amber/10",
  "do-not-spray": "border-destructive/50 bg-destructive/10",
};

export function SprayAdvisorCard({ advice }: { advice: SprayAdvice }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Spray advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`rounded-2xl border p-4 ${tone[advice.decision]}`}>
          <p className="text-base font-semibold text-foreground">{advice.headline}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {advice.reasons.map((reason) => (
              <li key={reason} className="ml-4 list-disc">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {advice.nextRainLabel && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplet className="size-4" aria-hidden="true" /> Next likely rain:{" "}
            {advice.nextRainLabel}
          </p>
        )}

        {advice.windows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Good spraying times in the next 2 days
            </p>
            {advice.windows.map((window) => (
              <div key={window.start} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{window.label}</span>
                  <Badge variant="secondary">Suitability {window.score}%</Badge>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {window.notes.map((note) => (
                    <li key={note} className="ml-4 list-disc">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Droplet className="size-3.5" aria-hidden="true" /> Droplet above 15 km/h blows spray
            off the leaf
          </span>
          <span className="inline-flex items-center gap-1">
            <Droplet className="size-3.5" aria-hidden="true" /> Rain within 6 hours washes it away
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
