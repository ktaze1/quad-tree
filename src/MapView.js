// src/MapView.js

import React, { useEffect, useState } from "react";
import {
  TileLayer,
  Rectangle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import useDebounce from "./hooks/useDebounce"; // Import the debounce hook

/**
 * Custom hook to get the current map bounds
 * @returns {Object} - Current map bounds with north, south, west, east
 */
function useMapBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
    },
    zoomend: () => {
      setBounds(map.getBounds());
    },
  });

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    west: bounds.getWest(),
    east: bounds.getEast(),
  };
}

export default function MapView({ quadTree, onMapClick }) {
  const rawBounds = useMapBounds();
  const debouncedBounds = useDebounce(rawBounds, 300); // Debounce by 300ms
  const [visibleQuads, setVisibleQuads] = useState([]);

  useEffect(() => {
    // Query the QuadTree for quads within the debounced map bounds
    const quads = quadTree.queryRange(debouncedBounds);
    setVisibleQuads(quads);
  }, [debouncedBounds, quadTree]);

  // Render only the visible quads
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

/**
 * Component to handle map click events
 * @param {Function} onMapClick - Callback function when the map is clicked
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}
