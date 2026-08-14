import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import type { WeatherReport } from "@/lib/weather";

interface Insight {
  title: string;
  detail: string;
  tone: "good" | "watch" | "bad";
  icon: typeof Leaf;
}

const toneClass: Record<Insight["tone"], string> = {
  good: "border-fern/40 bg-fern/10",
  watch: "border-amber/40 bg-amber/10",
  bad: "border-destructive/40 bg-destructive/10",
};

/** Plain language notes about what today's weather means for the crop. */
export function buildInsights(report: WeatherReport): Insight[] {
  const now = report.now;
  const list: Insight[] = [];

  if (now.humidity >= 80 && now.temperature >= 15 && now.temperature <= 28) {
    list.push({
      title: "Weather favours powdery and downy mildew",
      detail: `Humidity is ${now.humidity}% at ${now.temperature}°C, the range these fungi like most. Check the underside of lower leaves.`,
      tone: "bad",
      icon: Leaf,
    });
  }
  if (now.leafWetnessHours >= 8) {
    list.push({
      title: "Leaves stay wet for about " + now.leafWetnessHours + " hours",
      detail:
        "Long leaf wetness is the main trigger for blight and leaf spot. Space plants and avoid evening watering.",
      tone: "bad",
      icon: Droplet,
    });
  } else if (now.leafWetnessHours >= 4) {
    list.push({
      title: "Moderate leaf wetness expected",
      detail: `About ${now.leafWetnessHours} damp hours ahead. Water at the root in the morning so leaves dry by dusk.`,
      tone: "watch",
      icon: Droplet,
    });
  }
  if (now.rainfall >= 10 || now.rainChance >= 70) {
    list.push({
      title: "Risk of bacterial infection is increasing",
      detail:
        "Rain splash carries bacteria from soil to leaves. Keep the soil mulched and do not work in a wet field.",
      tone: "watch",
      icon: ShieldCheck,
    });
  }
  if (now.temperature >= 28 && now.humidity <= 55) {
    list.push({
      title: "Hot and dry: watch for mites and thrips",
      detail:
        "Fungal risk drops but sucking pests multiply fast. Check new shoots twice this week.",
      tone: "watch",
      icon: ShieldCheck,
    });
  }
  if (report.level === "Low" && now.humidity < 70) {
    list.push({
      title: "Humidity is safe today",
      detail:
        "Disease spread probability is low. This is a good day for pruning, spraying and harvesting.",
      tone: "good",
      icon: ShieldCheck,
    });
  }
  if (list.length === 0) {
    list.push({
      title: "Conditions are ordinary today",
      detail:
        "Nothing in the weather stands out. Keep to your normal watering and inspection routine.",
      tone: "good",
      icon: ShieldCheck,
    });
  }
  return list.slice(0, 4);
}

export function PlantHealthInsights({ report }: { report: WeatherReport }) {
  const insights = buildInsights(report);
  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="insights-heading"
    >
      <h2 id="insights-heading" className="text-lg font-bold text-foreground">
        Plant health insights
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What today's weather means for the crop, in plain words.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {insights.map((item) => (
          <article key={item.title} className={`rounded-2xl border p-4 ${toneClass[item.tone]}`}>
            <item.icon className="size-5 text-foreground" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
