import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QualityAssistant } from "@/components/quality-assistant";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCEPTED_TYPES, canAnalyse, type ImageCheck } from "@/lib/leaf-image-validation";

const TIPS = [
  "One leaf or a whole plant - we check every leaf.",
  "Use good light.",
  "Keep the leaves in the middle.",
  "Avoid blurry photos.",
  "Hold the camera close to the leaf.",
  "Do not use screenshots.",
  "Avoid strong shadows.",
  "Use a plain background if you can.",
];

const ACCEPT = "image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.bmp,.tif,.tiff,.gif,.avif";

interface UploadPanelProps {
  check: ImageCheck | null;
  checking: boolean;
  analysing: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  onAnalyse: () => void;
}

export function UploadPanel({
  check,
  checking,
  analysing,
  onFile,
  onClear,
  onAnalyse,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [check?.preview]);

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.files ?? [])[0];
      if (file) onFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  const poor = Boolean(check) && !canAnalyse(check ?? null);
  const busy = checking || analysing;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="upload-heading"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step 1
          </p>
          <h2
            id="upload-heading"
            className="truncate text-xl font-bold text-foreground sm:text-2xl"
          >
            Add a leaf photo
          </h2>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1 rounded-full py-1">
          <Leaf className="size-3.5" aria-hidden="true" /> Free check
        </Badge>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInput}
        className="sr-only"
        aria-label="Choose a leaf photo"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInput}
        className="sr-only"
        aria-label="Take a leaf photo with the camera"
      />

      {checking && !check && (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {!check && !checking && (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
            dragging ? "border-primary bg-primary/5" : "border-input bg-muted/40"
          }`}
        >
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Leaf aria-hidden="true" />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">Drop a photo here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Or choose a file, take a photo, or paste with Ctrl + V.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button className="min-h-11" onClick={() => inputRef.current?.click()}>
              <Leaf aria-hidden="true" /> Choose photo
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => cameraRef.current?.click()}
            >
              <Leaf aria-hidden="true" /> Use camera
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Works with {ACCEPTED_TYPES.join(", ")}. One photo at a time.
          </p>
        </div>
      )}

      {check && (
        <div className="mt-5 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border bg-muted">
            <div className="flex h-64 items-center justify-center sm:h-80">
              <img
                src={check.preview}
                alt="The leaf photo you uploaded"
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              />
            </div>
            {check.cropped && (
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
                Leaf found and cut out
              </span>
            )}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <Button
                size="icon"
                variant="secondary"
                aria-label="Zoom in"
                className="min-h-11 min-w-11 rounded-full"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              >
                <Leaf aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Zoom out"
                className="min-h-11 min-w-11 rounded-full"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <Leaf aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Rotate photo"
                className="min-h-11 min-w-11 rounded-full"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <Leaf aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Remove photo"
                className="min-h-11 min-w-11 rounded-full"
                onClick={onClear}
              >
                <Leaf aria-hidden="true" />
              </Button>
            </div>
          </div>

          <QualityAssistant check={check} />

          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 flex-1 sm:flex-none"
              disabled={poor || busy}
              onClick={onAnalyse}
            >
              {analysing ? (
                <Leaf className="animate-spin" aria-hidden="true" />
              ) : (
                <Leaf aria-hidden="true" />
              )}
              {analysing ? "Checking the leaf..." : "Analyse leaf"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Leaf aria-hidden="true" /> Replace photo
            </Button>
          </div>
          {poor && !check.reason && (
            <p className="text-sm font-medium text-destructive-ink">
              This photo is not clear enough to check safely. Please retake it using the guidance
              above.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-dashed p-4">
        <h3 className="text-sm font-semibold text-foreground">Tips for a good photo</h3>
        <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-fern-ink" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
