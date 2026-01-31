import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/shared/i18n";
import "../styles/index.css";
import { router } from "@/app/routes";
import { DilemmaProvider } from "@/entities/dilemma";
import { ErrorBoundary } from "../components/ErrorBoundary";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DilemmaProvider>
        <RouterProvider router={router} />
      </DilemmaProvider>
    </ErrorBoundary>
  </StrictMode>,
);
