import { defineCustomElements } from "@coveo/atomic/loader";
import "@coveo/atomic/themes/coveo.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (!customElements.get("atomic-search-interface")) {
  defineCustomElements(window, {
    resourcesUrl: "https://static.cloud.coveo.com/atomic/v3/",
  });
}

createRoot(document.getElementById("root")!).render(<App />);
