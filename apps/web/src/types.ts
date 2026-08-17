export interface FlagColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface AdminLevelConfig {
  number: number;
  name: string;
  plural: string;
  label: string;
}

export interface CountryConfig {
  id: string;
  iso2: string;
  name: string;
  flagColors: FlagColors;
  dataSource: string;
  dataYear: number;
  levels: AdminLevelConfig[];
  map: {
    center: [number, number];
    zoom: number;
  };
}

export interface AdminUnitCounts {
  districts: number;
  subcounties: number;
  parishes: number;
  villages: number;
}

export interface UgandaData {
  meta: {
    country: string;
    year: number;
    source: string;
    counts: AdminUnitCounts;
  };
  districts: string[];
  subcounties: Record<string, string[]>;
  parishes: Record<string, string[]>;
  villages: Record<string, string[]>;
  nationalBudget?: number;
  budgetAllocations?: Record<string, number>;
}

export interface SearchResult {
  name: string;
  level: number;
  district: string;
  subcounty?: string;
  parish?: string;
}

export interface Selection {
  district: string;
  subcounty?: string;
  parish?: string;
  village?: string;
}
