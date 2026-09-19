import { CloudSun, Globe2, Leaf, ShieldAlert, ShieldCheck, WifiOff } from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "Two-stage checking",
    text: "We verify the photo really shows leaves, then check each one.",
  },
  {
    icon: ShieldAlert,
    title: "No guessing",
    text: "Below 65% confidence we say we are unsure instead of inventing a disease.",
  },
  {
    icon: ShieldCheck,
    title: "Explainable results",
    text: "Every result shows the symptoms the AI saw and why it decided that.",
  },
  {
    icon: CloudSun,
    title: "Weather-aware advice",
    text: "Local humidity and rain shift the risk score and the treatment tips.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    text: "Scans queue on your device and run for real once you are back online.",
  },
  {
    icon: Globe2,
    title: "English, বাংলা, हिन्दी",
    text: "Plain wording so any grower can follow the steps without help.",
  },
];

const ANIM = [
  "motion-safe:animate-[fade-up_.6s_ease-out_both]",
  "motion-safe:animate-[slide-up_.6s_ease-out_both]",
  "motion-safe:animate-[zoom-in_.6s_ease-out_both]",
];

export function FeatureCards() {
  return (
    <section aria-label="Features" className="space-y-6">
      <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        Built to be trusted, not just clever
      </h2>
      <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`group relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-6 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(47,122,63,0.15)] ${ANIM[i % ANIM.length]}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="glass-icon-3d size-14 shrink-0 rounded-2xl transition-transform duration-300 group-hover:scale-110">
              <f.icon
                aria-hidden="true"
                className="size-7 text-emerald-600 dark:text-emerald-400"
                strokeWidth={1.8}
              />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
