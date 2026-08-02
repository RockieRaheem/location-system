import { useEffect, useMemo, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control";
import { createEmpty, extend as extendExtent, getCenter } from "ol/extent";
import { fromLonLat, toLonLat } from "ol/proj";
import type Geometry from "ol/geom/Geometry";
import type { Theme } from "../theme";
import type { Selection, UgandaData } from "../types";
import { getParishes, getVillages } from "../lib/uganda";
import {
  getDistrictMap,
  getSubcountyMap,
  polygonNameFor,
  subcountyKeyFor,
} from "../lib/geo";
import { loadVillagePoints, nearestVillage } from "../lib/villages";

interface Props {
  theme: Theme;
  center: [number, number];
  zoom: number;
  selection: Selection | null;
  data: UgandaData;
  onSelectDistrict: (name: string) => void;
  onClearSelection: () => void;
  onOpenInExplorer: (
    district: string,
    subcounty?: string,
    parish?: string,
    village?: string,
  ) => void;
}

interface PinInfo {
  longitude: number;
  latitude: number;
  district?: string;
  subcounty?: string;
  village?: string;
  parish?: string;
  osmName?: string;
  distanceKm?: number;
  nearestLoading?: boolean;
  error?: string;
}

function selectionKey(sel: Selection | null): string {
  if (!sel) return "";
  return `${sel.district}|${sel.subcounty ?? ""}|${sel.parish ?? ""}|${sel.village ?? ""}`;
}

export function MapView({
  theme,
  center,
  zoom,
  selection,
  data,
  onSelectDistrict,
  onClearSelection,
  onOpenInExplorer,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const subcountyLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const pinLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const tooltipRef = useRef<Overlay | null>(null);
  const countryExtentRef = useRef<ReturnType<typeof createEmpty> | null>(null);
  const selectionRef = useRef<Selection | null>(selection);
  const hoverRef = useRef<string | null>(null);
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState<PinInfo | null>(null);
  const pinModeRef = useRef(pinMode);

  selectionRef.current = selection;
  pinModeRef.current = pinMode;

  useEffect(() => {
    const tooltipEl = document.createElement("div");
    tooltipEl.className =
      "pointer-events-none rounded-md bg-black/85 px-2 py-1 text-xs font-semibold text-white shadow";
    tooltipEl.style.display = "none";

    const tooltip = new Overlay({
      element: tooltipEl,
      offset: [0, -12],
      positioning: "bottom-center",
      stopEvent: false,
    });
    tooltipRef.current = tooltip;

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(
        { type: "FeatureCollection", features: [...getDistrictMap().values()] },
        { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" },
      ),
    });

    const countryExtent = createEmpty();
    source.forEachFeature((f) => extendExtent(countryExtent, f.getGeometry()!.getExtent()));
    countryExtentRef.current = countryExtent;

    const layer = new VectorLayer({
      source,
      style: (feature) => {
        const name = feature.get("district") as string;
        const sel = selectionRef.current;
        const selected = sel?.district && !sel.subcounty ? polygonNameFor(sel.district, getDistrictMap()) : null;
        const isSelected = selected != null && name === selected;
        const isHover = hoverRef.current === name;
        return new Style({
          fill: new Fill({
            color: isSelected ? theme.secondary : isHover ? "#f8f1c9" : "#f0e6c8",
          }),
          stroke: new Stroke({
            color: isSelected ? theme.accent : isHover ? theme.accent : theme.primary,
            width: isSelected ? 2.4 : 0.9,
          }),
          text: new Text({
            text: name,
            font: isSelected || isHover ? "700 12px Inter, sans-serif" : "500 11px Inter, sans-serif",
            fill: new Fill({ color: isSelected || isHover ? theme.accent : "#44403c" }),
            stroke: new Stroke({ color: "#ffffff", width: 2.5 }),
            textAlign: "center",
          }),
        });
      },
    });
    layerRef.current = layer;

    const subcountySource = new VectorSource({
      features: new GeoJSON().readFeatures(
        { type: "FeatureCollection", features: [...getSubcountyMap().values()] },
        { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" },
      ),
    });

    const subcountyLayer = new VectorLayer({
      source: subcountySource,
      zIndex: 5,
      style: (feature) => {
        const sel = selectionRef.current;
        const d = feature.get("district") as string;
        const sc = feature.get("subcounty") as string;
        const isDeep = !!sel?.subcounty;
        const isSelected = isDeep && sel!.district === d && sel!.subcounty === sc;
        if (!isSelected) {
          return new Style({
            fill: new Fill({ color: "rgba(255,255,255,0)" }),
            stroke: new Stroke({ color: "rgba(90,60,20,0.18)", width: 0.6 }),
          });
        }
        return new Style({
          fill: new Fill({ color: theme.secondary }),
          stroke: new Stroke({ color: theme.accent, width: 2.4 }),
          text: new Text({
            text: sc,
            font: "700 12px Inter, sans-serif",
            fill: new Fill({ color: theme.accent }),
            stroke: new Stroke({ color: "#ffffff", width: 3 }),
            textAlign: "center",
          }),
        });
      },
    });
    subcountyLayerRef.current = subcountyLayer;

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 20,
      style: (feature) => {
        const label = feature.get("label") as string;
        return new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: theme.accent }),
            stroke: new Stroke({ color: "#ffffff", width: 2.5 }),
          }),
          text: new Text({
            text: label,
            font: "700 12px Inter, sans-serif",
            fill: new Fill({ color: theme.primary }),
            stroke: new Stroke({ color: "#ffffff", width: 3 }),
            offsetY: -16,
            textAlign: "center",
          }),
        });
      },
    });
    markerLayerRef.current = markerLayer;

    const pinSource = new VectorSource();
    const pinLayer = new VectorLayer({
      source: pinSource,
      zIndex: 30,
      style: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: "#D90000" }),
          stroke: new Stroke({ color: "#ffffff", width: 3.5 }),
        }),
      }),
    });
    pinLayerRef.current = pinLayer;

    const map = new Map({
      target: containerRef.current ?? undefined,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
            maxZoom: 19,
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }),
        }),
        layer,
        subcountyLayer,
        markerLayer,
        pinLayer,
      ],
      overlays: [tooltip],
      view: new View({
        center: fromLonLat(center),
        zoom,
        minZoom: 5.5,
        maxZoom: 15,
      }),
      controls: defaultControls({ attribution: true, rotate: false, zoom: false }),
    });
    mapRef.current = map;

    if (countryExtentRef.current) {
      map.getView().fit(countryExtentRef.current, {
        padding: [20, 20, 20, 20],
        maxZoom: 8,
        duration: 0,
      });
    }

    const handleMove = (e: { map: Map; coordinate: number[] }) => {
      const hit = map.forEachFeatureAtPixel(
        map.getPixelFromCoordinate(e.coordinate),
        (f) => f.get("district") as string,
      );
      if (hit !== hoverRef.current) {
        hoverRef.current = hit ?? null;
        layer.changed();
      }
      if (hit) {
        tooltipEl.textContent = hit;
        tooltipEl.style.display = "";
        tooltip.setPosition(e.coordinate);
      } else {
        tooltipEl.style.display = "none";
      }
    };
    const handleClick = (e: { coordinate: number[] }) => {
      if (pinModeRef.current) {
        dropPinAt(e.coordinate);
        return;
      }
      const hit = map.forEachFeatureAtPixel(
        map.getPixelFromCoordinate(e.coordinate),
        (f) => f.get("district") as string,
      );
      if (hit) onSelectDistrict(hit);
    };

    map.on("pointermove", handleMove);
    map.on("singleclick", handleClick);

    return () => {
      map.un("pointermove", handleMove);
      map.un("singleclick", handleClick);
      map.setTarget(undefined);
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = selectionKey(selection);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    const subcountyLayer = subcountyLayerRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !layer || !subcountyLayer || !markerLayer || !countryExtentRef.current) return;

    setPin(null);
    markerLayer.getSource()?.clear();

    const sel = selectionRef.current;
    let target: Geometry | undefined;
    let label = "";
    if (sel && sel.district) {
      if (sel.subcounty) {
        const subKey = subcountyKeyFor(sel.district, sel.subcounty, getSubcountyMap());
        const subFeat = subKey
          ? subcountyLayer
              .getSource()
              ?.getFeatures()
              .find((f) => `${f.get("district")}||${f.get("subcounty")}` === subKey)
          : undefined;
        const geom = subFeat?.getGeometry();
        if (geom) {
          target = geom;
          label = sel.village ?? sel.parish ?? sel.subcounty;
        }
      }
      if (!target) {
        const polyName = polygonNameFor(sel.district, getDistrictMap());
        const olFeature = polyName
          ? layer.getSource()?.getFeatures().find((f) => f.get("district") === polyName)
          : undefined;
        const geom = olFeature?.getGeometry();
        if (geom) {
          target = geom;
          label = sel.village ?? sel.parish ?? sel.subcounty ?? sel.district;
        }
      }
    }

    if (target) {
      map.getView().fit(target.getExtent(), {
        padding: [70, 70, 70, 70],
        maxZoom: 11,
        duration: 450,
      });
      markerLayer.getSource()?.addFeature(
        new Feature({ geometry: new Point(getCenter(target.getExtent())), label }),
      );
    } else {
      map.getView().fit(countryExtentRef.current, {
        padding: [40, 40, 40, 40],
        maxZoom: 8,
        duration: 450,
      });
    }
    layer.changed();
    subcountyLayer.changed();
    markerLayer.changed();
  }, [key]);

  function zoomBy(delta: number) {
    const view = mapRef.current?.getView();
    if (!view) return;
    const z = view.getZoom();
    if (z != null) view.animate({ zoom: Math.min(15, Math.max(5.5, z + delta)), duration: 200 });
  }

  function fitCountry() {
    const map = mapRef.current;
    if (map && countryExtentRef.current) {
      map.getView().fit(countryExtentRef.current, {
        padding: [30, 30, 30, 30],
        maxZoom: 8,
        duration: 300,
      });
    }
  }

  function reverseGeocode(coord: number[]): Pick<PinInfo, "district" | "subcounty"> | null {
    const subFeatures = subcountyLayerRef.current?.getSource()?.getFeatures() ?? [];
    for (const f of subFeatures) {
      if (f.getGeometry()?.intersectsCoordinate(coord)) {
        return { district: f.get("district") as string, subcounty: f.get("subcounty") as string };
      }
    }
    const distFeatures = layerRef.current?.getSource()?.getFeatures() ?? [];
    for (const f of distFeatures) {
      if (f.getGeometry()?.intersectsCoordinate(coord)) {
        return { district: f.get("district") as string };
      }
    }
    return null;
  }

  function setPinAndAttach(longitude: number, latitude: number, base: Partial<PinInfo>) {
    setPin({ longitude, latitude, ...base, nearestLoading: true });
    loadVillagePoints()
      .then((points) => {
        const near = nearestVillage(points, longitude, latitude);
        setPin((prev) => {
          if (!prev || prev.longitude !== longitude || prev.latitude !== latitude) return prev;
          if (!near) return { ...prev, nearestLoading: false };
          return {
            ...prev,
            nearestLoading: false,
            osmName: near.point.name,
            distanceKm: near.distanceKm,
            village: near.point.village ?? undefined,
            parish: near.point.parish ?? undefined,
          };
        });
      })
      .catch(() => {
        setPin((prev) =>
          prev && prev.longitude === longitude && prev.latitude === latitude
            ? { ...prev, nearestLoading: false }
            : prev,
        );
      });
  }

  function dropPinAt(coord: number[]) {
    const map = mapRef.current;
    if (!map) return;
    const [longitude, latitude] = toLonLat(coord);
    const hit = reverseGeocode(coord);
    setPinAndAttach(longitude, latitude, hit ? { ...hit } : {});
    const view = map.getView();
    const z = view.getZoom() ?? 8;
    view.animate({ center: coord, zoom: Math.min(15, Math.max(z, 11)), duration: 400 });
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setPin({ longitude: 0, latitude: 0, error: "Geolocation is not supported by this browser." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        dropPinAt(fromLonLat([longitude, latitude]));
      },
      (err) => {
        setPin({
          longitude: 0,
          latitude: 0,
          error:
            err.code === 1
              ? "Location access denied. Drop a pin on the map instead."
              : "Could not get your location. Try again or drop a pin on the map.",
        });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }

  function clearPin() {
    setPin(null);
    setPinMode(false);
  }

  useEffect(() => {
    const layer = pinLayerRef.current;
    if (!layer) return;
    layer.getSource()?.clear();
    if (pin && !pin.error) {
      layer.getSource()?.addFeature(new Feature({ geometry: new Point(fromLonLat([pin.longitude, pin.latitude])) }));
    }
  }, [pin]);

  useEffect(() => {
    const el = mapRef.current?.getTargetElement();
    if (el) el.style.cursor = pinMode ? "crosshair" : "";
  }, [pinMode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const subCounts = useMemo(() => {
    if (!pin?.subcounty || !pin.district || pin.error) return null;
    const district = pin.district;
    const subcounty = pin.subcounty;
    const parishes = getParishes(data, district, subcounty);
    const villages = parishes.reduce(
      (n, p) => n + getVillages(data, district, subcounty, p).length,
      0,
    );
    return { parishes: parishes.length, villages };
  }, [pin, data]);

  const sel = selection;
  const pathParts = sel
    ? [sel.district, sel.subcounty, sel.parish, sel.village].filter(Boolean)
    : [];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute right-3 top-3 z-10 hidden rounded-md bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white shadow sm:block">
        {pinMode
          ? "Pin mode: click the map to drop a pin"
          : "Click a district to select it · search above to zoom to a place"}
      </div>
      <div className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-md">
        <button
          type="button"
          onClick={() => zoomBy(1)}
          className="flex h-7 w-7 items-center justify-center text-gray-700 transition hover:bg-black/5 hover:text-black"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 2v8M2 6h8" />
          </svg>
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          className="flex h-7 w-7 items-center justify-center text-gray-700 transition hover:bg-black/5 hover:text-black"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 6h8" />
          </svg>
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          onClick={fitCountry}
          className="flex h-7 w-7 items-center justify-center text-gray-700 transition hover:bg-black/5 hover:text-black"
          title="View all of Uganda"
          aria-label="View all of Uganda"
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4.5h4V1M10 7.5H6V11" />
          </svg>
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          onClick={() => setPinMode((v) => !v)}
          className={`flex h-7 w-7 items-center justify-center transition ${
            pinMode ? "bg-[#D90000] text-white" : "text-gray-700 hover:bg-black/5 hover:text-black"
          }`}
          title={pinMode ? "Exit pin mode" : "Drop a pin to find its district/subcounty"}
          aria-label="Drop a pin"
          aria-pressed={pinMode}
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1.5c-1.8 0-3.2 1.4-3.2 3.1 0 2.3 3.2 5.9 3.2 5.9s3.2-3.6 3.2-5.9C9.2 2.9 7.8 1.5 6 1.5z" />
            <circle cx="6" cy="4.6" r="1.1" />
          </svg>
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          onClick={locateMe}
          className="flex h-7 w-7 items-center justify-center text-gray-700 transition hover:bg-black/5 hover:text-black"
          title="Find my district and subcounty (GPS)"
          aria-label="Find my location"
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="2.2" />
            <path d="M6 1v1.6M6 9.4V11M1 6h1.6M9.4 6H11M2.2 2.2l1.2 1.2M8.6 8.6l1.2 1.2M9.8 2.2L8.6 3.4M3.4 8.6l-1.2 1.2" />
          </svg>
        </button>
      </div>
      {sel && pathParts.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-8rem)] items-center gap-2 rounded-lg border border-black/10 bg-white/95 px-3 py-1.5 shadow-md">
          <span className="truncate text-xs font-medium text-gray-700">
            <span className="font-bold text-[#D90000]">{pathParts[pathParts.length - 1]}</span>
            {pathParts.length > 1 && (
              <span className="ml-1 text-gray-500">in {pathParts.slice(0, -1).join(" › ")}</span>
            )}
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/5 text-gray-500 transition hover:bg-black/10 hover:text-black"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>
      )}
      {pin && (
        <div className="absolute bottom-3 right-3 z-20 w-72 overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-black px-3 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-white">
              {pin.error ? "Location" : pin.district ? "You are here" : "Dropped pin"}
            </span>
            <button
              type="button"
              onClick={clearPin}
              className="flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              title="Clear pin"
              aria-label="Clear pin"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </div>
          <div className="px-3 py-2">
            {pin.error ? (
              <p className="text-xs text-gray-600">{pin.error}</p>
            ) : pin.district ? (
              <>
                <p className={`text-sm font-bold text-black ${pin.village ? "" : "mb-1"}`}>
                  {pin.village
                    ? pin.village
                    : pin.osmName
                      ? pin.osmName
                      : `${pin.district}${pin.subcounty ? ` › ${pin.subcounty}` : ""}`}
                </p>
                {pin.village && (
                  <p className="text-[11px] text-gray-500">
                    {pin.parish} parish · {pin.subcounty} subcounty · {pin.district} district
                  </p>
                )}
                {pin.osmName && !pin.village && (
                  <p className="text-[11px] text-gray-500">
                    {pin.district}
                    {pin.subcounty ? ` › ${pin.subcounty}` : ""}
                  </p>
                )}
                {pin.village ? (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Matched to an EC village{pin.distanceKm ? ` (${pin.distanceKm.toFixed(1)} km)` : ""}
                  </p>
                ) : pin.osmName ? (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Nearest named place{typeof pin.distanceKm === "number" ? ` (${pin.distanceKm.toFixed(1)} km)` : ""} · OpenStreetMap
                  </p>
                ) : pin.nearestLoading ? (
                  <p className="mt-0.5 text-[11px] text-gray-400">Finding nearest village…</p>
                ) : pin.subcounty ? (
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {subCounts?.parishes} parishes · {subCounts?.villages} villages in {pin.subcounty}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => onOpenInExplorer(pin.district!, pin.subcounty, pin.parish, pin.village)}
                  className="mt-2 rounded-md bg-[#D90000] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#B00000]"
                >
                  Open in Explorer
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-600">
                No known district or subcounty boundary covers this point.
              </p>
            )}
            {!pin.error && (
              <p className="mt-1.5 border-t border-black/5 pt-1.5 font-mono text-[10px] text-gray-400">
                {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
