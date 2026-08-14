import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { OutbreakPanel } from "@/components/outbreak-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  clearReports,
  detectOutbreaks,
  loadReports,
  nearbyReports,
  setSharing,
  sharingOn,
  trendingDiseases,
  type DiseaseReport,
} from "@/lib/outbreak";
import { useFarmWeather } from "@/lib/use-farm-weather";

const TITLE = "Disease outbreak watch near you | LeafCheck";
const DESCRIPTION =
  "See which plant diseases are being reported around your area, how fast they are spreading, and what to do before they reach your field.";

export const Route = createFileRoute("/outbreaks")({
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
  component: OutbreakPage,
});

function OutbreakPage() {
  const { report } = useFarmWeather();
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [share, setShare] = useState(true);

  useEffect(() => {
    setReports(loadReports());
    setShare(sharingOn());
  }, []);

  const origin = report ? { latitude: report.latitude, longitude: report.longitude } : undefined;
  const outbreaks = useMemo(() => detectOutbreaks(reports), [reports]);
  const nearby = useMemo(
    () => nearbyReports(reports, origin),
    [reports, origin?.latitude, origin?.longitude],
  );
  const trending = useMemo(() => trendingDiseases(reports), [reports]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Outbreak watch</h1>
        <p className="text-muted-foreground">
          Built from your own leaf checks on this device. Only the disease, the area and the date
          are kept — never your photos.
        </p>
      </header>

      <OutbreakPanel outbreaks={outbreaks} nearby={nearby} />

      {trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most reported this month</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {trending.map((item) => (
                <li key={item.disease} className="flex items-center justify-between gap-2">
                  <span className="text-foreground">{item.disease}</span>
                  <span>{item.count} reports</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Record my results for outbreak watch</p>
              <p className="text-sm text-muted-foreground">
                Turn this off and nothing new is recorded.
              </p>
            </div>
            <Switch
              checked={share}
              aria-label="Record my results for outbreak watch"
              onCheckedChange={(next) => {
                setShare(next);
                setSharing(next);
                toast.success(next ? "Outbreak watch is on." : "Outbreak watch is off.");
              }}
            />
          </div>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => {
              clearReports();
              setReports([]);
              toast.success("All stored reports were deleted.");
            }}
          >
            Delete all stored reports
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
