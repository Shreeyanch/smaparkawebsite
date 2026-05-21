import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import api from "./api/config";
import "./index.css";
// import "./main.css";
import App from "./App.jsx";
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
// import 'mantine-datatable/styles.layer.css';
// import '@mantine/dates/styles.css';

window.VITE_SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// createRoot(document.getElementById("root")).render(<App />);
