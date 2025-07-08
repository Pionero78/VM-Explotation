import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";
import {
  logDeploymentStatus,
  handleProductionError,
} from "@/utils/deploymentCheck";

// Initialize Tempo Devtools only in development
if (import.meta.env.VITE_TEMPO === "true") {
  TempoDevtools.init();
}

// Run deployment compatibility check
logDeploymentStatus();

// Global error handler for production
window.addEventListener("error", (event) => {
  handleProductionError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  handleProductionError(new Error(event.reason), {
    type: "unhandledrejection",
    reason: event.reason,
  });
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Check your index.html file.");
}

createRoot(rootElement).render(<App />);
