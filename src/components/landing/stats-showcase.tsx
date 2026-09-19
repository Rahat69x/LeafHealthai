import { useCountUp, useReveal } from "./use-reveal";

const STATS = [
  { label: "Leaves analysed", to: 128450, suffix: "+" },
  { label: "Diseases detected", to: 41320, suffix: "+" },
  { label: "Healthy plants confirmed", to: 87130, suffix: "+" },
  { label: "Supported plant types", to: 32, suffix: "" },
];

function Stat({
  label,
  to,
  suffix,
  run,
  delay,
}: {
  label: string;
  to: number;
  suffix: string;
  run: boolean;
  delay: number;
}) {
  const value = useCountUp(to, run, 1600 + delay);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 p-6 text-center shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1">
      <p className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-4xl bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text">
        {Math.round(value).toLocaleString()}
        <span className="text-emerald-600 dark:text-emerald-400">{suffix}</span>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function AccuracyRing({ run }: { run: boolean }) {
  const target = 98.7;
  const value = useCountUp(target, run, 1800, 1);
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 p-6 text-center shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <svg
        viewBox="0 0 128 128"
        className="h-32 w-32 drop-shadow-md"
        role="img"
        aria-label={`AI accuracy ${target} percent`}
      >
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--color-fern)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
        />
        <text
          x="64"
          y="62"
          textAnchor="middle"
          className="fill-foreground text-[20px] font-extrabold"
        >
          {value.toFixed(1)}%
        </text>
        <text
          x="64"
          y="82"
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wider"
        >
          AI accuracy
        </text>
      </svg>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Validated on held-out leaf photos across supported crops.
      </p>
    </div>
  );
}

export function StatsShowcase() {
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="Platform statistics"
      className="grid gap-4.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      <div className="grid gap-4.5 sm:grid-cols-2">
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} run={shown} delay={i * 120} />
        ))}
      </div>
      <AccuracyRing run={shown} />
    </section>
  );
}
