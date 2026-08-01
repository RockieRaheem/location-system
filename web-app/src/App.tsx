import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { SearchBox } from "./components/SearchBox";
import { SidePanel } from "./components/SidePanel";
import { MapView } from "./components/MapView";
import { uganda } from "./countries/uganda";
import { themeFromFlag } from "./theme";
import { getDistrictMap, polygonNameFor } from "./lib/geo";
import { getDistricts } from "./lib/uganda";
import type { SearchResult, Selection } from "./types";

export default function App() {
  const theme = useMemo(() => themeFromFlag(uganda.flagColors), []);
  const [selection, setSelection] = useState<Selection | null>(null);

  const districtList = useMemo(() => getDistricts(), []);
  const polygonCount = useMemo(() => getDistrictMap().size, []);

  function selectByLevel(level: number, name: string) {
    setSelection((prev) => {
      const base = prev?.district
        ? { district: prev.district, subcounty: prev.subcounty, parish: prev.parish }
        : {};
      switch (level) {
        case 1:
          return { district: name };
        case 2:
          return { ...base, district: base.district ?? name, subcounty: name };
        case 3:
          return { ...base, district: base.district ?? name, subcounty: base.subcounty ?? name, parish: name };
        case 4:
          return {
            ...base,
            district: base.district ?? name,
            subcounty: base.subcounty ?? name,
            parish: base.parish ?? name,
            village: name,
          };
        default:
          return prev;
      }
    });
  }

  function onSearchSelect(r: SearchResult) {
    setSelection({
      district: r.district,
      subcounty: r.subcounty,
      parish: r.parish,
      village: r.level === 4 ? r.name : undefined,
    });
  }

  function onMapSelect(districtName: string) {
    setSelection({ district: districtName });
  }

  const crumbs = selection
    ? [
        ...(selection.subcounty
          ? [{ label: selection.district, onClick: () => setSelection({ district: selection.district }) }]
          : []),
        ...(selection.parish
          ? [
              {
                label: selection.subcounty!,
                onClick: () =>
                  setSelection({ district: selection.district, subcounty: selection.subcounty }),
              },
            ]
          : []),
        ...(selection.village
          ? [
              {
                label: selection.parish!,
                onClick: () =>
                  setSelection({
                    district: selection.district,
                    subcounty: selection.subcounty,
                    parish: selection.parish,
                  }),
              },
            ]
          : []),
        ...(selection.district && !selection.subcounty
          ? [{ label: selection.district, onClick: () => {} }]
          : []),
      ]
    : [];

  const selectedPolygon = selection ? polygonNameFor(selection.district, getDistrictMap()) : null;

  return (
    <div className="flex h-screen flex-col bg-[#f7f7f5] text-gray-900">
      <Header
        country={uganda}
        title="Uganda Admin Explorer"
        subtitle={`${districtList.length} districts · ${polygonCount} mapped · ${uganda.dataYear} EC data`}
      >
        <SearchBox country={uganda} onSelect={onSearchSelect} />
      </Header>

      <Breadcrumbs
        crumbs={crumbs}
        onReset={() => setSelection(null)}
      />

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[45vh] flex-1">
          <MapView
            theme={theme}
            center={uganda.map.center}
            zoom={uganda.map.zoom}
            selectedDistrict={selection?.district ?? null}
            onSelectDistrict={onMapSelect}
          />
          {selectedPolygon && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs shadow">
              <span className="font-semibold text-black">Selected:</span>{" "}
              <span className="font-medium text-[#D90000]">{selection?.district}</span>
              {selection?.district !== selectedPolygon && (
                <span className="ml-1 text-gray-500">(on map: {selectedPolygon})</span>
              )}
            </div>
          )}
        </div>

        <div className="h-[45vh] w-full shrink-0 border-t border-black/10 lg:h-auto lg:w-[400px] lg:border-l lg:border-t-0">
          <SidePanel
            country={uganda}
            theme={theme}
            selection={selection}
            onSelect={selectByLevel}
            onReset={() => setSelection(null)}
          />
        </div>
      </div>
    </div>
  );
}
