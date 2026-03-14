import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import PokemonDetail from "./pages/PokemonDetail.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pokemon/:name" element={<PokemonDetail />} />
    </Routes>
  </BrowserRouter>
);
