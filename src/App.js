import React, { useRef, useState } from "react";
import { QuadTree } from "./QuadTree";
import MapView from "./MapView";
import "./styles.css";

export default function App() {
  // Keep QuadTree in a ref so it’s not recreated on every render
  const quadTreeRef = useRef(new QuadTree());
  const [refreshCount, setRefreshCount] = useState(0);

  /**
   * Find which leaf path the clicked lat/lng belongs to,
   * then subdivide that leaf. Force re-render so we see changes.
   */
  function handleMapClick(latlng) {
    const path = findLeafPath(latlng);
    quadTreeRef.current.subdivide(path);
    setRefreshCount((c) => c + 1);
  }

  /**
   * Naive function to find the path of the leaf containing the given latlng.
   * We'll go up to some max depth. If we reach a leaf or max depth, we stop.
   */
  function findLeafPath(latlng) {
    let path = "";
    const quadTree = quadTreeRef.current;
    let node = quadTree.nodes[path];

    // Start with world bounds
    let { north, south, west, east } = quadTree.bounds;
    const maxDepth = 10;

    for (let d = 0; d < maxDepth; d++) {
      if (!node || node.isLeaf) {
        // If we found a leaf or there's no node, return current path
        return path;
      }

      const midLat = (north + south) / 2;
      const midLng = (west + east) / 2;

      // 0 => top (lat >= midLat), 1 => bottom (lat < midLat)
      // 0 => left (lng < midLng), 1 => right (lng >= midLng)
      // But we want to match the bits "00", "01", "10", "11"
      // We'll do top-left => "00", top-right => "01", bottom-left => "10", bottom-right => "11"

      let bits = "";
      if (latlng.lat >= midLat && latlng.lng < midLng) {
        // top-left => "00"
        bits = "00";
        // Update bounds
        east = midLng;
        south = midLat;
      } else if (latlng.lat >= midLat && latlng.lng >= midLng) {
        // top-right => "01"
        bits = "01";
        west = midLng;
        south = midLat;
      } else if (latlng.lat < midLat && latlng.lng < midLng) {
        // bottom-left => "10"
        bits = "10";
        north = midLat;
        east = midLng;
      } else {
        // bottom-right => "11"
        bits = "11";
        west = midLng;
        north = midLat;
      }

      path += bits;
      node = quadTree.nodes[path];
    }

    return path;
  }

  /**
   * Export the entire QuadTree to JSON file
   */
  function handleExport() {
    const jsonStr = quadTreeRef.current.export();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quadtree_export.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import the QuadTree from a JSON file
   */
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      quadTreeRef.current.import(data);
      setRefreshCount((c) => c + 1); // re-render
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-container">
      <div className="map-container">
        <MapView
          quadTree={quadTreeRef.current}
          onMapClick={handleMapClick}
        />
      </div>
      <div className="controls">
        <button onClick={handleExport}>Export QuadTree</button>
        <input type="file" accept=".json" onChange={handleImport} />
      </div>
    </div>
  );
}
