import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Text } from "ol/style";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control";
import { createEmpty, extend as extendExtent } from "ol/extent";
import { fromLonLat } from "ol/proj";
import type { Theme } from "../theme";
import { getDistrictMap, polygonNameFor } from "../lib/geo";

interface Props {
  theme: Theme;
  center: [number, number];
  zoom: number;
  selectedDistrict: string | null;
  onSelectDistrict: (name: string) => void;
  onReset: () => void;
}

export function MapView({ theme, center, zoom, selectedDistrict, onSelectDistrict, onReset }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const tooltipRef = useRef<Overlay | null>(null);
  const countryExtentRef = useRef<ReturnType<typeof createEmpty> | null>(null);
  const selectedRef = useRef<string | null>(selectedDistrict);
  const hoverRef = useRef<string | null>(null);
  const lastFlyRef = useRef<string | null>(null);

  selectedRef.current = selectedDistrict;

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
        const selected = polygonNameFor(selectedRef.current ?? "", getDistrictMap());
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
      ],
      overlays: [tooltip],
      view: new View({
        center: fromLonLat(center),
        zoom,
        minZoom: 5.5,
        maxZoom: 15,
      }),
      controls: defaultControls({ attribution: true, rotate: false }),
    });
    mapRef.current = map;

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

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !countryExtentRef.current) return;

    const selected = selectedRef.current;
    if (selected && selected !== lastFlyRef.current) {
      lastFlyRef.current = selected;
      const polyName = polygonNameFor(selected, getDistrictMap());
      const source = layerRef.current?.getSource();
      const olFeature = polyName
        ? source?.getFeatures().find((feat) => feat.get("district") === polyName)
        : undefined;
      if (olFeature) {
        map.getView().fit(olFeature.getGeometry()!.getExtent(), {
          padding: [90, 90, 90, 90],
          maxZoom: 9.5,
          duration: 450,
        });
      }
    } else if (!selected) {
      lastFlyRef.current = null;
      map.getView().fit(countryExtentRef.current, {
        padding: [40, 40, 40, 40],
        maxZoom: 8,
        duration: 450,
      });
    }
    layer.changed();
  }, [selectedDistrict]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
      <button
        type="button"
        onClick={onReset}
        className="absolute right-3 top-3 z-10 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow transition hover:bg-black/5"
      >
        ⟲ View all of Uganda
      </button>
    </div>
  );
}
