import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Droplet, Leaf, ShieldCheck } from "lucide-react";

import { KnowledgeCard, SeverityBadge } from "@/components/knowledge/knowledge-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { entryImage, getEntry, relatedEntries, type KnowledgeEntry } from "@/lib/knowledge";

export const Route = createFileRoute("/knowledge/$slug")({
  loader: ({ params }) => {
    const entry = getEntry(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ loaderData }) => {
    const entry = loaderData?.entry;
    const title = entry
      ? `${entry.name} — symptoms, causes and treatment | LeafCheck`
      : "Guide | LeafCheck";
    const description = entry
      ? `${entry.summary} Learn identification, weather triggers, prevention and organic or chemical treatment.`
      : "Plant health guide.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold text-foreground">Could not open this guide</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground">Guide not found</h1>
      <p className="mt-2 text-muted-foreground">This entry may have been renamed.</p>
      <Button asChild className="mt-5 rounded-xl">
        <Link to="/knowledge">Back to Knowledge Center</Link>
      </Button>
    </div>
  ),
  component: KnowledgeDetail,
});

function Section({
  icon: Icon,
  title,
  items,
  note,
  tone = "default",
}: {
  icon: typeof Leaf;
  title: string;
  items: string[];
  note?: string;
  tone?: "default" | "warn";
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Icon
          className={`size-5 ${tone === "warn" ? "text-amber-ink-600" : "text-primary"}`}
          aria-hidden="true"
        />
        {title}
      </h2>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function KnowledgeDetail() {
  const { entry } = Route.useLoaderData() as { entry: KnowledgeEntry };
  const related = relatedEntries(entry);
  const CategoryIcon = entry.category === "pest" ? ShieldCheck : Leaf;

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/knowledge"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Knowledge Center
      </Link>

      <header className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="overflow-hidden rounded-3xl border bg-muted">
          <img
            loading="lazy"
            decoding="async"
            src={entryImage(entry)}
            alt={`${entry.name} symptoms on a leaf`}
            className="aspect-[16/10] size-full object-cover"
          />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <CategoryIcon className="size-3.5" aria-hidden="true" />
              {entry.kind}
            </span>
            <SeverityBadge severity={entry.severity} />
            <Badge variant="outline">{entry.difficulty} to manage</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {entry.name}
          </h1>
          <p className="mt-1 text-sm italic text-muted-foreground">{entry.scientificName}</p>
          <p className="mt-3 text-base text-muted-foreground">{entry.summary}</p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Plants affected
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {entry.plants.map((plant) => (
                  <Badge key={plant} variant="secondary" className="text-[11px]">
                    {plant}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Peak seasons
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {entry.seasons.map((season) => (
                  <Badge key={season} variant="outline" className="text-[11px]">
                    {season}
                  </Badge>
                ))}
              </dd>
            </div>
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplet className="size-3.5" aria-hidden="true" />
            Last reviewed {entry.reviewed}
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border bg-gradient-to-br from-primary/10 to-card p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Leaf className="size-5 text-primary" aria-hidden="true" />
          Weather triggers
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.weather.map((w) => (
            <span
              key={w}
              className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground"
            >
              {w}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{entry.weatherNote}</p>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Section icon={ShieldCheck} title="How to identify it" items={entry.identification} />
        <Section icon={ShieldCheck} title="Symptoms" items={entry.symptoms} tone="warn" />
        <Section icon={Leaf} title="What causes it" items={entry.causes} />
        <Section icon={ShieldCheck} title="Prevention" items={entry.prevention} />
        <Section icon={Leaf} title="Organic treatment" items={entry.organic} />
        <Section
          icon={Leaf}
          title="Chemical treatment"
          items={entry.chemical}
          note="General orientation only. Product registration and dose rules differ by country — confirm with your local extension service before spraying."
          tone="warn"
        />
        <Section icon={Leaf} title="Good farming practice" items={entry.practices} />
      </div>

      {related.length > 0 ? (
        <section className="mt-12" aria-label="Related guides">
          <h2 className="text-lg font-bold text-foreground">Related guides</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <KnowledgeCard key={item.slug} entry={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 rounded-2xl border border-dashed p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Seeing these symptoms on your own plant? Scan a leaf photo for an AI diagnosis.
        </p>
        <Button asChild className="mt-3 rounded-xl">
          <Link to="/">Scan a leaf</Link>
        </Button>
      </div>
    </article>
  );
}
