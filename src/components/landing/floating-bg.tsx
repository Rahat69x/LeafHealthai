const LEAVES = [
  { left: "6%", delay: "0s", dur: "22s", size: 22, o: 0.16 },
  { left: "22%", delay: "-6s", dur: "27s", size: 14, o: 0.12 },
  { left: "41%", delay: "-13s", dur: "31s", size: 18, o: 0.1 },
  { left: "63%", delay: "-3s", dur: "25s", size: 26, o: 0.14 },
  { left: "78%", delay: "-17s", dur: "29s", size: 16, o: 0.12 },
  { left: "92%", delay: "-9s", dur: "24s", size: 20, o: 0.1 },
];

/** Decorative, non-interactive background: soft gradient blobs + drifting leaves. */
export function FloatingBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fern/20 blur-3xl motion-safe:animate-[drift_18s_ease-in-out_infinite]" />
      <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-moss/20 blur-3xl motion-safe:animate-[drift_24s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber/15 blur-3xl motion-safe:animate-[drift_28s_ease-in-out_infinite]" />
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="absolute top-full block rounded-full bg-fern motion-safe:animate-[float-up_linear_infinite]"
          style={{
            left: l.left,
            opacity: l.o,
            animationDuration: l.dur,
            animationDelay: l.delay,
            width: l.size,
            height: l.size,
          }}
        />
      ))}
    </div>
  );
}
