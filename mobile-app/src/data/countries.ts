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
    // Official Uganda flag from Wikimedia Commons (National Flag and Armorial Ensigns Act, 1962)
    // Features: 6 horizontal bands (black-yellow-red-black-yellow-red) with Grey Crowned Crested Crane in white disc
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/320px-Flag_of_Uganda.svg.png',
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
