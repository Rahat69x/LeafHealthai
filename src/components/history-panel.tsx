import { useMemo, useState } from "react";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { formatWhen, searchHistory } from "@/lib/history";
import { useLang } from "@/lib/i18n";

interface HistoryPanelProps {
  items: AnalysisResult[];
  onView: (item: AnalysisResult) => void;
  onDelete: (id: string) => void;
  onDownload: (item: AnalysisResult) => void;
}

export function HistoryPanel({ items, onView, onDelete, onDownload }: HistoryPanelProps) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const visible = useMemo(() => searchHistory(items, query), [items, query]);

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-labelledby="history-heading"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 id="history-heading" className="min-w-0 truncate text-lg font-bold text-foreground">
          {t("pastChecks")}
        </h2>
        <Badge variant="outline" className="shrink-0 rounded-full">
          {items.length}
        </Badge>
      </div>

      {items.length > 0 && (
        <div className="relative mt-4">
          <Leaf
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="min-h-11 pl-9"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-6 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <Droplet aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("noHistory")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((item) => {
            const when = formatWhen(item.date);
            return (
              <li key={item.id} className="rounded-2xl border bg-muted/30 p-3">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={`${item.plant} leaf checked on ${when.date}`}
                    loading="lazy"
                    decoding="async"
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.disease}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.plant} · {item.confidence}%
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {when.date} · {when.time}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-9"
                    onClick={() => onView(item)}
                  >
                    <ShieldCheck aria-hidden="true" /> {t("view")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-9"
                    onClick={() => onDownload(item)}
                  >
                    <Leaf aria-hidden="true" /> {t("report")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="min-h-9 text-destructive-ink hover:text-destructive-ink"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete the check from ${when.date}`}
                  >
                    <Leaf aria-hidden="true" /> {t("delete")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
