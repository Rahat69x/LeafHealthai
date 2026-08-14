import { Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MIN_ANALYSIS_SCORE, type ImageCheck, type QualityItem } from "@/lib/leaf-image-validation";

function getFarmerAdvice(check: ImageCheck, failed: QualityItem[], warned: QualityItem[]) {
  if (check.reason) return [check.reason];

  return [...new Set([...failed, ...warned].map((item) => item.tip).filter(Boolean))].slice(
    0,
    3,
  ) as string[];
}

/** A short, action-first photo message for farmers. Technical checks stay hidden. */
export function QualityAssistant({ check }: { check: ImageCheck }) {
  const ready = check.ok && !check.reason && check.score >= MIN_ANALYSIS_SCORE;
  const failed = check.items.filter((item) => item.state === "fail");
  const warned = check.items.filter((item) => item.state === "warn");
  const advice = getFarmerAdvice(check, failed, warned);

  return (
    <section
      className={`rounded-2xl border p-4 ${ready ? "border-fern/30 bg-fern/5" : "border-destructive/30 bg-destructive/5"}`}
      aria-labelledby="quality-heading"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 rounded-full p-2 ${ready ? "bg-fern/15 text-fern-ink" : "bg-destructive/10 text-destructive-ink"}`}
        >
          {ready ? (
            <ShieldCheck className="size-4" aria-hidden="true" />
          ) : (
            <Leaf className="size-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="quality-heading" className="text-sm font-semibold text-foreground">
              {ready ? "Ready to check" : "Please retake the photo"}
            </h3>
            <Badge
              variant="outline"
              className={
                ready
                  ? "rounded-full border-fern/40 bg-fern/15 text-fern-ink"
                  : "rounded-full border-destructive/40 bg-destructive/10 text-destructive-ink"
              }
            >
              {ready ? "Good photo" : "Needs a new photo"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-foreground">
            {ready
              ? "This photo is clear. Every leaf we find will be checked."
              : "We cannot safely check this photo yet."}
          </p>
        </div>
      </div>

      {!ready && (
        <div className="mt-3 rounded-xl border border-destructive/20 bg-background/50 p-3">
          <p className="text-sm font-semibold text-foreground">Try this</p>
          <ul className="mt-2 space-y-2 text-sm text-foreground">
            {advice.length > 0 ? (
              advice.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-amber-ink"
                    aria-hidden="true"
                  />
                  <span>{tip}</span>
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-ink" aria-hidden="true" />
                <span>Move closer, keep the whole leaf in the frame, and use soft daylight.</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {ready && (
        <p className="mt-3 flex items-center gap-2 text-sm text-fern-ink">
          <ShieldCheck className="size-4" aria-hidden="true" /> One clear leaf is all we need.
        </p>
      )}
    </section>
  );
}
