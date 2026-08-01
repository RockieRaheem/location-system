import { useEffect, useRef } from "react";
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
import { fromLonLat } from "ol/proj";
import type { Theme } from "../theme";
import type { Selection } from "../types";
import { getDistrictMap, polygonNameFor } from "../lib/geo";

interface Props {
  theme: Theme;
  center: [number, number];
  zoom: number;
  selection: Selection | null;
  onSelectDistrict: (name: string) => void;
  onReset: () => void;
}

function selectionKey(sel: Selection | null): string {
  if (!sel) return "";
  return `${sel.district}|${sel.subcounty ?? ""}|${sel.parish ?? ""}|${sel.village ?? ""}`;
}

export function MapView({ theme, center, zoom, selection, onSelectDistrict, onReset }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const tooltipRef = useRef<Overlay | null>(null);
  const countryExtentRef = useRef<ReturnType<typeof createEmpty> | null>(null);
  const selectionRef = useRef<Selection | null>(selection);
  const hoverRef = useRef<string | null>(null);

  selectionRef.current = selection;

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
        const selected = sel?.district ? polygonNameFor(sel.district, getDistrictMap()) : null;
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
        markerLayer,
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

  const key = selectionKey(selection);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !layer || !markerLayer || !countryExtentRef.current) return;

    markerLayer.getSource()?.clear();

    const sel = selectionRef.current;
    if (sel && sel.district) {
      const polyName = polygonNameFor(sel.district, getDistrictMap());
      const olFeature = polyName
        ? layer.getSource()?.getFeatures().find((f) => f.get("district") === polyName)
        : undefined;
      const geometry = olFeature?.getGeometry();
      if (geometry) {
        map.getView().fit(geometry.getExtent(), {
          padding: [70, 70, 70, 70],
          maxZoom: 10.5,
          duration: 450,
        });
        const label = sel.village ?? sel.parish ?? sel.subcounty ?? sel.district;
        markerLayer.getSource()?.addFeature(
          new Feature({ geometry: new Point(getCenter(geometry.getExtent())), label }),
        );
      }
    } else {
      map.getView().fit(countryExtentRef.current, {
        padding: [40, 40, 40, 40],
        maxZoom: 8,
        duration: 450,
      });
    }
    layer.changed();
    markerLayer.changed();
  }, [key]);

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
