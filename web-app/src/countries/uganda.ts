import type { CountryConfig } from "../types";

export const uganda: CountryConfig = {
  id: "ug",
  iso2: "UG",
  name: "Uganda",
  flagColors: { primary: "#000000", secondary: "#FCDC04", accent: "#D90000" },
  dataSource: "Electoral Commission Uganda administrative units (July 2022)",
  dataYear: 2022,
  levels: [
    { number: 1, name: "district", plural: "districts", label: "District" },
    { number: 2, name: "subcounty", plural: "subcounties", label: "Subcounty" },
    { number: 3, name: "parish", plural: "parishes", label: "Parish" },
    { number: 4, name: "village", plural: "villages", label: "Village" },
  ],
  map: {
    center: [1.3733, 32.2903],
    zoom: 7,
  },
};

export const countries: CountryConfig[] = [uganda];

export function countryById(id: string): CountryConfig | undefined {
  return countries.find((c) => c.id === id);
}
