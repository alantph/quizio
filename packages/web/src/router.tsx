import AuthLayout from "@quizio/web/pages/game/auth/layout";
import PlayerAuthPage from "@quizio/web/pages/game/auth/page";
import { GameLayout } from "@quizio/web/pages/game/layout";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import AdminGameStartPage from "./pages/game/admin-start/page";
import ManagerGamePage from "./pages/game/party/manager/page";
import PlayerGamePage from "./pages/game/party/page";
import AdminLayoutPage from "./pages/admin/layout";
import AdminLoginPage from "./pages/admin/login/page";
import AdminDashboardPage from "./pages/admin/dashboard/page";
import AdminQuizNewPage from "./pages/admin/quiz/new/page";
import AdminQuizEditPage from "./pages/admin/quiz/[id]/page";
import AdminSettingsPage from "./pages/admin/settings/page";
import GameHistoryPage from "./pages/admin/game-history/page";
import GameDetailPage from "./pages/admin/game-history/[id]/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GameLayout />,
    children: [
      {
        path: "/",
        element: <AuthLayout />,
        children: [
          {
            path: "/",
            element: <PlayerAuthPage />,
          },
        ],
      },
      {
        path: "/start/:quizId",
        element: <AdminGameStartPage />,
      },
      {
        path: "/party/:gameId",
        element: <PlayerGamePage />,
      },
      {
        path: "/party/manager/:gameId",
        element: <ManagerGamePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayoutPage />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "login", element: <AdminLoginPage /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "quiz/new", element: <AdminQuizNewPage /> },
      { path: "quiz/:id", element: <AdminQuizEditPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
      { path: "game-history", element: <GameHistoryPage /> },
      { path: "game-history/:id", element: <GameDetailPage /> },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
