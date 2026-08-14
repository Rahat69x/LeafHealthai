import { Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { NutrientFinding } from "@/lib/nutrients";

const tone: Record<string, string> = {
  Low: "border-fern/40 bg-fern/15 text-fern-ink",
  Medium: "border-amber/50 bg-amber/20 text-amber-ink",
  High: "border-destructive/40 bg-destructive/10 text-destructive-ink",
};

function Lines({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1.5 space-y-1.5 text-sm text-muted-foreground">
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

/** Shows nutrient shortages found on the leaf, or an honest "not sure" note. */
export function NutrientCard({ findings }: { findings: NutrientFinding[] }) {
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="nutrient-heading">
      <p
        id="nutrient-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <Leaf className="size-4 text-primary" aria-hidden="true" /> Nutrient check
      </p>

      {findings.length === 0 ? (
        <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          No reliable nutrient shortage could be identified from this photo. Do not add extra
          fertiliser on a guess. If leaves keep turning pale, a soil test is the safe way to be
          sure.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {findings.map((item) => (
            <article key={item.code} className="rounded-xl border bg-muted/40 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-foreground">{item.name}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.confidence}% sure</p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 rounded-full ${tone[item.severity] ?? ""}`}
                >
                  {item.severity}
                </Badge>
              </div>
              <Progress value={item.confidence} className="mt-2 h-1.5" />

              <div className="mt-3 space-y-3">
                <Lines title="Seen on this leaf" items={item.visualSymptoms} />
                <Lines title="Why the AI says this" items={item.reasoning} />
                <Lines title="Recommended fertiliser" items={item.fertiliser} />
                <Lines title="Organic option" items={item.organic} />
                <Lines title="How to prevent it" items={item.prevention} />
              </div>

              <p className="mt-3 rounded-lg bg-background p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Recovery:</span> {item.recovery}
                <br />
                <span className="font-medium text-foreground">Not the same as:</span>{" "}
                {item.notToConfuseWith}
              </p>
            </article>
          ))}
          <p className="text-xs text-muted-foreground">
            A nutrient shortage is a feeding problem, not an infection. It does not spread from
            plant to plant.
          </p>
        </div>
      )}
    </section>
  );
}
