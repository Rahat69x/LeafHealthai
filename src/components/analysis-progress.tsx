import { useEffect, useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { ScanProgress } from "@/lib/leaf-scan";

const STEPS = [
  "Checking the photo...",
  "Finding every leaf and fruit...",
  "Checking each one...",
  "Getting your result ready...",
];

interface Props {
  /** Live progress from the scan. Falls back to a simple timed bar without it. */
  progress?: ScanProgress | null;
}

export function AnalysisProgress({ progress }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTick((current) => Math.min(STEPS.length - 1, current + 1)),
      900,
    );
    return () => window.clearInterval(timer);
  }, []);

  const total = progress?.total ?? 0;
  const counting = (progress?.stage === "leaves" || progress?.stage === "fruits") && total > 0;
  const unit = progress?.stage === "fruits" ? "Fruit" : "Leaf";
  const step = progress
    ? progress.stage === "verify"
      ? 0
      : counting && progress.done >= total
        ? 3
        : 2
    : tick;
  const value = counting
    ? Math.max(8, ((progress?.done ?? 0) / total) * 100)
    : ((step + 1) / STEPS.length) * 100;

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-sm" aria-live="polite">
      <h2 className="text-lg font-bold text-foreground">Analysing your photo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {counting
          ? `${unit} ${Math.min(total, (progress?.done ?? 0) + 1)} of ${total} - each one is checked on its own.`
          : "This takes only a few seconds."}
      </p>
      <Progress value={value} className="mt-4 h-2" />
      <ul className="mt-4 space-y-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`flex items-center gap-2 text-sm ${index <= step ? "text-foreground" : "text-muted-foreground"}`}
          >
            {index < step ? (
              <ShieldCheck className="size-4 text-fern-ink" aria-hidden="true" />
            ) : index === step ? (
              <Leaf className="size-4 animate-spin text-primary" aria-hidden="true" />
            ) : (
              <span className="size-4" aria-hidden="true" />
            )}
            {index === 2 && counting ? `${label} (${progress?.done ?? 0}/${total})` : label}
          </li>
        ))}
      </ul>
    </section>
  );
}
