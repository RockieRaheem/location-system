import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import type { Theme } from "../theme";
import { getDistrictMap, polygonNameFor } from "../lib/geo";

interface Props {
  theme: Theme;
  center: [number, number];
  zoom: number;
  selectedDistrict: string | null;
  onSelectDistrict: (name: string) => void;
}

export function MapView({ theme, center, zoom, selectedDistrict, onSelectDistrict }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const selectedRef = useRef<string | null>(selectedDistrict);
  const hoverRef = useRef<string | null>(null);

  selectedRef.current = selectedDistrict;

  useEffect(() => {
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(
        { type: "FeatureCollection", features: [...getDistrictMap().values()] },
        { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" },
      ),
    });

    const layer = new VectorLayer({
      source,
      style: (feature, resolution) => {
        const name = feature.get("district") as string;
        const selected = polygonNameFor(selectedRef.current ?? "", getDistrictMap());
        const isSelected = selected != null && name === selected;
        const isHover = hoverRef.current === name;
        let label: string | undefined;
        if (isSelected || isHover) {
          label = name;
        } else if (resolution < 0.045) {
          label = name;
        }
        return new Style({
          fill: new Fill({ color: isSelected ? theme.secondary : isHover ? "#f5f0e0" : "#e8e8e4" }),
          stroke: new Stroke({
            color: isSelected ? theme.accent : isHover ? theme.accent : theme.primary,
            width: isSelected ? 2.2 : 0.9,
          }),
          text: label
            ? new Text({
                text: label,
                font: isSelected ? "700 12px Inter, sans-serif" : "500 11px Inter, sans-serif",
                fill: new Fill({ color: isSelected ? theme.accent : theme.text }),
                stroke: new Stroke({ color: "#ffffff", width: 2.5 }),
                textAlign: "center",
                offsetY: 0,
              })
            : undefined,
        });
      },
    });
    layerRef.current = layer;

    const map = new Map({
      target: containerRef.current ?? undefined,
      layers: [new TileLayer({ source: new OSM() }), layer],
      view: new View({
        center: fromLonLat(center),
        zoom,
        minZoom: 5.5,
        maxZoom: 15,
      }),
      controls: [],
    });
    mapRef.current = map;

    const handleMove = (e: { map: Map; coordinate: number[] }) => {
      const hit = map.forEachFeatureAtPixel(
        e.map.getPixelFromCoordinate(e.coordinate),
        (f) => f.get("district") as string,
      );
      if (hit !== hoverRef.current) {
        hoverRef.current = hit ?? null;
        layer.changed();
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
    if (!map || !layer) return;
    map.getView().animate({ center: fromLonLat(center), zoom, duration: 250 });
    layer.changed();
  }, [center, zoom, selectedDistrict]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
