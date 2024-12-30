import React from "react";
import { MapContainer, TileLayer, Rectangle, useMapEvents } from "react-leaflet";
import L from "leaflet";

/**
 * Custom hook-like component to handle map clicks.
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView({ quadTree, onMapClick }) {
  // Create a Rectangle for each node in the quadTree
  const rectangles = Object.keys(quadTree.nodes).map((path) => {
    const node = quadTree.nodes[path];
    if (!node) return null;

    const { north, south, west, east } = quadTree.getBoundsForPath(path);
    const bounds = [
      [north, west],
      [south, east],
    ];

    // Leaves in one color, internals in another
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
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      crs={L.CRS.EPSG3857}
      worldCopyJump={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {rectangles}
    </MapContainer>
  );
}
