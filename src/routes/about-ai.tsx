import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { useLang } from "@/lib/i18n";

const TITLE = "How the leaf check works | LeafCheck";
const DESCRIPTION =
  "A plain-language look at how LeafCheck reads your leaf photo, scores quality and suggests treatment.";

export const Route = createFileRoute("/about-ai")({
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
  component: AboutAiPage,
});

const STEPS = [
  {
    icon: Leaf,
    title: "1. Photo check",
    text: "We look at size, light, sharpness and green colour. A bad photo is stopped before the check starts.",
  },
  {
    icon: Leaf,
    title: "2. Leaf reading",
    text: "We read colour patterns and dark patches on the leaf, then match them to known leaf problems.",
  },
  {
    icon: Droplet,
    title: "3. Advice",
    text: "Each problem has care steps written in simple words: natural first, medicine spray only if needed.",
  },
  {
    icon: ShieldCheck,
    title: "4. Your privacy",
    text: "Everything runs in your browser. Photos and results stay on your device.",
  },
];

function AboutAiPage() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("navAbout")}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        We keep this honest and simple, so you know what the result means.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step) => (
          <section key={step.title} className="rounded-3xl border bg-card p-5 shadow-sm">
            <step.icon className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-amber/50 bg-amber/10 p-5">
        <h2 className="text-lg font-bold text-foreground">What it cannot do</h2>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          <li>It cannot see problems inside the root or stem.</li>
          <li>It can be wrong when the photo has many leaves or a busy background.</li>
          <li>It is not a replacement for a local plant doctor.</li>
        </ul>
      </section>
    </div>
  );
}
