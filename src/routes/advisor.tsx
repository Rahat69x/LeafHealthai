import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

import { IrrigationCard } from "@/components/irrigation-card";
import { NoticeList } from "@/components/notice-list";
import { SprayAdvisorCard } from "@/components/spray-advisor-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assess } from "@/lib/agri-intelligence";
import { buildTasks, loadCare, mergeTasks } from "@/lib/care-schedule";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { loadHistory } from "@/lib/history";
import { irrigationAdvice } from "@/lib/irrigation-advisor";
import { buildNotices } from "@/lib/notifications";
import { detectOutbreaks, loadReports } from "@/lib/outbreak";
import { sprayAdvice } from "@/lib/spray-advisor";
import { useFarmWeather } from "@/lib/use-farm-weather";
import { seasonOf } from "@/lib/weather";

const TITLE = "Spray & water advisor | LeafCheck";
const DESCRIPTION =
  "Find the best hours to spray and know whether to water today, based on rain, wind, humidity, heat and UV in your area.";

export const Route = createFileRoute("/advisor")({
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
  component: AdvisorPage,
});

function AdvisorPage() {
  const { report, outlook, loading, error } = useFarmWeather();
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => setHistory(loadHistory()), []);

  const spray = useMemo(() => (outlook ? sprayAdvice(outlook.hours) : null), [outlook]);
  const water = useMemo(
    () => (report && outlook ? irrigationAdvice(report, outlook.hours) : null),
    [report, outlook],
  );

  const personal = useMemo(() => {
    if (!report) return null;
    return assess({
      report,
      season: seasonOf(new Date(), report.latitude),
      history,
      place: report.place,
    });
  }, [report, history]);

  const notices = useMemo(
    () =>
      buildNotices({
        report,
        spray,
        tasks: mergeTasks(buildTasks(history, water?.action ?? "water"), loadCare()),
        history,
        outbreaks: detectOutbreaks(loadReports()),
      }),
    [report, spray, history, water],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Spray and water advisor</h1>
        <p className="text-muted-foreground">
          Advice for {report ? report.place : "your area"}, using rain, wind, humidity, heat and UV
          for the next two days.
        </p>
      </header>

      {loading && !report && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="size-4 animate-spin" aria-hidden="true" /> Reading the weather for your
          area...
        </p>
      )}
      {error && !report && (
        <p className="rounded-xl border border-amber/50 bg-amber/10 p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      <NoticeList notices={notices} />

      <div className="grid gap-6 lg:grid-cols-2">
        {spray && <SprayAdvisorCard advice={spray} />}
        {water && <IrrigationCard advice={water} />}
      </div>

      {personal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What to do for your crop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{personal.summary}</p>
            {personal.recommendations.map((item) => (
              <div key={item.action} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{item.action}</p>
                  <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>
                    {item.priority} priority
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Why: {item.reason}</p>
                <p className="text-sm text-muted-foreground">Benefit: {item.benefit}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
