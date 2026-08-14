/** Crops the advisor understands, with the weather rules that matter for each one. */

import type { WeatherNow } from "./weather";

export interface Crop {
  id: string;
  name: string;
  /** Diseases this crop gets when the weather turns against it. */
  watch: string[];
  idealTemp: [number, number];
  /** Humidity above this is trouble for the crop. */
  humidityLimit: number;
  waterNeed: "low" | "medium" | "high";
}

export const CROPS: Crop[] = [
  {
    id: "rice",
    name: "Rice",
    watch: ["Rice blast", "Bacterial leaf blight", "Sheath blight"],
    idealTemp: [22, 32],
    humidityLimit: 85,
    waterNeed: "high",
  },
  {
    id: "tomato",
    name: "Tomato",
    watch: ["Late blight", "Early blight", "Leaf curl virus"],
    idealTemp: [18, 28],
    humidityLimit: 80,
    waterNeed: "medium",
  },
  {
    id: "potato",
    name: "Potato",
    watch: ["Late blight", "Black scurf"],
    idealTemp: [15, 24],
    humidityLimit: 80,
    waterNeed: "medium",
  },
  {
    id: "mango",
    name: "Mango",
    watch: ["Anthracnose", "Powdery mildew", "Hopper attack"],
    idealTemp: [24, 34],
    humidityLimit: 85,
    waterNeed: "low",
  },
  {
    id: "banana",
    name: "Banana",
    watch: ["Sigatoka leaf spot", "Panama wilt"],
    idealTemp: [24, 32],
    humidityLimit: 88,
    waterNeed: "high",
  },
  {
    id: "cucumber",
    name: "Cucumber",
    watch: ["Downy mildew", "Powdery mildew"],
    idealTemp: [20, 30],
    humidityLimit: 82,
    waterNeed: "high",
  },
  {
    id: "brinjal",
    name: "Brinjal",
    watch: ["Fruit and shoot borer", "Bacterial wilt"],
    idealTemp: [21, 32],
    humidityLimit: 85,
    waterNeed: "medium",
  },
  {
    id: "chili",
    name: "Chili",
    watch: ["Anthracnose", "Leaf curl", "Thrips"],
    idealTemp: [20, 32],
    humidityLimit: 80,
    waterNeed: "medium",
  },
  {
    id: "onion",
    name: "Onion",
    watch: ["Purple blotch", "Downy mildew"],
    idealTemp: [15, 27],
    humidityLimit: 78,
    waterNeed: "low",
  },
  {
    id: "garlic",
    name: "Garlic",
    watch: ["Purple blotch", "White rot"],
    idealTemp: [13, 25],
    humidityLimit: 78,
    waterNeed: "low",
  },
  {
    id: "mustard",
    name: "Mustard",
    watch: ["Alternaria blight", "White rust", "Aphids"],
    idealTemp: [10, 25],
    humidityLimit: 80,
    waterNeed: "low",
  },
  {
    id: "maize",
    name: "Maize",
    watch: ["Fall armyworm", "Leaf blight"],
    idealTemp: [18, 32],
    humidityLimit: 85,
    waterNeed: "medium",
  },
  {
    id: "wheat",
    name: "Wheat",
    watch: ["Rust", "Blast", "Powdery mildew"],
    idealTemp: [12, 24],
    humidityLimit: 80,
    waterNeed: "low",
  },
];

export function cropById(id: string): Crop {
  return CROPS.find((crop) => crop.id === id) ?? CROPS[0]!;
}

export interface CropAdvice {
  tone: "good" | "watch" | "bad";
  text: string;
}

/** Turns the live numbers into sentences a farmer can act on for one crop. */
export function cropAdvice(
  crop: Crop,
  now: WeatherNow,
  rainNext24: number,
  rainChanceNext24: number,
): CropAdvice[] {
  const list: CropAdvice[] = [];
  const [low, high] = crop.idealTemp;

  if (now.humidity >= crop.humidityLimit) {
    list.push({
      tone: "bad",
      text: `Humidity is ${now.humidity}%, above the safe line for ${crop.name.toLowerCase()}. This raises the chance of ${crop.watch[0]?.toLowerCase()}. Open up the canopy and check lower leaves today.`,
    });
  } else if (now.humidity >= crop.humidityLimit - 10) {
    list.push({
      tone: "watch",
      text: `Humidity is close to the limit for ${crop.name.toLowerCase()}. Keep leaves dry and water at the root only.`,
    });
  }

  if (now.temperature > high) {
    list.push({
      tone: "watch",
      text: `${now.temperature}°C is hotter than ${crop.name.toLowerCase()} likes (${low}–${high}°C). Irrigate before 9am and mulch to hold soil moisture.`,
    });
  } else if (now.temperature < low) {
    list.push({
      tone: "watch",
      text: `${now.temperature}°C is cooler than ${crop.name.toLowerCase()} likes (${low}–${high}°C). Growth will slow, so hold back on heavy nitrogen.`,
    });
  } else {
    list.push({
      tone: "good",
      text: `Temperature is in the good range for ${crop.name.toLowerCase()}.`,
    });
  }

  if (rainChanceNext24 >= 60 || rainNext24 >= 5) {
    list.push({
      tone: "bad",
      text: `Rain is likely in the next 24 hours (${rainChanceNext24}% chance, about ${rainNext24} mm). Do not spray ${crop.name.toLowerCase()} today, the medicine will wash off. Spray after the rain passes and leaves dry.`,
    });
  } else if (now.wind >= 15) {
    list.push({
      tone: "watch",
      text: `Wind is ${now.wind} km/h, too strong for a clean spray on ${crop.name.toLowerCase()}. Wait for a calm hour, usually early morning.`,
    });
  } else {
    list.push({
      tone: "good",
      text: `Calm and dry: a good window to spray or fertilise ${crop.name.toLowerCase()}.`,
    });
  }

  if (crop.waterNeed === "high" && rainNext24 < 2 && now.temperature >= 30) {
    list.push({
      tone: "watch",
      text: `${crop.name} drinks a lot and no rain is coming. Keep standing water or irrigate today.`,
    });
  }
  if (crop.waterNeed === "low" && rainNext24 >= 15) {
    list.push({
      tone: "watch",
      text: `${crop.name} hates wet feet. Clear the drains before the rain arrives to avoid root rot.`,
    });
  }
  if (now.leafWetnessHours >= 8) {
    list.push({
      tone: "bad",
      text: `Leaves will stay damp for about ${now.leafWetnessHours} hours, the trigger for ${crop.watch.join(", ").toLowerCase()}. Scout the field tomorrow morning.`,
    });
  }
  return list;
}
