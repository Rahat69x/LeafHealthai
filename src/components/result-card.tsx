import { Droplet, Leaf, ShieldCheck } from "lucide-react";

function healthLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Needs care";
}

import { FeedbackBox } from "@/components/feedback-box";
import { PlantTagBox } from "@/components/plant-tag-box";
import { ExplainPanel } from "@/components/explain-panel";
import { MultiLeafPanel } from "@/components/multi-leaf-panel";
import { FruitPanel } from "@/components/fruit-panel";
import { YieldCard } from "@/components/yield-card";
import { NutrientCard } from "@/components/nutrient-card";
import { PestCard } from "@/components/pest-card";
import { TreatmentPlanCard } from "@/components/treatment-plan-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { confidenceLabel, type AnalysisResult } from "@/lib/demo-analysis";
import { formatWhen } from "@/lib/history";
import { downloadAnnotated, downloadCsv, downloadJson } from "@/lib/leaf-annotate";
import { useLang } from "@/lib/i18n";

const severityTone: Record<string, string> = {
  Low: "bg-fern/15 text-fern-ink border-fern/40",
  Medium: "bg-amber/20 text-amber-ink border-amber/50",
  High: "bg-destructive/10 text-destructive-ink border-destructive/40",
};

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface ResultCardProps {
  result: AnalysisResult;
  onDownload: () => void;
  onFeedback?: (answer: "yes" | "no") => void;
  /** Save a plant name so repeat checks build a timeline. */
  onTag?: (tag: string) => void;
  knownTags?: string[];
  /** Current local weather, used to sharpen the harvest loss estimate. */
  weather?: { humidity: number; rainChance: number; temp?: number; windKph?: number } | null;
}

export function ResultCard({
  result,
  onDownload,
  onFeedback,
  weather,
  onTag,
  knownTags = [],
}: ResultCardProps) {
  const { t } = useLang();
  const confidence = confidenceLabel(result.confidence);
  const when = formatWhen(result.date);

  return (
    <section
      className="animate-fade-in rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="result-heading"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("yourResult")}
          </p>
          <h2 id="result-heading" className="mt-1 truncate text-2xl font-bold text-foreground">
            {result.disease}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.plant} · {when.date} at {when.time}
            {(result.leaves?.length ?? 0) > 1 ? ` · ${result.leaves?.length} leaves checked` : ""}
            {(result.fruits?.length ?? 0) > 0
              ? ` · ${result.fruits?.length} fruit${(result.fruits?.length ?? 0) === 1 ? "" : "s"} checked`
              : ""}
            {result.place ? ` · ${result.place}` : ""}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 rounded-full ${result.healthy ? "border-fern/40 bg-fern/15 text-fern-ink" : "border-amber/50 bg-amber/20 text-amber-ink"}`}
        >
          <Leaf className="size-3.5" aria-hidden="true" />{" "}
          {result.healthy ? t("healthy") : t("diseased")}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Health score</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {result.healthScore ?? (result.healthy ? 95 : 60)}/100
          </p>
          <Progress
            value={result.healthScore ?? (result.healthy ? 95 : 60)}
            className="mt-2 h-1.5"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {healthLabel(result.healthScore ?? (result.healthy ? 95 : 60))}
          </p>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("confidence")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{result.confidence}%</p>
          <Progress value={result.confidence} className="mt-2 h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">{confidence.label}</p>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("severity")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{result.severity}</p>
          <Badge
            variant="outline"
            className={`mt-2 rounded-full ${severityTone[result.severity] ?? ""}`}
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" /> {result.severity} risk
          </Badge>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("photoQuality")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{result.quality}</p>
          <p className="mt-2 text-xs text-muted-foreground">Better photos give better results.</p>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Time taken</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {(result.timeMs / 1000).toFixed(1)}s
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Droplet className="size-3.5" aria-hidden="true" /> {when.time}
          </p>
        </div>
      </div>

      {(result.reasoning?.length || result.visibleSymptoms?.length) && (
        <div className="mt-5 rounded-2xl border bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Leaf className="size-4 text-primary" aria-hidden="true" /> Why the AI says this
          </p>
          {result.visibleSymptoms?.length ? (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Seen in your photo
              </p>
              <List items={result.visibleSymptoms} />
            </div>
          ) : null}
          {result.reasoning?.length ? (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                AI reasoning
              </p>
              <List items={result.reasoning} />
            </div>
          ) : null}
        </div>
      )}

      {confidence.tone === "low" && (
        <p className="mt-4 flex gap-2 rounded-2xl border border-amber/50 bg-amber/10 p-3 text-sm text-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-ink" aria-hidden="true" />
          This result may not be fully correct. Please upload a clearer photo.
        </p>
      )}

      <div className="mt-5 space-y-5">
        {(result.leaves?.length ?? 0) > 0 && (
          <MultiLeafPanel
            image={result.image}
            leaves={result.leaves ?? []}
            timeMs={result.timeMs}
            notice={result.notice}
            onDownloadPdf={onDownload}
            onDownloadImage={() => void downloadAnnotated(result)}
            onDownloadJson={() => downloadJson(result)}
            onDownloadCsv={() => downloadCsv(result)}
          />
        )}
        {(result.fruits?.length ?? 0) > 0 && (
          <FruitPanel image={result.image} fruits={result.fruits ?? []} />
        )}
        <ExplainPanel result={result} />
        <NutrientCard findings={result.nutrients ?? []} />
        <PestCard findings={result.pests ?? []} />
        <YieldCard result={result} weather={weather ?? null} />
        <TreatmentPlanCard
          plant={result.plant}
          disease={result.disease}
          healthy={result.healthy}
          severity={result.severity}
          confidence={result.confidence}
          organic={result.organic}
          chemical={result.chemical}
          prevention={result.prevention}
          pests={result.pests ?? []}
          nutrients={result.nutrients ?? []}
          weather={weather ?? null}
        />
      </div>

      <div className="mt-5 rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-semibold text-foreground">Other possible answers</p>
        <ul className="mt-3 space-y-3">
          {result.predictions.map((item, index) => (
            <li key={`${item.disease}-${index}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="min-w-0 truncate text-sm text-foreground">
                  {index + 1}. {item.plant} · {item.disease}
                </p>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {item.confidence}%
                </span>
              </div>
              <Progress value={item.confidence} className="mt-1.5 h-1.5" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-foreground">What should I do now?</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {result.nextSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{result.about}</p>

      <Accordion type="single" collapsible className="mt-4" defaultValue="treatment">
        <AccordionItem value="symptoms">
          <AccordionTrigger>Signs to look for</AccordionTrigger>
          <AccordionContent>
            <List items={result.symptoms} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="causes">
          <AccordionTrigger>Why it happens</AccordionTrigger>
          <AccordionContent>
            <List items={result.causes} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="treatment">
          <AccordionTrigger>Treatment</AccordionTrigger>
          <AccordionContent>
            <List items={result.treatment} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="organic">
          <AccordionTrigger>Natural treatment</AccordionTrigger>
          <AccordionContent>
            <List items={result.organic} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="chemical">
          <AccordionTrigger>Medicine spray</AccordionTrigger>
          <AccordionContent>
            {result.chemical.length > 0 ? (
              <>
                <List items={result.chemical} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Always read the pack. Ask a local plant expert before you spray.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                We are only {result.confidence}% sure, so we do not suggest any chemical spray. Try
                the natural steps first, or show the leaf to a local agriculture officer.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prevention">
          <AccordionTrigger>How to stop it next time</AccordionTrigger>
          <AccordionContent>
            <List items={result.prevention} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="practices">
          <AccordionTrigger>Good farming habits</AccordionTrigger>
          <AccordionContent>
            <List items={result.practices} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="recovery">
          <AccordionTrigger>Recovery tips</AccordionTrigger>
          <AccordionContent>
            <List items={result.recovery} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="mt-5 min-h-11 w-full sm:w-auto" onClick={onDownload}>
        <Leaf aria-hidden="true" /> {t("download")}
      </Button>

      {onTag && <PlantTagBox value={result.plantTag} known={knownTags} onSave={onTag} />}

      {onFeedback && <FeedbackBox onAnswer={onFeedback} />}
    </section>
  );
}
