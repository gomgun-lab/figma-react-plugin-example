import { createRoot } from "react-dom/client";
import App from "./app";
import React from "react";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("react-page") as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
});
