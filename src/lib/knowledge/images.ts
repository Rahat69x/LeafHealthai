import bacterial from "@/assets/kb/bacterial.jpg";
import blight from "@/assets/kb/blight.jpg";
import chewingPest from "@/assets/kb/chewing-pest.jpg";
import fungalSpot from "@/assets/kb/fungal-spot.jpg";
import mildew from "@/assets/kb/mildew.jpg";
import minerPest from "@/assets/kb/miner-pest.jpg";
import mitePest from "@/assets/kb/mite-pest.jpg";
import rust from "@/assets/kb/rust.jpg";
import soilPest from "@/assets/kb/soil-pest.jpg";
import soilRoot from "@/assets/kb/soil-root.jpg";
import suckingPest from "@/assets/kb/sucking-pest.jpg";
import virus from "@/assets/kb/virus.jpg";
import healthy from "@/assets/sample-tomato-healthy.jpg";

import type { ImageKey } from "./types";

export const KNOWLEDGE_IMAGES: Record<ImageKey, string> = {
  "fungal-spot": fungalSpot,
  blight,
  mildew,
  rust,
  virus,
  bacterial,
  "soil-root": soilRoot,
  healthy,
  "sucking-pest": suckingPest,
  "chewing-pest": chewingPest,
  "mite-pest": mitePest,
  "soil-pest": soilPest,
  "miner-pest": minerPest,
};
