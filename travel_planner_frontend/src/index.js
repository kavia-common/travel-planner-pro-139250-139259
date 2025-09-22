import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

/**
 * PUBLIC_INTERFACE
 * Bootstrap file for the React application.
 * - Initializes React 18 root using react-dom/client
 * - Imports global styles (styles.css)
 * - Renders the top-level App component into the #root DOM node
 */
const container = document.getElementById("root");
if (!container) {
  // Fail early with a helpful message if index.html is misconfigured
  // (Create React App expects a div#root in public/index.html)
  throw new Error(
    "Root container #root not found. Ensure public/index.html contains <div id=\"root\"></div>."
  );
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
