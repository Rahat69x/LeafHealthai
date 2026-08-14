import { Badge } from "@/components/ui/badge";
import type { Priority, Recommendation } from "@/lib/agri-intelligence";

const priorityTone: Record<Priority, string> = {
  High: "border-destructive/40 bg-destructive/10 text-destructive-ink",
  Medium: "border-amber/50 bg-amber/20 text-amber-ink",
  Low: "border-fern/40 bg-fern/15 text-fern-ink",
};

export function PreventionPlan({ items, place }: { items: Recommendation[]; place?: string }) {
  if (!items.length) return null;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="prevention-heading"
    >
      <h2 id="prevention-heading" className="text-lg font-bold text-foreground">
        What to do this week
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Personal advice for {place ?? "your area"}. Every step says why it matters and what you
        gain.
      </p>

      <ol className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={item.action} className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {index + 1}. {item.action}
              </p>
              <Badge variant="outline" className={`rounded-full ${priorityTone[item.priority]}`}>
                {item.priority} priority
              </Badge>
            </div>
            <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">Reason:</dt>
                <dd>{item.reason}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">Benefit:</dt>
                <dd>{item.benefit}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
