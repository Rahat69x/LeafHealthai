import { Droplet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IrrigationAdvice } from "@/lib/irrigation-advisor";

const tone: Record<IrrigationAdvice["action"], string> = {
  water: "border-fern/50 bg-fern/10",
  "water-morning": "border-fern/50 bg-fern/10",
  reduce: "border-amber/50 bg-amber/10",
  skip: "border-primary/40 bg-primary/5",
};

export function IrrigationCard({ advice }: { advice: IrrigationAdvice }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplet className="size-5 text-primary" aria-hidden="true" /> Irrigation advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`rounded-2xl border p-4 ${tone[advice.action]}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-semibold text-foreground">{advice.headline}</p>
            {advice.adjustPercent !== 0 && (
              <Badge variant="secondary">
                {advice.adjustPercent > 0
                  ? `+${advice.adjustPercent}% water`
                  : `${advice.adjustPercent}% water`}
              </Badge>
            )}
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {advice.reasons.map((reason) => (
              <li key={reason} className="ml-4 list-disc">
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">Best time to water: {advice.bestTime}</p>
        <p className="text-sm text-muted-foreground">
          Rain expected in the next 2 days: {advice.rainNext48} mm.
        </p>
      </CardContent>
    </Card>
  );
}
