import { Link } from "@tanstack/react-router";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { entryImage, type KnowledgeEntry } from "@/lib/knowledge";

const SEVERITY_CLASS: Record<KnowledgeEntry["severity"], string> = {
  Low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-ink-800 dark:text-amber-ink-300",
  High: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "Very High": "bg-destructive/15 text-destructive-ink",
};

export function SeverityBadge({ severity }: { severity: KnowledgeEntry["severity"] }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${SEVERITY_CLASS[severity]}`}
    >
      {severity} risk
    </span>
  );
}

export function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  const Icon = entry.category === "pest" ? ShieldCheck : Leaf;
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: entry.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={entryImage(entry)}
          alt={`${entry.name} on a plant leaf`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            {entry.kind}
          </span>

          <SeverityBadge severity={entry.severity} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary">
          {entry.name}
        </h3>
        <p className="text-xs italic text-muted-foreground">{entry.scientificName}</p>
        <p className="line-clamp-3 text-sm text-muted-foreground">{entry.summary}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {entry.plants.slice(0, 3).map((plant) => (
            <Badge key={plant} variant="secondary" className="text-[11px] font-medium">
              {plant}
            </Badge>
          ))}
          {entry.plants.length > 3 ? (
            <Badge variant="outline" className="text-[11px]">
              +{entry.plants.length - 3}
            </Badge>
          ) : null}
        </div>
        <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
          <Droplet className="size-3.5" aria-hidden="true" />
          Reviewed {entry.reviewed}
        </p>
      </div>
    </Link>
  );
}
