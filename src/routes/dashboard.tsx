import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { buildStats, formatWhen, loadHistory, progressGroups } from "@/lib/history";
import { useLang } from "@/lib/i18n";

const TITLE = "Dashboard | LeafCheck";
const DESCRIPTION =
  "See your leaf checks, healthy and sick counts, and whether your plants are getting better.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLang();
  const [items, setItems] = useState<AnalysisResult[]>([]);

  useEffect(() => setItems(loadHistory()), []);

  const stats = useMemo(() => buildStats(items), [items]);
  const groups = useMemo(() => progressGroups(items), [items]);

  const cards = [
    { icon: Droplet, label: t("totalScans"), value: String(stats.total) },
    { icon: Leaf, label: t("healthyPlants"), value: String(stats.healthy) },
    { icon: ShieldCheck, label: t("diseasedPlants"), value: String(stats.diseased) },
    { icon: Droplet, label: t("todayScans"), value: String(stats.today) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("navDashboard")}
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        All of this is saved on your device only. Nothing is sent anywhere.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border bg-card p-5 shadow-sm">
            <card.icon className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">{card.label}</p>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("weekScans")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.week}</p>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("commonDisease")}</p>
          <p className="mt-1 truncate text-2xl font-bold text-foreground">{stats.common}</p>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("avgConfidence")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.averageConfidence}%</p>
          <Progress
            value={stats.averageConfidence}
            aria-label={t("avgConfidence")}
            className="mt-2 h-1.5"
          />
        </div>
      </div>

      <section className="mt-10" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="text-xl font-bold text-foreground">
          Are your plants getting better?
        </h2>
        {groups.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Check the same plant more than once and we will show you if it is getting better or
            worse.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {groups.map((group) => (
              <li key={group.key} className="rounded-3xl border bg-card p-5 shadow-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="min-w-0 truncate font-semibold text-foreground">{group.key}</p>
                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full ${
                      group.change === "Better"
                        ? "border-fern/40 bg-fern/15 text-fern-ink"
                        : group.change === "Worse"
                          ? "border-destructive/40 bg-destructive/10 text-destructive-ink"
                          : ""
                    }`}
                  >
                    {group.change === "Worse" ? (
                      <Droplet className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Droplet className="size-3.5" aria-hidden="true" />
                    )}
                    {group.change}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.count} checks · first on {formatWhen(group.first.date).date} (
                  {group.first.severity}) · last on {formatWhen(group.last.date).date} (
                  {group.last.severity})
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
