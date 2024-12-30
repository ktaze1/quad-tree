/**
 * QuadTree data structure
 * Each node can be:
 *   - Leaf: store a 1-byte value
 *   - Internal: store references to up to 4 children (00, 01, 10, 11).
 */
export class QuadTree {
    constructor() {
      // For memory efficiency, we'll store nodes in an object keyed by path.
      // "" is the root path.
      this.nodes = {
        "": { isLeaf: true, value: 0 }, // root starts as a leaf
      };
  
      // Entire world bounds for demonstration
      this.bounds = {
        north: 90,
        south: -90,
        west: -180,
        east: 180,
      };
    }
  
    isLeaf(path) {
      return this.nodes[path]?.isLeaf;
    }
  
    /**
     * Subdivide a leaf node into 4 children.
     * If node is already internal (not a leaf), do nothing.
     */
    subdivide(path) {
      const node = this.nodes[path];
      if (!node || !node.isLeaf) return;
  
      // Mark current node as internal
      node.isLeaf = false;
      delete node.value; // remove the leaf's 1-byte value
  
      // Create 4 children: "00", "01", "10", "11"
      ["00", "01", "10", "11"].forEach((suffix) => {
        const childPath = path + suffix;
        this.nodes[childPath] = {
          isLeaf: true,
          value: 0, // store a dummy 1-byte value
        };
      });
    }
  
    /**
     * Compute the bounding box (north, south, west, east) for a given path.
     */
    getBoundsForPath(path) {
      let { north, south, west, east } = this.bounds;
  
      for (let i = 0; i < path.length; i += 2) {
        const bits = path.slice(i, i + 2);
        const midLat = (north + south) / 2;
        const midLng = (west + east) / 2;
  
        // bits = "00" => top-left
        // bits = "01" => top-right
        // bits = "10" => bottom-left
        // bits = "11" => bottom-right
  
        if (bits === "00") {
          // top-left
          east = midLng;
          south = midLat;
        } else if (bits === "01") {
          // top-right
          west = midLng;
          south = midLat;
        } else if (bits === "10") {
          // bottom-left
          north = midLat;
          east = midLng;
        } else if (bits === "11") {
          // bottom-right
          west = midLng;
          north = midLat;
        }
      }
  
      return { north, south, west, east };
    }
  
    /**
     * Export entire QuadTree as a JSON string
     */
    export() {
      return JSON.stringify({
        nodes: this.nodes,
      });
    }
  
    /**
     * Import from JSON string
     */
    import(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.nodes) {
          this.nodes = data.nodes;
        }
      } catch (err) {
        console.error("Invalid QuadTree import data:", err);
      }
    }
  }
  