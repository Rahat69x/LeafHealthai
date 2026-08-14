/** Simple area list used for area-wise disease info and the risk map. */

export interface Area {
  city: string;
  district: string;
  division: string;
  country: string;
  latitude: number;
  longitude: number;
  commonDiseases: string[];
  seasonalRisks: string[];
  prevention: string[];
}

export const AREAS: Area[] = [
  {
    city: "Dhaka",
    district: "Dhaka",
    division: "Dhaka",
    country: "Bangladesh",
    latitude: 23.81,
    longitude: 90.41,
    commonDiseases: ["Early Blight", "Bacterial Spot", "Leaf Curl"],
    seasonalRisks: ["Fungus in the rainy season", "Mites in the dry winter"],
    prevention: [
      "Keep the soil covered with straw",
      "Do not water the leaves",
      "Remove old plant waste weekly",
    ],
  },
  {
    city: "Gazipur",
    district: "Gazipur",
    division: "Dhaka",
    country: "Bangladesh",
    latitude: 23.99,
    longitude: 90.42,
    commonDiseases: ["Early Blight", "Powdery Mildew"],
    seasonalRisks: ["Heavy dew in autumn", "Wet soil after rain"],
    prevention: ["Make raised beds", "Give plants more space", "Check lower leaves twice a week"],
  },
  {
    city: "Chattogram",
    district: "Chattogram",
    division: "Chattogram",
    country: "Bangladesh",
    latitude: 22.36,
    longitude: 91.78,
    commonDiseases: ["Late Blight", "Leaf Rust", "Anthracnose"],
    seasonalRisks: ["Long rainy season", "Salty wind near the coast"],
    prevention: ["Drain water from the field", "Spray only on dry leaves", "Use disease free seed"],
  },
  {
    city: "Sylhet",
    district: "Sylhet",
    division: "Sylhet",
    country: "Bangladesh",
    latitude: 24.9,
    longitude: 91.87,
    commonDiseases: ["Late Blight", "Downy Mildew", "Leaf Rust"],
    seasonalRisks: ["Very high rainfall", "Standing water in low fields"],
    prevention: ["Plant on ridges", "Clean the drains before rain", "Remove sick leaves fast"],
  },
  {
    city: "Rajshahi",
    district: "Rajshahi",
    division: "Rajshahi",
    country: "Bangladesh",
    latitude: 24.37,
    longitude: 88.6,
    commonDiseases: ["Powdery Mildew", "Leaf Spot"],
    seasonalRisks: ["Dry hot summer", "Dust on leaves"],
    prevention: [
      "Water at the root in the morning",
      "Rinse dusty leaves",
      "Use shade for young plants",
    ],
  },
  {
    city: "Khulna",
    district: "Khulna",
    division: "Khulna",
    country: "Bangladesh",
    latitude: 22.85,
    longitude: 89.54,
    commonDiseases: ["Bacterial Spot", "Late Blight"],
    seasonalRisks: ["Salty water", "Storms in the rainy season"],
    prevention: ["Use clean water for spraying", "Tie tall plants", "Keep fields well drained"],
  },
  {
    city: "Rangpur",
    district: "Rangpur",
    division: "Rangpur",
    country: "Bangladesh",
    latitude: 25.75,
    longitude: 89.25,
    commonDiseases: ["Early Blight", "Leaf Rust"],
    seasonalRisks: ["Cold foggy winter", "Sudden floods"],
    prevention: ["Avoid evening watering in winter", "Change the planting spot each year"],
  },
  {
    city: "Barishal",
    district: "Barishal",
    division: "Barishal",
    country: "Bangladesh",
    latitude: 22.7,
    longitude: 90.37,
    commonDiseases: ["Downy Mildew", "Late Blight"],
    seasonalRisks: ["Water logging", "High humidity most of the year"],
    prevention: ["Raise the beds", "Keep space between rows", "Remove weeds often"],
  },
  {
    city: "Mymensingh",
    district: "Mymensingh",
    division: "Mymensingh",
    country: "Bangladesh",
    latitude: 24.75,
    longitude: 90.4,
    commonDiseases: ["Early Blight", "Bacterial Spot"],
    seasonalRisks: ["Wet monsoon", "Warm nights"],
    prevention: ["Use straw mulch", "Do not work in wet fields", "Clean your tools"],
  },
  {
    city: "Kolkata",
    district: "Kolkata",
    division: "West Bengal",
    country: "India",
    latitude: 22.57,
    longitude: 88.36,
    commonDiseases: ["Leaf Curl", "Early Blight", "Anthracnose"],
    seasonalRisks: ["Monsoon fungus", "Hot humid summer"],
    prevention: ["Water in the morning", "Remove infected leaves", "Improve air flow"],
  },
  {
    city: "Delhi",
    district: "New Delhi",
    division: "Delhi",
    country: "India",
    latitude: 28.61,
    longitude: 77.21,
    commonDiseases: ["Powdery Mildew", "Leaf Spot"],
    seasonalRisks: ["Dry heat", "Winter fog and dew"],
    prevention: ["Shade nets in summer", "Clean dusty leaves", "Avoid night watering"],
  },
  {
    city: "Mumbai",
    district: "Mumbai",
    division: "Maharashtra",
    country: "India",
    latitude: 19.08,
    longitude: 72.88,
    commonDiseases: ["Late Blight", "Downy Mildew"],
    seasonalRisks: ["Very heavy monsoon", "Salty coastal wind"],
    prevention: ["Drain pots and beds", "Spray only on dry days", "Space out the plants"],
  },
  {
    city: "Lahore",
    district: "Lahore",
    division: "Punjab",
    country: "Pakistan",
    latitude: 31.55,
    longitude: 74.34,
    commonDiseases: ["Leaf Rust", "Powdery Mildew"],
    seasonalRisks: ["Dry spring winds", "Foggy winter"],
    prevention: ["Rotate crops each year", "Use clean seed", "Keep fields weed free"],
  },
  {
    city: "Kathmandu",
    district: "Kathmandu",
    division: "Bagmati",
    country: "Nepal",
    latitude: 27.72,
    longitude: 85.32,
    commonDiseases: ["Late Blight", "Leaf Spot"],
    seasonalRisks: ["Cool wet monsoon", "Cold nights"],
    prevention: ["Plant on ridges", "Remove sick plants quickly", "Do not water in the evening"],
  },
];

export const COUNTRIES = [...new Set(AREAS.map((area) => area.country))];

export function divisionsOf(country: string) {
  return [
    ...new Set(AREAS.filter((area) => area.country === country).map((area) => area.division)),
  ];
}

export function districtsOf(country: string, division: string) {
  return [
    ...new Set(
      AREAS.filter((area) => area.country === country && area.division === division).map(
        (area) => area.district,
      ),
    ),
  ];
}

export function citiesOf(country: string, division: string, district: string) {
  return AREAS.filter(
    (area) => area.country === country && area.division === division && area.district === district,
  ).map((area) => area.city);
}

export function findArea(country: string, division: string, district: string, city: string) {
  return AREAS.find(
    (area) =>
      area.country === country &&
      area.division === division &&
      area.district === district &&
      area.city === city,
  );
}
