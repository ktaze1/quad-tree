import React from "react";
import { MapContainer, TileLayer, Rectangle, useMapEvents } from "react-leaflet";
import L from "leaflet";

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView({ quadTree, onMapClick }) {
  // Render all quads as rectangles for demonstration
  const rectangles = Object.keys(quadTree.nodes).map((path) => {
    const node = quadTree.nodes[path];
    if (!node) return null;

    const { north, south, west, east } = quadTree.getBoundsForPath(path);
    const bounds = [
      [north, west],
      [south, east],
    ];

    // We'll style leaves differently from internal nodes
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
      minZoom={1}
      maxZoom={7}
      worldCopyJump={true}
      crs={L.CRS.EPSG3857}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {rectangles}
    </MapContainer>
  );
}