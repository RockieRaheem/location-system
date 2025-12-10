import ugLocations from 'ug-locations';

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

  constructor() {
    this.data = ugLocations;
  }

  // Get all districts
  getDistricts(): string[] {
    return this.data.districts || [];
  }

  // Get district details with subcounties
  getDistrictDetails(districtName: string): District | null {
    const key = districtName.toUpperCase();
    if (this.data.byDistrict && this.data.byDistrict[key]) {
      return {
        ...this.data.byDistrict[key],
        district: districtName
      };
    }
    return null;
  }

  // Get subcounty details with parishes
  getSubcountyDetails(district: string, subcounty: string): Subcounty | null {
    const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}`;
    if (this.data.bySubcounty && this.data.bySubcounty[key]) {
      return {
        ...this.data.bySubcounty[key],
        district
      };
    }
    return null;
  }

  // Get parish details with villages
  getParishDetails(district: string, subcounty: string, parish: string): Parish | null {
    const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`;
    if (this.data.byParish && this.data.byParish[key]) {
      return this.data.byParish[key];
    }
    return null;
  }

  // Get village details
  getVillageDetails(villageName: string): Village | null {
    const key = villageName.toUpperCase();
    if (this.data.byVillage && this.data.byVillage[key]) {
      return this.data.byVillage[key];
    }
    return null;
  }

  // Search across all administrative levels
  searchLocations(query: string): Array<{
    type: 'district' | 'subcounty' | 'parish' | 'village';
    name: string;
    path: string;
  }> {
    const results: Array<{
      type: 'district' | 'subcounty' | 'parish' | 'village';
      name: string;
      path: string;
    }> = [];
    const searchTerm = query.toLowerCase();

    // Search districts
    this.getDistricts().forEach(district => {
      if (district.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'district',
          name: district,
          path: district
        });
      }
    });

    // Search subcounties
    if (this.data.bySubcounty) {
      Object.entries(this.data.bySubcounty).forEach(([key, value]: [string, any]) => {
        const subcounty = value.subcounty;
        if (subcounty.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subcounty',
            name: subcounty,
            path: `${value.district} > ${subcounty}`
          });
        }
      });
    }

    // Search parishes
    if (this.data.byParish) {
      Object.entries(this.data.byParish).forEach(([key, value]: [string, any]) => {
        const parish = value.parish;
        if (parish.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'parish',
            name: parish,
            path: `${value.district} > ${value.subcounty} > ${parish}`
          });
        }
      });
    }

    // Search villages (limit to avoid performance issues)
    if (this.data.byVillage) {
      let villageCount = 0;
      const entries = Object.entries(this.data.byVillage);
      
      for (const [key, value] of entries as [string, any][]) {
        if (villageCount >= 50) break; // Limit village results
        
        const village = value.village;
        if (village.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'village',
            name: village,
            path: `${value.district} > ${value.subcounty} > ${value.parish} > ${village}`
          });
          villageCount++;
        }
      }
    }

    return results;
  }

  // Build hierarchical tree for a district
  buildDistrictTree(districtName: string): any {
    const district = this.getDistrictDetails(districtName);
    if (!district) return null;

    const tree = {
      name: districtName,
      type: 'district',
      children: [] as any[]
    };

    district.subcounties.forEach(subcountyName => {
      const subcounty = this.getSubcountyDetails(districtName, subcountyName);
      if (subcounty) {
        const subcountyNode = {
          name: subcountyName,
          type: 'subcounty',
          children: [] as any[]
        };

        subcounty.data.forEach(parishData => {
          const parishNode = {
            name: parishData.parish,
            type: 'parish',
            children: parishData.villages.map(village => ({
              name: village,
              type: 'village',
              children: []
            }))
          };
          subcountyNode.children.push(parishNode);
        });

        tree.children.push(subcountyNode);
      }
    });

    return tree;
  }
}

export const locationService = new LocationService();
