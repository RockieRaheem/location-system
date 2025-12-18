import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/uganda'; // Change to your deployed backend URL if needed

export const ugandaApiService = {
  async getDistricts() {
    const res = await axios.get(`${API_BASE}/districts`);
    return res.data;
  },
  async getCounties(district: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/counties`);
    return res.data;
  },
  async getSubcounties(district: string, county: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/counties/${encodeURIComponent(county)}/subcounties`);
    return res.data;
  },
  async getParishes(district: string, county: string, subcounty: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/counties/${encodeURIComponent(county)}/subcounties/${encodeURIComponent(subcounty)}/parishes`);
    return res.data;
  },
  async getVillages(district: string, county: string, subcounty: string, parish: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/counties/${encodeURIComponent(county)}/subcounties/${encodeURIComponent(subcounty)}/parishes/${encodeURIComponent(parish)}/villages`);
    return res.data;
  }
};
