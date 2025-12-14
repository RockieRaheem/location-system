import kenyaData from '../data/kenya_counties.json';

export interface KenyaWard {
  id: string;
  name: string;
}

export interface KenyaConstituency {
  id: string;
  name: string;
  wards: KenyaWard[];
}

export interface KenyaCounty {
  id: string;
  name: string;
  constituencies: KenyaConstituency[];
}

class KenyaLocationService {
  private counties: KenyaCounty[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    // In a real app, you might fetch or parse here. For now, just assign.
    this.counties = kenyaData as KenyaCounty[];
    this.initialized = true;
  }

  async getCounties(): Promise<KenyaCounty[]> {
    await this.initialize();
    return this.counties;
  }

  async getConstituencies(countyName: string): Promise<KenyaConstituency[]> {
    await this.initialize();
    const county = this.counties.find(c => c.name === countyName);
    return county ? county.constituencies : [];
  }

  async getWards(countyName: string, constituencyName: string): Promise<KenyaWard[]> {
    await this.initialize();
    const county = this.counties.find(c => c.name === countyName);
    if (!county) return [];
    const constituency = county.constituencies.find(con => con.name === constituencyName);
    return constituency ? constituency.wards : [];
  }
}

export const kenyaLocationService = new KenyaLocationService();
