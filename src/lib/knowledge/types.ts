export type KnowledgeCategory = "disease" | "pest";

export type KnowledgeKind =
  | "Fungal"
  | "Oomycete"
  | "Bacterial"
  | "Viral"
  | "Soil-borne"
  | "Reference"
  | "Sap-sucking insect"
  | "Chewing insect"
  | "Mite"
  | "Boring insect"
  | "Soil insect"
  | "Mollusc"
  | "Roundworm";

export type Severity = "Low" | "Medium" | "High" | "Very High";
export type Difficulty = "Easy" | "Moderate" | "Hard";
export type Season = "Spring" | "Summer" | "Monsoon" | "Autumn" | "Winter" | "All year";

export type WeatherTrigger =
  | "Warm and humid"
  | "Cool and wet"
  | "Hot and dry"
  | "Heavy rain"
  | "Dew and fog"
  | "Poor airflow"
  | "Waterlogged soil"
  | "Mild and dry";

export type ImageKey =
  | "fungal-spot"
  | "blight"
  | "mildew"
  | "rust"
  | "virus"
  | "bacterial"
  | "soil-root"
  | "healthy"
  | "sucking-pest"
  | "chewing-pest"
  | "mite-pest"
  | "soil-pest"
  | "miner-pest";

export interface KnowledgeEntry {
  /** URL-safe id. Stable: used in links and related lists. */
  slug: string;
  name: string;
  scientificName: string;
  category: KnowledgeCategory;
  kind: KnowledgeKind;
  image: ImageKey;
  /** One or two plain sentences shown on the card. */
  summary: string;
  identification: string[];
  symptoms: string[];
  causes: string[];
  weather: WeatherTrigger[];
  weatherNote: string;
  plants: string[];
  severity: Severity;
  difficulty: Difficulty;
  seasons: Season[];
  prevention: string[];
  organic: string[];
  /** General guidance only — never a prescription. */
  chemical: string[];
  practices: string[];
  /** Free-text words used by search: symptoms, local names, look-alikes. */
  tags: string[];
  related: string[];
  reviewed: string;
  added: string;
  /** Relative reading interest, 0-100. Drives "popular" and "trending". */
  popularity: number;
}
