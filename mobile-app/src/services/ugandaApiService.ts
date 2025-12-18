import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/uganda'; // Change to your deployed backend URL if needed

export const ugandaApiService = {
  async getDistricts() {
    const res = await axios.get(`${API_BASE}/districts`);
    return res.data;
  },
  async getConstituencies(district: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/constituencies`);
    return res.data;
  },
  async getSubdivisions(district: string, constituency: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/constituencies/${encodeURIComponent(constituency)}/subdivisions`);
    return res.data;
  },
  async getParishes(district: string, constituency: string, subdivision: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/constituencies/${encodeURIComponent(constituency)}/subdivisions/${encodeURIComponent(subdivision)}/parishes`);
    return res.data;
  },
  async getVillages(district: string, constituency: string, subdivision: string, parish: string) {
    const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(district)}/constituencies/${encodeURIComponent(constituency)}/subdivisions/${encodeURIComponent(subdivision)}/parishes/${encodeURIComponent(parish)}/villages`);
    return res.data;
  }
};
