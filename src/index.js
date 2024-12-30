// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Fix Leaflet's default icon issues with Webpack
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Prevent Leaflet's images from being blocked
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
