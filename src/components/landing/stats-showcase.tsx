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
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <p className="text-2xl font-extrabold tabular-nums text-foreground sm:text-3xl">
        {Math.round(value).toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-5">
      <svg
        viewBox="0 0 128 128"
        className="h-32 w-32"
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
        <text x="64" y="82" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          AI accuracy
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
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
      className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} run={shown} delay={i * 120} />
        ))}
      </div>
      <AccuracyRing run={shown} />
    </section>
  );
}
