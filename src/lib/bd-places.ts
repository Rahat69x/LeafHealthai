/**
 * Offline place list for instant autocomplete.
 * Covers every Bangladesh district plus widely used upazilas and farming towns,
 * with a handful of international cities so the box is useful outside Bangladesh too.
 * Anything missing here is filled in live from the Open-Meteo geocoding service.
 */

export type PlaceKind = "district" | "upazila" | "city";

export interface LocalPlace {
  name: string;
  /** Parent district (or country region) shown as the second line. */
  parent: string;
  division: string;
  country: string;
  kind: PlaceKind;
  latitude: number;
  longitude: number;
  /** Extra spellings people type, e.g. "Chittagong" for Chattogram. */
  aliases?: string[];
}

type Row = [
  name: string,
  parent: string,
  division: string,
  kind: PlaceKind,
  lat: number,
  lon: number,
  aliases?: string[],
];

const BD: Row[] = [
  // ---- Dhaka division ----
  ["Dhaka", "Dhaka", "Dhaka", "district", 23.81, 90.41],
  ["Dhamrai", "Dhaka", "Dhaka", "upazila", 23.91, 90.21],
  ["Savar", "Dhaka", "Dhaka", "upazila", 23.86, 90.26],
  ["Keraniganj", "Dhaka", "Dhaka", "upazila", 23.7, 90.36],
  ["Nawabganj", "Dhaka", "Dhaka", "upazila", 23.6, 90.11],
  ["Dohar", "Dhaka", "Dhaka", "upazila", 23.6, 90.09],
  ["Gazipur", "Gazipur", "Dhaka", "district", 23.99, 90.42],
  ["Kaliakair", "Gazipur", "Dhaka", "upazila", 24.07, 90.21],
  ["Sreepur", "Gazipur", "Dhaka", "upazila", 24.2, 90.47],
  ["Narayanganj", "Narayanganj", "Dhaka", "district", 23.62, 90.5],
  ["Araihazar", "Narayanganj", "Dhaka", "upazila", 23.79, 90.66],
  ["Narsingdi", "Narsingdi", "Dhaka", "district", 23.92, 90.72],
  ["Shibpur", "Narsingdi", "Dhaka", "upazila", 24.05, 90.75],
  ["Munshiganj", "Munshiganj", "Dhaka", "district", 23.55, 90.53],
  ["Manikganj", "Manikganj", "Dhaka", "district", 23.86, 90.0],
  ["Tangail", "Tangail", "Dhaka", "district", 24.25, 89.92],
  ["Mirzapur", "Tangail", "Dhaka", "upazila", 24.1, 90.1],
  ["Kishoreganj", "Kishoreganj", "Dhaka", "district", 24.44, 90.78],
  ["Bhairab", "Kishoreganj", "Dhaka", "upazila", 24.05, 90.98],
  ["Gopalganj", "Gopalganj", "Dhaka", "district", 23.01, 89.83],
  ["Madaripur", "Madaripur", "Dhaka", "district", 23.16, 90.19],
  ["Shariatpur", "Shariatpur", "Dhaka", "district", 23.21, 90.35],
  ["Rajbari", "Rajbari", "Dhaka", "district", 23.76, 89.64],
  ["Faridpur", "Faridpur", "Dhaka", "district", 23.6, 89.83],
  ["Bhanga", "Faridpur", "Dhaka", "upazila", 23.38, 89.98],

  // ---- Chattogram division ----
  ["Chattogram", "Chattogram", "Chattogram", "district", 22.36, 91.78, ["Chittagong", "Ctg"]],
  ["Hathazari", "Chattogram", "Chattogram", "upazila", 22.5, 91.81],
  ["Patiya", "Chattogram", "Chattogram", "upazila", 22.29, 91.98],
  ["Sitakunda", "Chattogram", "Chattogram", "upazila", 22.62, 91.66],
  ["Rangamati", "Rangamati", "Chattogram", "district", 22.65, 92.17],
  ["Khagrachhari", "Khagrachhari", "Chattogram", "district", 23.12, 91.98, ["Khagrachari"]],
  ["Bandarban", "Bandarban", "Chattogram", "district", 22.19, 92.22],
  [
    "Cox's Bazar",
    "Cox's Bazar",
    "Chattogram",
    "district",
    21.44,
    91.98,
    ["Coxs Bazar", "Cox Bazar"],
  ],
  ["Chakaria", "Cox's Bazar", "Chattogram", "upazila", 21.78, 92.08],
  ["Teknaf", "Cox's Bazar", "Chattogram", "upazila", 20.86, 92.3],
  ["Cumilla", "Cumilla", "Chattogram", "district", 23.46, 91.18, ["Comilla"]],
  ["Chandina", "Cumilla", "Chattogram", "upazila", 23.49, 90.98],
  ["Brahmanbaria", "Brahmanbaria", "Chattogram", "district", 23.96, 91.11],
  ["Chandpur", "Chandpur", "Chattogram", "district", 23.23, 90.65],
  ["Feni", "Feni", "Chattogram", "district", 23.02, 91.4],
  ["Noakhali", "Noakhali", "Chattogram", "district", 22.87, 91.1],
  ["Begumganj", "Noakhali", "Chattogram", "upazila", 22.94, 91.11],
  ["Lakshmipur", "Lakshmipur", "Chattogram", "district", 22.94, 90.83],

  // ---- Rajshahi division ----
  ["Rajshahi", "Rajshahi", "Rajshahi", "district", 24.37, 88.6],
  ["Puthia", "Rajshahi", "Rajshahi", "upazila", 24.37, 88.85],
  ["Bagha", "Rajshahi", "Rajshahi", "upazila", 24.2, 88.83],
  ["Bogura", "Bogura", "Rajshahi", "district", 24.85, 89.37, ["Bogra"]],
  ["Dhunat", "Bogura", "Rajshahi", "upazila", 24.71, 89.55],
  ["Sherpur", "Bogura", "Rajshahi", "upazila", 24.66, 89.42],
  ["Shibganj", "Bogura", "Rajshahi", "upazila", 24.96, 89.28],
  ["Sariakandi", "Bogura", "Rajshahi", "upazila", 24.87, 89.55],
  ["Naogaon", "Naogaon", "Rajshahi", "district", 24.8, 88.94],
  ["Natore", "Natore", "Rajshahi", "district", 24.42, 89.0],
  ["Chapainawabganj", "Chapainawabganj", "Rajshahi", "district", 24.6, 88.28, ["Chapai Nawabganj"]],
  ["Pabna", "Pabna", "Rajshahi", "district", 24.0, 89.24],
  ["Ishwardi", "Pabna", "Rajshahi", "upazila", 24.13, 89.07],
  ["Sirajganj", "Sirajganj", "Rajshahi", "district", 24.45, 89.7],
  ["Joypurhat", "Joypurhat", "Rajshahi", "district", 25.1, 89.02],

  // ---- Rangpur division ----
  ["Rangpur", "Rangpur", "Rangpur", "district", 25.75, 89.25],
  ["Badarganj", "Rangpur", "Rangpur", "upazila", 25.67, 89.05],
  ["Dinajpur", "Dinajpur", "Rangpur", "district", 25.63, 88.64],
  ["Chirirbandar", "Dinajpur", "Rangpur", "upazila", 25.71, 88.79],
  ["Parbatipur", "Dinajpur", "Rangpur", "upazila", 25.66, 88.92],
  ["Birganj", "Dinajpur", "Rangpur", "upazila", 25.94, 88.65],
  ["Thakurgaon", "Thakurgaon", "Rangpur", "district", 26.03, 88.46],
  ["Panchagarh", "Panchagarh", "Rangpur", "district", 26.33, 88.55],
  ["Nilphamari", "Nilphamari", "Rangpur", "district", 25.93, 88.86],
  ["Saidpur", "Nilphamari", "Rangpur", "upazila", 25.78, 88.89],
  ["Lalmonirhat", "Lalmonirhat", "Rangpur", "district", 25.92, 89.45],
  ["Kurigram", "Kurigram", "Rangpur", "district", 25.81, 89.64],
  ["Gaibandha", "Gaibandha", "Rangpur", "district", 25.33, 89.53],

  // ---- Khulna division ----
  ["Khulna", "Khulna", "Khulna", "district", 22.81, 89.56],
  ["Dumuria", "Khulna", "Khulna", "upazila", 22.75, 89.4],
  ["Jashore", "Jashore", "Khulna", "district", 23.17, 89.21, ["Jessore"]],
  ["Jhikargachha", "Jashore", "Khulna", "upazila", 23.1, 89.09],
  ["Satkhira", "Satkhira", "Khulna", "district", 22.72, 89.07],
  ["Bagerhat", "Bagerhat", "Khulna", "district", 22.66, 89.79],
  ["Kushtia", "Kushtia", "Khulna", "district", 23.9, 89.12],
  ["Bheramara", "Kushtia", "Khulna", "upazila", 24.02, 88.99],
  ["Chuadanga", "Chuadanga", "Khulna", "district", 23.64, 88.85],
  ["Meherpur", "Meherpur", "Khulna", "district", 23.76, 88.63],
  ["Jhenaidah", "Jhenaidah", "Khulna", "district", 23.54, 89.17],
  ["Magura", "Magura", "Khulna", "district", 23.49, 89.42],
  ["Narail", "Narail", "Khulna", "district", 23.17, 89.5],

  // ---- Barishal division ----
  ["Barishal", "Barishal", "Barishal", "district", 22.7, 90.37, ["Barisal"]],
  ["Bakerganj", "Barishal", "Barishal", "upazila", 22.55, 90.34],
  ["Patuakhali", "Patuakhali", "Barishal", "district", 22.36, 90.33],
  ["Kalapara", "Patuakhali", "Barishal", "upazila", 21.98, 90.24],
  ["Bhola", "Bhola", "Barishal", "district", 22.69, 90.65],
  ["Pirojpur", "Pirojpur", "Barishal", "district", 22.58, 89.98],
  ["Jhalokati", "Jhalokati", "Barishal", "district", 22.64, 90.2],
  ["Barguna", "Barguna", "Barishal", "district", 22.15, 90.13],

  // ---- Sylhet division ----
  ["Sylhet", "Sylhet", "Sylhet", "district", 24.9, 91.87],
  ["Beanibazar", "Sylhet", "Sylhet", "upazila", 24.82, 92.17],
  ["Moulvibazar", "Moulvibazar", "Sylhet", "district", 24.48, 91.78, ["Maulvibazar"]],
  ["Srimangal", "Moulvibazar", "Sylhet", "upazila", 24.31, 91.73, ["Sreemangal"]],
  ["Habiganj", "Habiganj", "Sylhet", "district", 24.38, 91.42],
  ["Sunamganj", "Sunamganj", "Sylhet", "district", 25.07, 91.4],
  ["Dharmapasha", "Sunamganj", "Sylhet", "upazila", 24.86, 91.03],
  ["Chhatak", "Sunamganj", "Sylhet", "upazila", 25.03, 91.66],

  // ---- Mymensingh division ----
  ["Mymensingh", "Mymensingh", "Mymensingh", "district", 24.75, 90.4],
  ["Trishal", "Mymensingh", "Mymensingh", "upazila", 24.58, 90.4],
  ["Bhaluka", "Mymensingh", "Mymensingh", "upazila", 24.4, 90.4],
  ["Fulbaria", "Mymensingh", "Mymensingh", "upazila", 24.65, 90.27],
  ["Jamalpur", "Jamalpur", "Mymensingh", "district", 24.92, 89.94],
  ["Sherpur (Mymensingh)", "Sherpur", "Mymensingh", "district", 25.02, 90.02],
  ["Netrokona", "Netrokona", "Mymensingh", "district", 24.88, 90.73, ["Netrakona"]],
];

const WORLD: LocalPlace[] = [
  {
    name: "Kolkata",
    parent: "West Bengal",
    division: "West Bengal",
    country: "India",
    kind: "city",
    latitude: 22.57,
    longitude: 88.36,
  },
  {
    name: "Delhi",
    parent: "Delhi",
    division: "Delhi",
    country: "India",
    kind: "city",
    latitude: 28.61,
    longitude: 77.21,
  },
  {
    name: "Karachi",
    parent: "Sindh",
    division: "Sindh",
    country: "Pakistan",
    kind: "city",
    latitude: 24.86,
    longitude: 67.01,
  },
  {
    name: "Kathmandu",
    parent: "Bagmati",
    division: "Bagmati",
    country: "Nepal",
    kind: "city",
    latitude: 27.72,
    longitude: 85.32,
  },
  {
    name: "Yangon",
    parent: "Yangon",
    division: "Yangon",
    country: "Myanmar",
    kind: "city",
    latitude: 16.87,
    longitude: 96.2,
  },
  {
    name: "Bangkok",
    parent: "Bangkok",
    division: "Bangkok",
    country: "Thailand",
    kind: "city",
    latitude: 13.76,
    longitude: 100.5,
  },
  {
    name: "Colombo",
    parent: "Western",
    division: "Western",
    country: "Sri Lanka",
    kind: "city",
    latitude: 6.93,
    longitude: 79.86,
  },
];

export const LOCAL_PLACES: LocalPlace[] = [
  ...BD.map(([name, parent, division, kind, latitude, longitude, aliases]) => ({
    name,
    parent,
    division,
    country: "Bangladesh",
    kind,
    latitude,
    longitude,
    ...(aliases ? { aliases } : {}),
  })),
  ...WORLD,
];
