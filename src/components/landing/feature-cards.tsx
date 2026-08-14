import { Droplet, Leaf, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "Two-stage checking",
    text: "We verify the photo really shows leaves, then check each one.",
  },
  {
    icon: ShieldCheck,
    title: "No guessing",
    text: "Below 65% confidence we say we are unsure instead of inventing a disease.",
  },
  {
    icon: Leaf,
    title: "Explainable results",
    text: "Every result shows the symptoms the AI saw and why it decided that.",
  },
  {
    icon: Droplet,
    title: "Weather-aware advice",
    text: "Local humidity and rain shift the risk score and the treatment tips.",
  },
  {
    icon: Droplet,
    title: "Works offline",
    text: "Scans queue on your device and run for real once you are back online.",
  },
  {
    icon: Leaf,
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
  // Visibility is never gated on JavaScript state: the cards are always in flow
  // and always painted. The entrance animation is pure CSS and only decorates.
  return (
    <section aria-label="Features" className="space-y-6">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
        Built to be trusted, not just clever
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`group rounded-2xl border border-border bg-card p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${ANIM[i % ANIM.length]}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-fern/15">
              <f.icon
                aria-hidden="true"
                className="size-7 text-primary transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.6}
              />
            </span>
            <h3 className="mt-3 text-base font-bold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
