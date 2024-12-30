import React, { useEffect, useState } from "react";
import { TileLayer, Rectangle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import useDebounce from "./hooks/useDebounce"; // Import the debounce hook

function useMapBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());
  const [zoom, setZoom] = useState(map.getZoom()); // Track zoom level

  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
    },
    zoomend: () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
    },
  });

  return {
    bounds: {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      west: bounds.getWest(),
      east: bounds.getEast(),
    },
    zoom,
  };
}

export default function MapView({ quadTree, onMapClick }) {
  const rawBounds = useMapBounds();
  const debouncedBounds = useDebounce(rawBounds.bounds, 300); // Debounce bounds update
  const zoomLevel = rawBounds.zoom;
  const [visibleQuads, setVisibleQuads] = useState([]);

  useEffect(() => {
    // Calculate the maximum depth to render
    const maxDepth = Math.min(5 + zoomLevel, 20); // Render deeper quads as the zoom level increases
    const quads = quadTree.queryRange(debouncedBounds);

    // Filter quads to only include nodes up to the max depth
    const filteredQuads = quads.filter((path) => path.length / 2 <= maxDepth);
    setVisibleQuads(filteredQuads);
  }, [debouncedBounds, zoomLevel, quadTree]);

  const rectangles = visibleQuads.map((path) => {
    const node = quadTree.nodes[path];
    if (!node) return null;

    const { north, south, west, east } = quadTree.getBoundsForPath(path);
    const bounds = [
      [north, west],
      [south, east],
    ];

    // Style leaves differently from internal nodes
    const color = node.isLeaf ? "blue" : "red";

    return (
      <Rectangle
        key={path}
        bounds={bounds}
        pathOptions={{ color, weight: 1 }}
      />
    );
  });

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {rectangles}
    </>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}
