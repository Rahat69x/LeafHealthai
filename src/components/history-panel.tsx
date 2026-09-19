import { useMemo, useState } from "react";
import { Download, Eye, History, Search, Trash2 } from "lucide-react";

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
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-labelledby="history-heading"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 id="history-heading" className="min-w-0 truncate text-lg font-bold text-foreground">
          {t("pastChecks")}
        </h2>
        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-white/60 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2.5 py-0.5 shadow-sm"
        >
          {items.length}
        </Badge>
      </div>

      {items.length > 0 && (
        <div className="relative mt-4">
          <Search
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="min-h-11 rounded-xl border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 pl-10 shadow-sm backdrop-blur-md"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/60 dark:border-white/15 bg-white/30 dark:bg-white/5 p-6 text-center backdrop-blur-md">
          <div className="mx-auto glass-icon-3d size-12 rounded-2xl">
            <History className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("noHistory")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((item) => {
            const when = formatWhen(item.date);
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3.5 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/80"
              >
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={`${item.plant} leaf checked on ${when.date}`}
                    loading="lazy"
                    decoding="async"
                    className="size-16 shrink-0 rounded-xl object-cover shadow-sm border border-white/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{item.disease}</p>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {item.plant} · {item.confidence}%
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground/80 mt-0.5">
                      {when.date} · {when.time}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8.5 rounded-lg px-3 text-xs"
                    onClick={() => onView(item)}
                  >
                    <Eye className="size-3.5" aria-hidden="true" /> {t("view")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8.5 rounded-lg px-3 text-xs"
                    onClick={() => onDownload(item)}
                  >
                    <Download className="size-3.5" aria-hidden="true" /> {t("report")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8.5 rounded-lg px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete the check from ${when.date}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" /> {t("delete")}
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
