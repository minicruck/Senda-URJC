import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Leaflet styles must be loaded before any MapContainer renders.
import "leaflet/dist/leaflet.css";
import "./index.css";
import "./i18n";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
