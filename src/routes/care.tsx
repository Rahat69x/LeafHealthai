import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { CareScheduler } from "@/components/care-scheduler";
import { GrowthTimeline } from "@/components/growth-timeline";
import { TreatmentProgress } from "@/components/treatment-progress-panel";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { loadHistory } from "@/lib/history";
import { irrigationAdvice } from "@/lib/irrigation-advisor";
import { useFarmWeather } from "@/lib/use-farm-weather";

const TITLE = "Plant care calendar & treatment tracking | LeafCheck";
const DESCRIPTION =
  "Follow-up reminders, watering and fertiliser tasks, plus side-by-side proof of whether your treatment is working.";

export const Route = createFileRoute("/care")({
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
  component: CarePage,
});

function CarePage() {
  const { report, outlook } = useFarmWeather();
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => setHistory(loadHistory()), []);

  const water = useMemo(
    () => (report && outlook ? irrigationAdvice(report, outlook.hours) : null),
    [report, outlook],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Care calendar and treatment progress
        </h1>
        <p className="text-muted-foreground">
          Your tasks and recovery tracking stay on this device. Nothing is uploaded anywhere.
        </p>
      </header>

      <CareScheduler history={history} watering={water?.action} />
      <GrowthTimeline history={history} />
      <TreatmentProgress history={history} />
    </div>
  );
}
