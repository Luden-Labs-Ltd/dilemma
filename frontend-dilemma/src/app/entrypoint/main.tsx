import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/shared/i18n";
import "../styles/index.css";
import { router } from "@/app/routes";
import { DilemmaProvider } from "../context";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DilemmaProvider>
      <RouterProvider router={router} />
    </DilemmaProvider>
  </StrictMode>,
);
