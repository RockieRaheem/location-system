export interface Country {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  continent: string;
  phoneCode?: string;
  numberOfAdminLevels?: number;
  numberOfElectoralLevels?: number;
  economicZones?: string[];
  adminLevelNames?: string[]; // e.g., ["Country", "Region", "District", "County", "Sub-county", "Parish", "Village"]
  isConfigured?: boolean; // Whether admin structure has been set up
}

export const COUNTRIES: Country[] = [
  {
    id: 'UG',
    name: 'Uganda',
    code: 'UGA',
    flagUrl: 'https://flagcdn.com/w80/ug.png',
    continent: 'Africa',
    phoneCode: '+256',
    numberOfAdminLevels: 8,
    numberOfElectoralLevels: 5,
    economicZones: ['EAC', 'COMESA'],
    adminLevelNames: ['Country', 'Region', 'Sub-region', 'District/City', 'County/Constituency', 'Sub-county/Division/Ward', 'Parish', 'Village/Cell'],
    isConfigured: true
  }
];

export const CONTINENTS = [
  'Africa',
];
