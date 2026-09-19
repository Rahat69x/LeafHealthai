import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Camera,
  ClipboardPaste,
  Leaf,
  RotateCw,
  Sparkles,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

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

function extractImageFromClipboard(dataTransfer: DataTransfer | null): File | null {
  if (!dataTransfer) return null;
  // 1. First check items (standard across Chrome, Edge, Windows screenshots)
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
  }
  // 2. Check files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      if (file && file.type.startsWith("image/")) {
        return file;
      }
    }
    return dataTransfer.files[0] ?? null;
  }
  return null;
}

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
      const file = extractImageFromClipboard(event.clipboardData);
      if (file) {
        event.preventDefault();
        onFile(file);
        toast.success("Photo pasted from clipboard!");
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  async function handlePasteClick() {
    try {
      if (!navigator.clipboard?.read) {
        toast.info("Press Ctrl + V directly on your keyboard to paste.");
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split("/")[1] || "png";
          const file = new File([blob], `clipboard-${Date.now()}.${ext}`, {
            type: imageType,
            lastModified: Date.now(),
          });
          onFile(file);
          toast.success("Photo pasted from clipboard!");
          return;
        }
      }
      toast.info(
        "No image found in clipboard. Copy an image or screenshot first, then press Ctrl + V or click Paste.",
      );
    } catch {
      toast.info("Press Ctrl + V directly on your keyboard to paste the copied image.");
    }
  }

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
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-7"
      aria-labelledby="upload-heading"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Step 1
          </p>
          <h2
            id="upload-heading"
            className="truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            Add a leaf photo
          </h2>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 gap-1.5 rounded-full border-white/60 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1 shadow-sm backdrop-blur-md text-foreground"
        >
          <Leaf className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />{" "}
          Free check
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
          className={`mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-10 ${
            dragging
              ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.2)]"
              : "border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10"
          }`}
        >
          <div className="mx-auto glass-icon-3d size-16 rounded-2xl">
            <Upload className="size-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <p className="mt-4 text-base font-bold text-foreground">
            Drop a photo here, or press{" "}
            <kbd className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/80 dark:border-white/20 bg-white/80 dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
              Ctrl + V
            </kbd>{" "}
            to paste
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a file, paste from clipboard, or capture with camera.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              variant="default"
              onClick={() => inputRef.current?.click()}
              className="shadow-md"
            >
              <Upload className="size-4" aria-hidden="true" /> Choose photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePasteClick}
              className="gap-2 border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs"
            >
              <ClipboardPaste
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />{" "}
              Paste (Ctrl + V)
            </Button>
            <Button size="lg" variant="outline" onClick={() => cameraRef.current?.click()}>
              <Camera className="size-4" aria-hidden="true" /> Use camera
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Works with {ACCEPTED_TYPES.join(", ")}. One photo at a time.
          </p>
        </div>
      )}

      {check && (
        <div className="mt-5 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/15 bg-muted shadow-md">
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
              <span className="absolute left-3 top-3 rounded-full border border-white/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-xl">
                Leaf found and cut out
              </span>
            )}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom in"
                className="size-10 rounded-full shadow-md"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              >
                <ZoomIn className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom out"
                className="size-10 rounded-full shadow-md"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <ZoomOut className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Rotate photo"
                className="size-10 rounded-full shadow-md"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                aria-label="Remove photo"
                className="size-10 rounded-full shadow-md"
                onClick={onClear}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <QualityAssistant check={check} />

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="default"
              className="flex-1 sm:flex-none shadow-lg"
              disabled={poor || busy}
              onClick={onAnalyse}
            >
              {analysing ? (
                <Sparkles className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {analysing ? "Checking the leaf..." : "Analyse leaf"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" aria-hidden="true" /> Replace photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              onClick={handlePasteClick}
              className="gap-1.5"
            >
              <ClipboardPaste
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />{" "}
              Paste new (Ctrl + V)
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

      <div className="mt-6 rounded-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 backdrop-blur-md">
        <h3 className="text-sm font-bold text-foreground">Tips for a good photo</h3>
        <ul className="mt-2.5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2 items-start">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
