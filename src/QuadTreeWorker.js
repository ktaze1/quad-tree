// src/QuadTreeWorker.js

/* eslint-disable no-restricted-globals */

import { QuadTree } from "./QuadTree";

const MAX_DEPTH = 20;

// Initialize QuadTree instance
const quadTree = new QuadTree();

// Listen for messages from the main thread
self.onmessage = function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case "import":
      quadTree.import(payload.jsonString);
      self.postMessage({ type: "imported" });
      // After import, send an initial queryRange to render the map
      self.postMessage({
        type: "queryRange",
        payload: { queryBounds: quadTree.bounds },
      });
      break;

    case "export":
      const jsonStr = quadTree.export();
      self.postMessage({ type: "exported", payload: { jsonString: jsonStr } });
      break;

    case "queryRange":
      const quads = quadTree.queryRange(payload.queryBounds);
      const quadsWithLeaf = quads.map((path) => ({
        path,
        isLeaf: quadTree.isLeaf(path),
      }));
      self.postMessage({ type: "queryRangeResult", payload: { quads: quadsWithLeaf } });
      break;

    case "subdivide":
      const path = findLeafPath(payload.latlng);
      if (path) {
        quadTree.subdivide(path);
        self.postMessage({ type: "subdivided", payload: { path } });
        // After subdivision, send an updated queryRange to reflect changes
        self.postMessage({
          type: "queryRange",
          payload: { queryBounds: quadTree.bounds },
        });
      } else {
        console.error("Could not find leaf path for subdivision.");
      }
      break;

    default:
      console.error(`Unknown message type: ${type}`);
  }
};

/**
 * Finds the path to the leaf node corresponding to the clicked location.
 * @param {Object} latlng - The latitude and longitude of the click event.
 * @returns {string} - The path string representing the leaf node.
 */
function findLeafPath(latlng) {
  let path = "";
  let depth = 0;
  let node = quadTree.nodes[path];
  let { north, south, west, east } = quadTree.bounds;

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
    node = quadTree.nodes[path];
    depth += 1;
  }

  return path;
}
