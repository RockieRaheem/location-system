// Import only what we need to avoid memory issues
let ugLocationsData: any = null;

export interface Village {
  village: string;
  parish: string;
  subcounty: string;
  constituency: string;
  district: string;
}

export interface Parish {
  parish: string;
  number_of_villages: number;
  villages: string[];
  subcounty: string;
  district: string;
}

export interface Subcounty {
  subcounty: string;
  number_of_subcounties: number;
  data: Array<{
    parish: string;
    number_of_villages: number;
    villages: string[];
  }>;
  district: string;
}

export interface District {
  district: string;
  number_of_subcounties: number;
  subcounties: string[];
}

class LocationService {
  private data: any;
  private initialized: boolean = false;

  constructor() {
    this.data = null;
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Lazy load to avoid initial bundle size issues
      const ugLocations = require('ug-locations');
      this.data = ugLocations;
      this.initialized = true;
    } catch (error) {
      console.error('Error loading ug-locations:', error);
      this.data = { districts: [] };
      this.initialized = true;
    }
  }

  // Get all districts
  async getDistricts(): Promise<string[]> {
    await this.initialize();
    return this.data?.districts || [];
  }

  // Get district details with subcounties
  async getDistrictDetails(districtName: string): Promise<District | null> {
    await this.initialize();
    const key = districtName.toUpperCase();
    if (this.data?.byDistrict && this.data.byDistrict[key]) {
      return {
        ...this.data.byDistrict[key],
        district: districtName
      };
    }
    return null;
  }

  // Get subcounty details with parishes
  async getSubcountyDetails(district: string, subcounty: string): Promise<Subcounty | null> {
    await this.initialize();
    const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}`;
    if (this.data?.bySubcounty && this.data.bySubcounty[key]) {
      return {
        ...this.data.bySubcounty[key],
        district
      };
    }
    return null;
  }

  // Get parish details with villages
  async getParishDetails(district: string, subcounty: string, parish: string): Promise<Parish | null> {
    await this.initialize();
    const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`;
    if (this.data?.byParish && this.data.byParish[key]) {
      return this.data.byParish[key];
    }
    return null;
  }

  // Get village details
  async getVillageDetails(villageName: string): Promise<Village | null> {
    await this.initialize();
    const key = villageName.toUpperCase();
    if (this.data?.byVillage && this.data.byVillage[key]) {
      return this.data.byVillage[key];
    }
    return null;
  }

  // Search across all administrative levels
  async searchLocations(query: string): Promise<Array<{
    type: 'district' | 'subcounty' | 'parish' | 'village';
    name: string;
    path: string;
  }>> {
    await this.initialize();
    
    const results: Array<{
      type: 'district' | 'subcounty' | 'parish' | 'village';
      name: string;
      path: string;
    }> = [];
    const searchTerm = query.toLowerCase();

    // Search districts
    const districts = await this.getDistricts();
    districts.forEach(district => {
      if (district.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'district',
          name: district,
          path: district
        });
      }
    });

    // Limit results to avoid performance issues
    if (results.length > 20) {
      return results.slice(0, 20);
    }

    // Search subcounties (limited)
    if (this.data?.bySubcounty) {
      const entries = Object.entries(this.data.bySubcounty).slice(0, 100);
      for (const [key, value] of entries as [string, any][]) {
        if (results.length >= 20) break;
        const subcounty = value.subcounty;
        if (subcounty.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subcounty',
            name: subcounty,
            path: `${value.district} > ${subcounty}`
          });
        }
      }
    }

    return results;
  }
}

export const locationService = new LocationService();
