import tomatoHealthy from "@/assets/sample-tomato-healthy.jpg";
import potatoBlight from "@/assets/sample-potato-blight.jpg";
import riceBlast from "@/assets/sample-rice-blast.jpg";

export type Sample = {
  src: string;
  plant: string;
  disease: string;
  healthy: boolean;
  confidence: number;
  hotspots: { x: number; y: number; r: number }[];
  advice: string;
  /** Leaves the demo draws boxes around, in percent of the image. */
  leaves: { x: number; y: number; w: number; h: number; healthy: boolean }[];
};

export const SAMPLES: Sample[] = [
  {
    src: tomatoHealthy,
    plant: "Tomato",
    disease: "Healthy",
    healthy: true,
    confidence: 98,
    hotspots: [],
    advice: "No action needed. Keep watering at the base and check again in a week.",
    leaves: [
      { x: 22, y: 54, w: 32, h: 34, healthy: true },
      { x: 52, y: 26, w: 36, h: 38, healthy: true },
    ],
  },
  {
    src: potatoBlight,
    plant: "Potato",
    disease: "Late blight",
    healthy: false,
    confidence: 94,
    hotspots: [
      { x: 42, y: 32, r: 13 },
      { x: 62, y: 45, r: 9 },
      { x: 38, y: 62, r: 11 },
    ],
    advice: "Remove infected leaves, avoid overhead watering, and keep plants apart for airflow.",
    leaves: [
      { x: 20, y: 16, w: 42, h: 42, healthy: false },
      { x: 48, y: 34, w: 36, h: 38, healthy: false },
      { x: 16, y: 52, w: 34, h: 36, healthy: true },
    ],
  },
  {
    src: riceBlast,
    plant: "Rice",
    disease: "Leaf blast",
    healthy: false,
    confidence: 91,
    hotspots: [
      { x: 35, y: 55, r: 10 },
      { x: 52, y: 52, r: 8 },
    ],
    advice:
      "Drain the field for a short spell and lower nitrogen dose until lesions stop spreading.",
    leaves: [
      { x: 18, y: 26, w: 34, h: 46, healthy: false },
      { x: 46, y: 30, w: 36, h: 44, healthy: false },
    ],
  },
];

export const SUPPORTED_PLANTS = [
  { name: "Tomato", diseases: 9 },
  { name: "Potato", diseases: 7 },
  { name: "Rice", diseases: 6 },
  { name: "Wheat", diseases: 5 },
  { name: "Maize", diseases: 6 },
  { name: "Mango", diseases: 5 },
  { name: "Banana", diseases: 4 },
  { name: "Chilli", diseases: 5 },
  { name: "Grape", diseases: 4 },
  { name: "Apple", diseases: 4 },
  { name: "Cotton", diseases: 3 },
  { name: "Tea", diseases: 3 },
];

export const TESTIMONIALS = [
  {
    name: "Rafiq H.",
    place: "Rangpur, Bangladesh",
    text: "I photographed a potato leaf at dawn and got a clear late blight warning. I removed the leaves that day and saved the row.",
  },
  {
    name: "Meera S.",
    place: "Nashik, India",
    text: "It refused a blurry photo instead of guessing. That honesty is why I trust the results now.",
  },
  {
    name: "Tanvir A.",
    place: "Comilla, Bangladesh",
    text: "The Bangla treatment steps are simple enough that my father can follow them without me.",
  },
  {
    name: "Priya K.",
    place: "Pune, India",
    text: "The weather risk card told me a humid week was coming, so I sprayed early. No blight this season.",
  },
];
