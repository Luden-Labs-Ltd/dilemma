import { createBrowserRouter } from "react-router-dom";
import {
  DilemmaSelectionPage,
  VideoPage,
  ChoicePage,
  // ReasonPage,
  StatsPage,
  ExtraPage,
  InsightPage,
} from "../../pages";
import { RootLayout } from "@/app/layout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <DilemmaSelectionPage />,
      },
      {
        path: "/video",
        element: <VideoPage />,
      },
      {
        path: "/choice",
        element: <ChoicePage />,
      },
      // {
      //   path: "/reason",
      //   element: <ReasonPage />,
      // },
      {
        path: "/stats",
        element: <StatsPage />,
      },
      {
        path: "/extra",
        element: <ExtraPage />,
      },
      {
        path: "/insight",
        element: <InsightPage />,
      },
    ],
  },
]);
