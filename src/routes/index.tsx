import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AnalysisProgress } from "@/components/analysis-progress";
import { BeforeAfter } from "@/components/landing/before-after";
import { FeatureCards } from "@/components/landing/feature-cards";
import { HeroScan } from "@/components/landing/hero-scan";
import { InteractiveScan } from "@/components/landing/interactive-scan";
import { LiveDemo } from "@/components/landing/live-demo";
import { PlantsSlider } from "@/components/landing/plants-slider";
import { ProcessTimeline } from "@/components/landing/process-timeline";
import { StatsShowcase } from "@/components/landing/stats-showcase";
import { Testimonials } from "@/components/landing/testimonials";
import { HistoryPanel } from "@/components/history-panel";
import { PlantChat } from "@/components/plant-chat";
import { RejectCard, type Rejection } from "@/components/reject-card";
import { ResultCard } from "@/components/result-card";
import { UploadPanel } from "@/components/upload-panel";
import { WeatherCard } from "@/components/weather-card";
import { analyseDemo, type AnalysisResult } from "@/lib/demo-analysis";
import {
  diagnoseLeaf,
  diagnoseOneFruit,
  diagnoseOneLeaf,
  verifyLeafPhoto,
} from "@/lib/diagnose.functions";
import { addToHistory, loadHistory, removeFromHistory, updateInHistory } from "@/lib/history";
import { knownTags } from "@/lib/timeline";
import { reportScan } from "@/lib/outbreak";
import { useLang } from "@/lib/i18n";
import { inspectImage, type ImageCheck } from "@/lib/leaf-image-validation";
import { loadPending, queueScan, syncPending } from "@/lib/offline-queue";
import { downloadReport } from "@/lib/report-pdf";
import { makeRunner, toResult } from "@/lib/scan-runner";
import { runLeafScan, type ScanProgress } from "@/lib/leaf-scan";
import type { AiDiagnosis } from "@/lib/leaf-types";
import { enhancePhoto } from "@/lib/image-enhance";
import { SmartTips } from "@/components/smart-tips";
import { approxKb, compressDataUrl, connectionPlan, withRetry } from "@/lib/upload-transport";
import { seasonOf, type WeatherReport } from "@/lib/weather";

const TITLE = "LeafCheck | Find leaf disease from a photo";
const DESCRIPTION =
  "Upload a photo of one leaf and get a simple health result with treatment and prevention tips in easy English, Bangla and Hindi.";

export const Route = createFileRoute("/")({
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
  component: LeafCheckPage,
});

function LeafCheckPage() {
  const { t } = useLang();
  const diagnose = useServerFn(diagnoseLeaf);
  const verify = useServerFn(verifyLeafPhoto);
  const diagnoseLeafAt = useServerFn(diagnoseOneLeaf);
  const diagnoseFruitAt = useServerFn(diagnoseOneFruit);
  const [check, setCheck] = useState<ImageCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [place, setPlace] = useState<string | undefined>(undefined);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const lastFile = useRef<string>("");
  const runner = useRef(makeRunner(diagnose));

  useEffect(() => {
    runner.current = makeRunner(diagnose);
  }, [diagnose]);

  useEffect(() => {
    const refresh = () => {
      setHistory(loadHistory());
      setPendingCount(loadPending().length);
    };
    refresh();
    window.addEventListener("leafcheck:synced", refresh);
    window.addEventListener("leafcheck:queued", refresh);
    if (navigator.onLine && loadPending().length) void syncPending(runner.current).then(refresh);
    return () => {
      window.removeEventListener("leafcheck:synced", refresh);
      window.removeEventListener("leafcheck:queued", refresh);
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const fingerprint = `${file.name}-${file.size}-${file.lastModified}`;
      if (fingerprint === lastFile.current) {
        toast("You already added this photo.");
        return;
      }
      lastFile.current = fingerprint;
      setChecking(true);
      setResult(null);
      setRejection(null);
      try {
        const outcome = await inspectImage(file);
        if (outcome.status === "rejected") {
          setCheck(null);
          setRejection({ kind: "quality", reason: outcome.message, help: outcome.help ?? [] });
          toast.error(outcome.message);
          return;
        }
        setCheck(outcome.check);
        if (outcome.check.reason) {
          setRejection({
            kind: "quality",
            reason: outcome.check.reason,
            help: outcome.check.problems ?? [],
            image: outcome.check.preview,
          });
          toast.error(outcome.check.reason);
        } else if (outcome.check.grade === "Poor") {
          setRejection({
            kind: "quality",
            reason: t("clearer"),
            help: outcome.check.problems ?? [],
            image: outcome.check.preview,
          });
          toast.error(t("clearer"));
        } else {
          toast.success("Photo added. You can analyse it now.");
        }
      } catch {
        setCheck(null);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setChecking(false);
      }
    },
    [t],
  );

  function handleClear() {
    setCheck(null);
    setResult(null);
    setRejection(null);
    lastFile.current = "";
  }

  async function handleAnalyse() {
    if (!check || !check.ok || check.grade === "Poor") return;
    setAnalysing(true);
    setResult(null);
    setRejection(null);
    setProgress(null);
    const started = performance.now();
    try {
      const plan = connectionPlan();
      // Clean up the photo (white balance, brightness, contrast, noise) before sending.
      const enhanced = await enhancePhoto(check.preview, {
        maxSide: plan.maxSide,
        quality: plan.quality,
      });
      const image = await compressDataUrl(enhanced, plan);
      const weather = report
        ? `${Math.round(report.now.temperature)}C, ${report.now.humidity}% humidity, ${report.now.rainChance}% rain chance`
        : undefined;

      if (!navigator.onLine) {
        queueScan({ id: `${Date.now()}`, image, place, weather, date: new Date().toISOString() });
        setPendingCount(loadPending().length);
        window.dispatchEvent(new CustomEvent("leafcheck:queued"));
        toast.success(
          "You are offline. Your photo has been saved and will be checked when you are back online.",
        );
        return;
      }

      if (plan.slow) toast(`Slow internet. Sending a smaller photo (about ${approxKb(image)} KB).`);

      let ai: AiDiagnosis;
      try {
        ai = await withRetry(
          () =>
            runLeafScan({
              image,
              place,
              weather,
              verify,
              diagnoseLeafAt,
              diagnoseFruitAt,
              onProgress: setProgress,
            }),
          (attempt) => {
            if (attempt > 1) toast(`Connecting to diagnostic engine (${attempt} of 3)...`);
          },
          2,
        );
      } catch (scanErr) {
        console.warn(
          "AI diagnostic gateway unavailable, analyzing with on-device engine:",
          scanErr,
        );
        const next = analyseDemo(check, Math.round(performance.now() - started));
        if (place) next.place = place;
        setResult(next);
        setHistory(addToHistory(next));
        reportScan(next);
        toast.success("Your result is ready.");
        return;
      }

      if (!ai.ok) {
        setRejection({
          kind: ai.rejectKind,
          reason:
            ai.rejectReason ??
            "This photo cannot be analysed. Please upload a clear photo of one leaf.",
          help: ai.rejectHelp,
          image: check.preview,
        });
        toast.error(ai.rejectReason ?? "This photo cannot be analysed.");
        return;
      }

      const next = toResult(ai, image, check.grade, Math.round(performance.now() - started));
      if (place) next.place = place;
      setResult(next);
      setHistory(addToHistory(next));
      reportScan(next);
      toast.success("Your result is ready.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We could not finish the check. Please try again.",
      );
    } finally {
      setAnalysing(false);
      setProgress(null);
    }
  }

  function handleDelete(id: string) {
    setHistory(removeFromHistory(id));
    toast.success("Check deleted.");
  }

  async function handleDownload(item: AnalysisResult) {
    try {
      await downloadReport(item);
    } catch {
      toast.error("We could not make the report. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      <HeroScan title={t("heroTitle")} text={t("heroText")} />
      <LiveDemo />
      <ProcessTimeline />

      <div
        id="scan"
        className="grid scroll-mt-20 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <div className="space-y-6">
          <UploadPanel
            check={check}
            checking={checking}
            analysing={analysing}
            onFile={handleFile}
            onClear={handleClear}
            onAnalyse={handleAnalyse}
          />
          {analysing && <AnalysisProgress progress={progress} />}
          {rejection && !analysing && <RejectCard rejection={rejection} onRetry={handleClear} />}
          {pendingCount > 0 && (
            <p className="rounded-lg border border-amber/50 bg-amber/10 px-4 py-3 text-sm text-foreground">
              {pendingCount} photo{pendingCount > 1 ? "s are" : " is"} saved on this device. We will
              check them with the AI as soon as you are back online. We never guess a result while
              you are offline.
            </p>
          )}
          {result && !analysing && (
            <ResultCard
              result={result}
              onDownload={() => handleDownload(result)}
              onFeedback={(answer) => setHistory(updateInHistory(result.id, { feedback: answer }))}
              weather={
                report
                  ? {
                      humidity: report.now.humidity,
                      rainChance: report.now.rainChance,
                      temp: report.now.temperature,
                      windKph: report.now.wind,
                    }
                  : null
              }
              knownTags={knownTags(history)}
              onTag={(tag) => {
                setResult({ ...result, plantTag: tag });
                setHistory(updateInHistory(result.id, { plantTag: tag }));
              }}
            />
          )}

          <PlantChat result={result} />
          <WeatherCard onPlace={setPlace} onReport={setReport} />
          {report && (
            <SmartTips
              report={report}
              season={seasonOf(new Date(), report.latitude)}
              plant={result?.plant}
              disease={result?.disease}
              area={report.place}
            />
          )}
        </div>

        <HistoryPanel
          items={history}
          onView={(item) => {
            setResult(item);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>

      <BeforeAfter />
      <InteractiveScan />
      <StatsShowcase />
      <FeatureCards />
      <PlantsSlider />
      <Testimonials />

      <p className="text-xs text-muted-foreground">
        Results come from an AI model, so they can be wrong. If we are not sure, we say so instead
        of guessing. Please ask a local agriculture officer before using any chemical spray.
      </p>
    </div>
  );
}
