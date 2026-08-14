import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Droplet, Leaf } from "lucide-react";
import { toast } from "sonner";

import { diagnoseLeaf } from "@/lib/diagnose.functions";
import { useLang } from "@/lib/i18n";
import { loadPending, syncPending } from "@/lib/offline-queue";
import { makeRunner } from "@/lib/scan-runner";

export function OfflineBanner() {
  const { t } = useLang();
  const diagnose = useServerFn(diagnoseLeaf);
  const runnerRef = useRef(makeRunner(diagnose));
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justBack, setJustBack] = useState(false);

  useEffect(() => {
    runnerRef.current = makeRunner(diagnose);
  }, [diagnose]);

  useEffect(() => {
    const refresh = () => setPending(loadPending().length);
    refresh();

    const goOffline = () => {
      setOffline(true);
      setJustBack(false);
      refresh();
    };

    const goOnline = async () => {
      setOffline(false);
      setJustBack(true);
      window.setTimeout(() => setJustBack(false), 6000);
      if (loadPending().length) {
        setSyncing(true);
        try {
          const synced = await syncPending(runnerRef.current);
          if (synced.done.length) {
            toast.success(
              `${synced.done.length} saved scan${synced.done.length > 1 ? "s" : ""} checked and uploaded.`,
            );
          }
          window.dispatchEvent(new CustomEvent("leafcheck:synced"));
        } finally {
          setSyncing(false);
          refresh();
        }
      }
    };

    setOffline(!navigator.onLine);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("leafcheck:queued", refresh);
    window.addEventListener("leafcheck:synced", refresh);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("leafcheck:queued", refresh);
      window.removeEventListener("leafcheck:synced", refresh);
    };
  }, []);

  if (offline) {
    return (
      <div
        role="status"
        className="border-b border-amber/50 bg-amber/15 px-4 py-2 text-center text-sm text-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <Droplet className="size-4" aria-hidden="true" /> {t("offline")}
          {pending > 0 && (
            <span className="font-semibold">
              · {pending} scan{pending > 1 ? "s" : ""} waiting to upload
            </span>
          )}
        </span>
      </div>
    );
  }

  if (syncing || justBack) {
    return (
      <div
        role="status"
        className="border-b border-fern/40 bg-fern/15 px-4 py-2 text-center text-sm text-foreground"
      >
        <span className="inline-flex items-center gap-2">
          {syncing ? (
            <Leaf className="size-4 animate-pulse" aria-hidden="true" />
          ) : (
            <Droplet className="size-4" aria-hidden="true" />
          )}
          {syncing ? "Uploading your saved scans..." : t("backOnline")}
        </span>
      </div>
    );
  }

  return null;
}
