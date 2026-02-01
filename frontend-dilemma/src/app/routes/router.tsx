import { createBrowserRouter } from "react-router-dom";
import {
  DilemmaSelectionPage,
  VideoPage,
  VideoEndPage,
  ChoicePage,
  // ReasonPage,
  StatsPage,
  ExtraPage,
  InsightPage,
  SharePage,
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
        path: "/video-end",
        element: <VideoEndPage />,
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
      {
        path: "/share",
        element: <SharePage />,
      },
    ],
  },
]);
