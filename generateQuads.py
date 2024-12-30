# import json
# import random
# import os

# class QuadTreeGenerator:
#     def __init__(self, max_depth=20):
#         self.nodes = {"": {"isLeaf": True, "value": 0}}
#         self.max_depth = max_depth

#     def subdivide(self, path):
#         """Subdivide a node into 4 children."""
#         if len(path) / 2 >= self.max_depth:
#             return

#         # Mark the current node as internal
#         if path in self.nodes and self.nodes[path]["isLeaf"]:
#             self.nodes[path]["isLeaf"] = False
#             del self.nodes[path]["value"]

#         # Add 4 children nodes
#         for suffix in ["00", "01", "10", "11"]:
#             child_path = path + suffix
#             self.nodes[child_path] = {"isLeaf": True, "value": 0}

#     def generate_quads(self, target_quads):
#         """Generate a QuadTree with approximately target_quads."""
#         leaves = [""]
#         while len(self.nodes) < target_quads:
#             if not leaves:
#                 break

#             # Pick a random leaf to subdivide
#             path = random.choice(leaves)
#             self.subdivide(path)

#             # Update the list of leaves
#             leaves.remove(path)
#             for suffix in ["00", "01", "10", "11"]:
#                 child_path = path + suffix
#                 if len(child_path) / 2 < self.max_depth:
#                     leaves.append(child_path)

#     def export_to_file(self, file_path):
#         """Export the QuadTree nodes as JSON."""
#         with open(file_path, "w") as f:
#             json.dump({"nodes": self.nodes}, f, indent=4)

# # User Input
# def main():
#     target_quads = int(input("Enter the number of quads (4-40 million): "))
#     if not (4 <= target_quads <= 40_000_000):
#         print("Invalid number of quads. Please enter a value between 4 and 40 million.")
#         return

#     generator = QuadTreeGenerator(max_depth=20)
#     generator.generate_quads(target_quads)

#     # Save to file
#     output_file = "quadtree.json"
#     generator.export_to_file(output_file)
#     print(f"QuadTree JSON exported to {os.path.abspath(output_file)}")

# if __name__ == "__main__":
#     main()



import json
import random
import os

class QuadTreeGenerator:
    def __init__(self, max_depth=20):
        self.nodes = {"": {"isLeaf": True, "value": 0}}
        self.max_depth = max_depth

    def subdivide(self, path):
        """Subdivide a node into 4 children."""
        if len(path) / 2 >= self.max_depth:
            return

        # Mark the current node as internal
        if path in self.nodes and self.nodes[path]["isLeaf"]:
            self.nodes[path]["isLeaf"] = False
            del self.nodes[path]["value"]

        # Add 4 children nodes
        for suffix in ["00", "01", "10", "11"]:
            child_path = path + suffix
            self.nodes[child_path] = {"isLeaf": True, "value": 0}

    def generate_quads(self, target_quads):
        """Generate a QuadTree with approximately target_quads."""
        leaves = [""]
        while len(self.nodes) < target_quads:
            if not leaves:
                break

            # Pick a random leaf to subdivide
            path = random.choice(leaves)
            self.subdivide(path)

            # Update the list of leaves
            leaves.remove(path)
            for suffix in ["00", "01", "10", "11"]:
                child_path = path + suffix
                if len(child_path) / 2 < self.max_depth:
                    leaves.append(child_path)

    def export_to_file(self, file_path):
        """Export the QuadTree nodes as JSON."""
        with open(file_path, "w") as f:
            json.dump({"nodes": self.nodes}, f, indent=4)

# User Input
def main():
    target_quads = int(input("Enter the number of quads (4-40 million): "))
    if not (4 <= target_quads <= 40_000_000):
        print("Invalid number of quads. Please enter a value between 4 and 40 million.")
        return

    generator = QuadTreeGenerator(max_depth=20)
    generator.generate_quads(target_quads)

    # Save to file
    output_file = "quadtree.json"
    generator.export_to_file(output_file)
    print(f"QuadTree JSON exported to {os.path.abspath(output_file)}")

if __name__ == "__main__":
    main()
