import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Counter from "./Counter.jsx";
import "../style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Counter />
  </StrictMode>
);
