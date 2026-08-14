import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Droplet, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

const TITLE = "About LeafCheck | AI for smarter agriculture in Bangladesh";
const DESCRIPTION =
  "Meet the CSE student team building accessible AI tools to help farmers identify plant diseases and improve crop health in Bangladesh.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const VALUES = [
  {
    icon: Leaf,
    title: "Useful AI, not AI for show",
    text: "We focus on practical tools that turn a plant photo into a clearer next step for growers.",
  },
  {
    icon: Droplet,
    title: "Built with Bangladesh in mind",
    text: "Agriculture is central to life and livelihoods here. We are building for the crops, conditions and communities around us.",
  },
  {
    icon: Leaf,
    title: "Accessible by design",
    text: "Our goal is to make helpful agricultural technology easier to understand and easier to use.",
  },
];

function AboutPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b bg-forest-deep text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
              <Leaf className="size-4" aria-hidden="true" /> About LeafCheck
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Technology that helps agriculture move forward.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sidebar-muted sm:text-xl">
              We are a team of Computer Science and Engineering students passionate about applying
              Artificial Intelligence to solve real-world agricultural challenges.
            </p>
          </div>
          <div className="border-l border-sidebar-border pl-6 lg:mb-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-sidebar-muted">
              Our starting point
            </p>
            <p className="mt-3 text-2xl font-semibold leading-snug text-sidebar-foreground">
              Helping people spot crop health problems earlier, with tools that feel simple enough
              for everyday use.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Why we started
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A student project with a real-world purpose.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              As Bangladesh is a country where agriculture plays a vital role, we started this
              project to help farmers identify plant diseases quickly and accurately.
            </p>
            <p>
              Our goal is to build innovative, accessible, and AI-powered solutions that improve
              crop health, increase productivity, and contribute to the future of smart agriculture
              in Bangladesh.
            </p>
            <p>
              This is just the beginning—we are committed to continuously improving our platform and
              supporting the agricultural community through technology.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              What guides us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built to be helpful in the field.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {VALUES.map((value) => (
              <article key={value.title} className="rounded-2xl border bg-card p-6">
                <value.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-bold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Help us make LeafCheck better.
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Try a scan, explore the knowledge center, or share an idea that could make plant care
              easier for your community.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/contact">
              Get in touch <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
