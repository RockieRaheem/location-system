import { SearchBox } from "./SearchBox";
import { MapView } from "./MapView";
import type { CountryConfig, SearchResult, Selection, UgandaData } from "../types";
import type { Theme } from "../theme";
import type { SearchIndexes } from "../lib/uganda";

interface Props {
  country: CountryConfig;
  theme: Theme;
  data: UgandaData;
  indexes: SearchIndexes;
  selection: Selection | null;
  onSearchSelect: (result: SearchResult) => void;
  onMapSelect: (district: string) => void;
  onClearSelection: () => void;
  onOpenInExplorer: (district: string, subcounty?: string) => void;
}

export function MapPage({
  country,
  theme,
  data,
  indexes,
  selection,
  onSearchSelect,
  onMapSelect,
  onClearSelection,
  onOpenInExplorer,
}: Props) {
  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute left-1/2 top-3 z-30 w-[min(92%,30rem)] -translate-x-1/2">
        <SearchBox country={country} data={data} indexes={indexes} onSelect={onSearchSelect} />
      </div>
      <MapView
        theme={theme}
        center={country.map.center}
        zoom={country.map.zoom}
        selection={selection}
        data={data}
        onSelectDistrict={onMapSelect}
        onClearSelection={onClearSelection}
        onOpenInExplorer={onOpenInExplorer}
      />
    </div>
  );
}
