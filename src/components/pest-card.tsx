import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PestFinding } from "@/lib/pests";

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

/** Lists every pest found on the leaf, one card each. */
export function PestCard({ findings }: { findings: PestFinding[] }) {
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="pest-heading">
      <p
        id="pest-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" /> Pest check
      </p>

      {findings.length === 0 ? (
        <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          No insect pest could be seen in this photo. Many pests hide under the leaf, so turn a few
          leaves over and check again before you decide the crop is clear.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {findings.map((item) => (
            <article key={item.key} className="rounded-xl border bg-muted/40 p-4">
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

              {item.regions.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Where on the leaf:</span>{" "}
                  {item.regions.join(", ")}
                </p>
              )}

              <div className="mt-3 space-y-3">
                <Lines title="Seen in your photo" items={item.evidence} />
                <Lines title="Damage it causes" items={item.damage} />
                <Lines title="Natural control" items={item.organic} />
                {item.chemical.length > 0 ? (
                  <Lines title="Chemical control (general guidance)" items={item.chemical} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    We are only {item.confidence}% sure, so we do not give chemical guidance. Try
                    the natural steps first.
                  </p>
                )}
                <Lines title="How to prevent it" items={item.prevention} />
                <Lines title="Keep watching" items={item.monitoring} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
