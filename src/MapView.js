// src/MapView.js

import React, { useEffect, useState } from "react";
import { TileLayer, Rectangle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import useDebounce from "./hooks/useDebounce";

const PIXEL_THRESHOLD = 20; // Minimum pixel size to render quads

export default function MapView({ worker, onMapClick, visibleQuads, requestQueryRange, refreshCount }) {
  const rawBounds = useMapBounds();
  const debouncedBounds = useDebounce(rawBounds.bounds, 300); // Debounce bounds update
  const zoomLevel = rawBounds.zoom;
  const map = useMap();
  const [filteredQuads, setFilteredQuads] = useState([]);

  useEffect(() => {
    if (debouncedBounds && requestQueryRange) {
      requestQueryRange(debouncedBounds);
    }
  }, [debouncedBounds, zoomLevel, requestQueryRange, refreshCount]);

  useEffect(() => {
    if (!map) return;

    const newFilteredQuads = visibleQuads.filter(({ path, isLeaf }) => {
      const bounds = getBoundsForPath(path);
      if (!bounds) return false;

      const topLeft = map.latLngToContainerPoint(L.latLng(bounds[0][0], bounds[0][1]));
      const bottomRight = map.latLngToContainerPoint(L.latLng(bounds[1][0], bounds[1][1]));

      const width = Math.abs(bottomRight.x - topLeft.x);
      const height = Math.abs(bottomRight.y - topLeft.y);

      return width >= PIXEL_THRESHOLD || height >= PIXEL_THRESHOLD;
    });

    setFilteredQuads(newFilteredQuads);
  }, [visibleQuads, map]);

  const rectangles = filteredQuads.map(({ path, isLeaf }) => {
    const bounds = getBoundsForPath(path);

    if (!bounds) return null;

    // Style leaves differently from internal nodes
    const color = isLeaf ? "blue" : "red";

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
 * Computes the geographical bounds for a given QuadTree path.
 * @param {string} path - The path string representing the QuadTree node.
 * @returns {Array} - An array containing the southwest and northeast coordinates.
 */
function getBoundsForPath(path) {
  let bounds = {
    north: 90,
    south: -90,
    west: -180,
    east: 180,
  };

  for (let i = 0; i < path.length; i += 2) {
    const bits = path.slice(i, i + 2);
    const midLat = (bounds.north + bounds.south) / 2;
    const midLng = (bounds.west + bounds.east) / 2;

    if (bits === "00") {
      // Top-Left
      bounds.east = midLng;
      bounds.south = midLat;
    } else if (bits === "01") {
      // Top-Right
      bounds.west = midLng;
      bounds.south = midLat;
    } else if (bits === "10") {
      // Bottom-Left
      bounds.north = midLat;
      bounds.east = midLng;
    } else if (bits === "11") {
      // Bottom-Right
      bounds.west = midLng;
      bounds.north = midLat;
    }
  }

  return [
    [bounds.north, bounds.west],
    [bounds.south, bounds.east],
  ];
}

/**
 * Custom hook to track map bounds and zoom level.
 * @returns {Object} - Contains the current bounds and zoom level.
 */
function useMapBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());
  const [zoom, setZoom] = useState(map.getZoom());

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

/**
 * Handles map click events to trigger subdivision.
 * @param {Function} onMapClick - Callback function for map clicks.
 * @returns {null}
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}
