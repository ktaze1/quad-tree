import React, { useRef, useState } from "react";
import { QuadTree } from "./QuadTree";
import MapView from "./MapView";
import "./styles.css";

export default function App() {
  // We store the QuadTree in a ref so it persists across re-renders
  const quadTreeRef = useRef(new QuadTree());
  const [refreshCount, setRefreshCount] = useState(0);

  // Set maximum depth to 20
  const MAX_DEPTH = 20;

  /**
   * Handle map click events to subdivide the QuadTree
   * @param {Object} latlng - The latitude and longitude of the click event
   */
  function handleMapClick(latlng) {
    const path = findLeafPath(latlng);
    quadTreeRef.current.subdivide(path);
    // Force a re-render by updating the refresh count
    setRefreshCount((c) => c + 1);
  }

  /**
   * Find the path to the leaf node corresponding to the clicked location
   * @param {Object} latlng - The latitude and longitude of the click event
   * @returns {string} - The path string representing the leaf node
   */
  function findLeafPath(latlng) {
    let path = "";
    let depth = 0;
    let node = quadTreeRef.current.nodes[path];
    let { north, south, west, east } = quadTreeRef.current.bounds;

    while (depth < MAX_DEPTH) {
      if (!node || node.isLeaf) {
        // Found a leaf or empty node
        return path;
      }

      const midLat = (north + south) / 2;
      const midLng = (west + east) / 2;

      // Determine which quadrant the latlng belongs to
      const verticalBit = latlng.lat >= midLat ? "0" : "1"; // Top or Bottom
      const horizontalBit = latlng.lng >= midLng ? "1" : "0"; // Right or Left

      // The new child path is verticalBit + horizontalBit
      const childSuffix = verticalBit + horizontalBit;
      const childPath = path + childSuffix;

      // Update bounding box based on the quadrant
      if (childSuffix === "00") {
        // Top-Left
        east = midLng;
        south = midLat;
      } else if (childSuffix === "01") {
        // Top-Right
        west = midLng;
        south = midLat;
      } else if (childSuffix === "10") {
        // Bottom-Left
        north = midLat;
        east = midLng;
      } else if (childSuffix === "11") {
        // Bottom-Right
        west = midLng;
        north = midLat;
      }

      // Move deeper into the QuadTree
      path = childPath;
      node = quadTreeRef.current.nodes[childPath];
      depth += 1;
    }

    return path;
  }

  /**
   * Export the current QuadTree structure as a JSON file
   */
  function handleExport() {
    const quadTree = quadTreeRef.current;
    const jsonStr = quadTree.export();

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quadtree_export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import a QuadTree structure from a JSON file
   * @param {Event} e - The file input change event
   */
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      const data = evt.target.result;
      quadTreeRef.current.import(data);
      // Force a re-render by updating the refresh count
      setRefreshCount((c) => c + 1);
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-container">
      <div className="map-container">
        <MapView quadTree={quadTreeRef.current} onMapClick={handleMapClick} />
      </div>
      <div className="controls">
        <button onClick={handleExport}>Export QuadTree</button>
        <input type="file" accept=".json" onChange={handleImport} />
      </div>
    </div>
  );
}
