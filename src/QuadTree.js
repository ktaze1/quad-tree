// src/QuadTree.js

/**
 * QuadTree data structure
 * Each node can be:
 *   - Leaf: store a 1-byte value
 *   - Internal: store references to up to 4 children
 */

export class QuadTree {
  constructor() {
    // Initialize nodes with the root node
    this.nodes = {
      "": { isLeaf: true, value: 0 }, // root starts as a leaf with a 1-byte value
    };
    // Define the entire world's bounding box
    this.bounds = {
      north: 90,
      south: -90,
      west: -180,
      east: 180,
    };
  }

  /**
   * Check if a path is a leaf node
   * @param {string} path - The path string
   * @returns {boolean} - True if the node is a leaf, else false
   */
  isLeaf(path) {
    return this.nodes[path]?.isLeaf;
  }

  /**
   * Subdivide a leaf node into 4 children
   * If the node is already subdivided, do nothing.
   * @param {string} path - The path string to subdivide
   */
  subdivide(path) {
    const node = this.nodes[path];
    if (!node || !node.isLeaf) return;

    // Mark current node as internal
    node.isLeaf = false;
    // Remove the leaf value to indicate internal node
    delete node.value;

    // Create 4 children
    // childPaths => 00, 01, 10, 11
    ["00", "01", "10", "11"].forEach((suffix) => {
      const childPath = path + suffix;
      this.nodes[childPath] = {
        isLeaf: true,
        value: 0, // 1-byte value (dummy example)
      };
    });
  }

  /**
   * Returns bounding box for a given path
   * We recursively halve the lat/lng ranges according to bits
   * @param {string} path - The path string
   * @returns {Object} - Bounding box with north, south, west, east
   */
  getBoundsForPath(path) {
    let { north, south, west, east } = this.bounds;
    for (let i = 0; i < path.length; i += 2) {
      const bits = path.slice(i, i + 2);
      const midLat = (north + south) / 2;
      const midLng = (west + east) / 2;
      // bits = "00" => top-left child
      // bits = "01" => top-right child
      // bits = "10" => bottom-left child
      // bits = "11" => bottom-right child

      if (bits === "00") {
        // Top-Left
        east = midLng;
        south = midLat;
      } else if (bits === "01") {
        // Top-Right
        west = midLng;
        south = midLat;
      } else if (bits === "10") {
        // Bottom-Left
        north = midLat;
        east = midLng;
      } else if (bits === "11") {
        // Bottom-Right
        west = midLng;
        north = midLat;
      }
    }
    return { north, south, west, east };
  }

  /**
   * Check if two bounding boxes intersect
   * @param {Object} a - First bounding box
   * @param {Object} b - Second bounding box
   * @returns {boolean} - True if they intersect, else false
   */
  intersects(a, b) {
    return !(
      a.east < b.west ||
      a.west > b.east ||
      a.north < b.south ||
      a.south > b.north
    );
  }

  /**
   * Query the QuadTree for all leaf nodes within the specified bounds
   * @param {Object} queryBounds - The bounding box to query
   * @returns {Array} - An array of paths representing leaf nodes within the bounds
   */
  queryRange(queryBounds) {
    const result = [];
    this._queryRangeHelper("", this.bounds, queryBounds, result);
    return result;
  }

  /**
   * Helper method for queryRange to recursively traverse the QuadTree
   * @param {string} path - Current node path
   * @param {Object} nodeBounds - Bounding box of the current node
   * @param {Object} queryBounds - Bounding box to query
   * @param {Array} result - Accumulator for matching leaf node paths
   */
  _queryRangeHelper(path, nodeBounds, queryBounds, result) {
    // Check if the current node's bounds intersect with the query bounds
    if (!this.intersects(nodeBounds, queryBounds)) {
      return; // No intersection, skip this node
    }

    const node = this.nodes[path];
    if (!node) {
      // If the node doesn't exist, treat it as a leaf with default value
      result.push(path);
      return;
    }

    if (node.isLeaf) {
      // If it's a leaf node, add to result
      result.push(path);
      return;
    }

    // If it's an internal node, recurse into its children
    const children = ["00", "01", "10", "11"];
    const { north, south, west, east } = nodeBounds;

    for (const suffix of children) {
      const childPath = path + suffix;
      const midLat = (north + south) / 2;
      const midLng = (west + east) / 2;

      let childBounds = {};
      if (suffix === "00") {
        // Top-Left
        childBounds = {
          north: north,
          south: midLat,
          west: west,
          east: midLng,
        };
      } else if (suffix === "01") {
        // Top-Right
        childBounds = {
          north: north,
          south: midLat,
          west: midLng,
          east: east,
        };
      } else if (suffix === "10") {
        // Bottom-Left
        childBounds = {
          north: midLat,
          south: south,
          west: west,
          east: midLng,
        };
      } else if (suffix === "11") {
        // Bottom-Right
        childBounds = {
          north: midLat,
          south: south,
          west: midLng,
          east: east,
        };
      }

      this._queryRangeHelper(childPath, childBounds, queryBounds, result);
    }
  }

  /**
   * Export the entire QuadTree structure as JSON
   * @returns {string} - JSON string representing the QuadTree
   */
  export() {
    return JSON.stringify({
      nodes: this.nodes,
    });
  }

  /**
   * Import a JSON string into the QuadTree
   * @param {string} jsonString - The JSON string to import
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.nodes) {
        this.nodes = data.nodes;
      }
    } catch (err) {
      console.error("Invalid QuadTree import data");
    }
  }
}
