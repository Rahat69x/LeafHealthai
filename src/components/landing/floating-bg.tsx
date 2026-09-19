import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./use-reveal";

const LEAVES = [
  { left: "8%", delay: "0s", dur: "24s", size: 24, o: 0.2 },
  { left: "24%", delay: "-5s", dur: "28s", size: 16, o: 0.15 },
  { left: "45%", delay: "-12s", dur: "32s", size: 20, o: 0.12 },
  { left: "68%", delay: "-3s", dur: "26s", size: 28, o: 0.18 },
  { left: "82%", delay: "-16s", dur: "30s", size: 18, o: 0.14 },
  { left: "94%", delay: "-8s", dur: "25s", size: 22, o: 0.12 },
];

/** Multi-layered organic depth: glowing liquid blobs + subtle parallax + floating leaves */
export function FloatingBg() {
  const reduced = usePrefersReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1: Deep ambient liquid blobs */}
      <div
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/25 dark:bg-emerald-500/20 blur-[90px] transition-transform duration-700 ease-out motion-safe:animate-[blob-breathe_16s_ease-in-out_infinite]"
        style={{
          transform: `translate3d(${offset.x * 0.6}px, ${offset.y * 0.6}px, 0)`,
        }}
      />
      <div
        className="absolute -right-24 top-16 h-[26rem] w-[26rem] rounded-full bg-teal-500/25 dark:bg-teal-400/15 blur-[100px] transition-transform duration-700 ease-out motion-safe:animate-[blob-breathe_20s_ease-in-out_infinite_reverse]"
        style={{
          transform: `translate3d(${-offset.x * 0.8}px, ${-offset.y * 0.8}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-4 left-1/3 h-80 w-80 rounded-full bg-lime-400/20 dark:bg-lime-500/15 blur-[85px] transition-transform duration-700 ease-out motion-safe:animate-[blob-breathe_24s_ease-in-out_infinite]"
        style={{
          transform: `translate3d(${offset.x * 0.4}px, ${offset.y * 0.4}px, 0)`,
        }}
      />

      {/* Layer 2: Subtle glass water texture sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Layer 3: Floating soft particles/leaves */}
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="absolute top-full block rounded-full bg-gradient-to-tr from-fern to-emerald-300 shadow-[0_2px_8px_rgba(47,122,63,0.3)] motion-safe:animate-[float-up_linear_infinite]"
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
