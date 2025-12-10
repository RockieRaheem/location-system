// Interface definitions for Uganda location data
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
  private ugLocations: any = null;
  private initialized: boolean = false;

  constructor() {}

  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Lazy load to avoid initial bundle size issues using dynamic import
      const ugLocationsModule = await import('ug-locations');
      this.ugLocations = ugLocationsModule.default;
      this.initialized = true;
    } catch (error) {
      console.error('Error loading ug-locations:', error);
      this.initialized = true;
    }
  }

  // Get all districts
  async getDistricts(): Promise<string[]> {
    await this.initialize();
    if (!this.ugLocations) return [];
    return this.ugLocations.getDistricts() || [];
  }

  // Get district details with subcounties
  async getDistrictDetails(districtName: string): Promise<District | null> {
    await this.initialize();
    if (!this.ugLocations) return null;
    
    const subcounties = this.ugLocations.getSubcountiesInDistrict(districtName);
    if (subcounties && subcounties.length > 0) {
      return {
        district: districtName,
        number_of_subcounties: subcounties.length,
        subcounties: subcounties
      };
    }
    return null;
  }

  // Get subcounty details with parishes
  async getSubcountyDetails(district: string, subcounty: string): Promise<Subcounty | null> {
    await this.initialize();
    if (!this.ugLocations) return null;
    
    const parishes = this.ugLocations.getParishesInSubcounty(district, subcounty);
    if (parishes && parishes.length > 0) {
      const data = parishes.map((parish: string) => {
        const villages = this.ugLocations.getVillagesInParish(district, subcounty, parish);
        return {
          parish,
          number_of_villages: villages.length,
          villages
        };
      });
      
      return {
        subcounty,
        number_of_subcounties: parishes.length,
        data,
        district
      };
    }
    return null;
  }

  // Get parish details with villages
  async getParishDetails(district: string, subcounty: string, parish: string): Promise<Parish | null> {
    await this.initialize();
    if (!this.ugLocations) return null;
    
    const villages = this.ugLocations.getVillagesInParish(district, subcounty, parish);
    if (villages && villages.length > 0) {
      return {
        parish,
        number_of_villages: villages.length,
        villages,
        subcounty,
        district
      };
    }
    return null;
  }

  // Get village details
  async getVillageDetails(villageName: string): Promise<Village | null> {
    await this.initialize();
    if (!this.ugLocations) return null;
    
    const villageData = this.ugLocations.getLocationByVillage(villageName);
    return villageData || null;
  }

  // Search locations
  async searchLocations(query: string): Promise<any[]> {
    await this.initialize();
    if (!this.ugLocations) return [];
    
    // Use the built-in search with a reasonable limit
    const results = this.ugLocations.search(query, { limit: 20 });
    return results.map((result: any) => ({
      type: this.getLocationType(result),
      name: result.village || result.parish || result.subcounty || result.district,
      path: `${result.district} → ${result.subcounty} → ${result.parish} → ${result.village}`
    }));
  }

  private getLocationType(location: any): string {
    if (location.village) return 'village';
    if (location.parish) return 'parish';
    if (location.subcounty) return 'subcounty';
    if (location.district) return 'district';
    return 'unknown';
  }
}

export const locationService = new LocationService();
