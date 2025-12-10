// Core Location System Types

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 3-letter code
  flagUrl: string;
  continent: string;
  phoneCode: string;
  numberOfAdminLevels: number;
  numberOfElectoralLevels: number;
  economicZones: string[]; // e.g., ["EAC", "COMESA", "AU"]
  adminLevelNames: string[]; // Custom level names for this country
  isConfigured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AdminLevel {
  id: string;
  countryId: string;
  levelNumber: number; // 1 = top level, increasing downward
  levelName: string; // e.g., "District", "County", "Parish"
  isFormal: boolean; // true = formal government level, false = informal
  isElectoral: boolean; // Is this an electoral level?
  parentLevelId?: string; // null for top level
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AdminUnit {
  id: string;
  countryId: string;
  levelId: string;
  name: string;
  code?: string; // Optional unique code
  parentUnitId?: string; // null for top-level units
  population?: number;
  area?: number; // in square kilometers
  metadata?: Record<string, any>; // Flexible additional data
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UpdateHistory {
  id: string;
  entityType: 'country' | 'adminLevel' | 'adminUnit';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  fieldChanges: Record<string, { oldValue: any; newValue: any }>;
  performedBy: string;
  performedAt: string;
  reason?: string;
  ipAddress?: string;
}

export interface EconomicZone {
  id: string;
  name: string;
  abbreviation: string;
  memberCountries: string[]; // Country IDs
  description?: string;
}

// View Models for UI
export interface CountryWithStats extends Country {
  totalAdminUnits: number;
  lastUpdated: string;
  configurationProgress: number; // 0-100
}

export interface AdminUnitHierarchy extends AdminUnit {
  level: AdminLevel;
  children?: AdminUnitHierarchy[];
  parentUnit?: AdminUnit;
  childCount: number;
}

export interface LevelStatistics {
  levelId: string;
  levelName: string;
  totalUnits: number;
  activeUnits: number;
  inactiveUnits: number;
}
