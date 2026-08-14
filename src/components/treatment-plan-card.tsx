import { Droplet, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buildTreatmentPlan, type PlanWeather } from "@/lib/treatment-plan";
import type { NutrientFinding } from "@/lib/nutrients";
import type { PestFinding } from "@/lib/pests";

const kindTone: Record<string, string> = {
  remove: "border-destructive/40 bg-destructive/10 text-destructive-ink",
  treat: "border-primary/40 bg-primary/10 text-primary",
  feed: "border-amber/50 bg-amber/20 text-amber-ink",
  check: "border-fern/40 bg-fern/15 text-fern-ink",
  prevent: "border-fern/40 bg-fern/15 text-fern-ink",
  scan: "border-primary/40 bg-primary/10 text-primary",
};

function Lines({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TreatmentPlanCardProps {
  plant: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  organic: string[];
  chemical: string[];
  prevention: string[];
  pests: PestFinding[];
  nutrients: NutrientFinding[];
  weather?: PlanWeather | null | undefined;
}

/** Day by day recovery plan built from the diagnosis, pests, food and weather. */
export function TreatmentPlanCard(props: TreatmentPlanCardProps) {
  const plan = buildTreatmentPlan({
    plant: props.plant,
    disease: props.disease,
    healthy: props.healthy,
    severity: props.severity,
    confidence: props.confidence,
    organic: props.organic,
    chemical: props.chemical,
    prevention: props.prevention,
    pests: props.pests,
    nutrients: props.nutrients,
    weather: props.weather ?? null,
  });

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="plan-heading">
      <p
        id="plan-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <Droplet className="size-4 text-primary" aria-hidden="true" /> Your treatment plan
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{plan.headline}</p>

      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
        <p className="flex gap-2 text-foreground">
          <Droplet className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="font-medium">Best time to spray:</span> {plan.sprayWindow}
          </span>
        </p>
        {plan.sprayWarning && (
          <p className="mt-2 pl-6 text-muted-foreground">{plan.sprayWarning}</p>
        )}
      </div>

      <ol className="mt-4 space-y-3">
        {plan.steps.map((item) => (
          <li
            key={`${item.dayOffset}-${item.title}`}
            className="relative rounded-xl border bg-muted/40 p-4"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <h4 className="min-w-0 text-base font-semibold text-foreground">{item.title}</h4>
              <Badge
                variant="outline"
                className={`shrink-0 rounded-full ${kindTone[item.kind] ?? ""}`}
              >
                {item.when}
              </Badge>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {item.actions.map((action) => (
                <li key={action} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 rounded-lg bg-background p-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Why: </span>
              {item.why}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Lines title="Natural options" items={plan.organic} />
        {plan.chemical.length > 0 ? (
          <Lines title="Chemical options (last resort)" items={plan.chemical} />
        ) : (
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Chemical options
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Not suggested here. We are not sure enough, and spraying without a clear reason wastes
              money and harms helpful insects.
            </p>
          </div>
        )}
        <Lines title="Preventive actions" items={plan.preventive} />
        <Lines title="Safety precautions" items={plan.safety} />
      </div>

      <div className="mt-4 rounded-xl border border-amber/50 bg-amber/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="size-4 text-amber-ink" aria-hidden="true" /> If you do nothing
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {plan.ifIgnored.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        This plan is guidance for planning, not a prescription. For a large field or a costly crop,
        confirm with your local agriculture officer before spending money.
      </p>
    </section>
  );
}
