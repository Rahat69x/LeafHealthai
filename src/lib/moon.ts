/** Moon phase, useful for night field work and for pest activity notes. */

export interface MoonPhase {
  /** 0 = new moon, 0.5 = full moon. */
  fraction: number;
  name: string;
  /** How much of the disc is lit, 0-100. */
  illumination: number;
}

const NAMES: { limit: number; name: string }[] = [
  { limit: 0.03, name: "New moon" },
  { limit: 0.22, name: "Waxing crescent" },
  { limit: 0.28, name: "First quarter" },
  { limit: 0.47, name: "Waxing gibbous" },
  { limit: 0.53, name: "Full moon" },
  { limit: 0.72, name: "Waning gibbous" },
  { limit: 0.78, name: "Last quarter" },
  { limit: 0.97, name: "Waning crescent" },
];

const SYNODIC = 29.530588853;
/** A known new moon: 6 Jan 2000, 18:14 UTC. */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

export function moonPhase(date = new Date()): MoonPhase {
  const days = date.getTime() / 86400000 - KNOWN_NEW_MOON;
  const fraction = (((days / SYNODIC) % 1) + 1) % 1;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fraction)) * 50);
  const match = NAMES.find((item) => fraction < item.limit) ?? NAMES[0]!;
  return { fraction, name: match.name, illumination };
}
