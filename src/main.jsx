import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { QuoteProvider } from "./lib/QuoteContext.jsx";
import "./styles/global.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QuoteProvider>
        <App />
      </QuoteProvider>
    </BrowserRouter>
  </StrictMode>,
);
