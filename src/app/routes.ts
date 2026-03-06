import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { DashboardProtected } from "./components/DashboardProtected";
import { Dashboard } from "./components/Dashboard";
import { PricingPage } from "./components/PricingPage";
import { LoginPage, RegisterPage } from "./components/AuthPage";
import { NotFound } from "./components/NotFound";
import { ThinkClawProtected } from "./components/ThinkClawProtected";
import { FocusProtected } from "./components/FocusProtected";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminSubscriptions } from "./admin/AdminSubscriptions";
import { AdminContent } from "./admin/AdminContent";
import { AdminCircles } from "./admin/AdminCircles";
import { AdminAI } from "./admin/AdminAI";
import { AdminAnalytics } from "./admin/AdminAnalytics";
import { AdminFeedback } from "./admin/AdminFeedback";
import { AdminSettings } from "./admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "",
        Component: Layout,
        children: [
          { index: true, Component: LandingPage },
          { path: "login", Component: LoginPage },
          { path: "register", Component: RegisterPage },
          { path: "pricing", Component: PricingPage },
          { path: "*", Component: NotFound },
        ],
      },
      {
        path: "dashboard",
        Component: DashboardProtected,
        children: [
          { index: true, Component: Dashboard },
        ],
      },
      {
        path: "thinkclaw",
        Component: ThinkClawProtected,
      },
      {
        path: "focus",
        Component: FocusProtected,
      },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "users", Component: AdminUsers },
          { path: "subscriptions", Component: AdminSubscriptions },
          { path: "content", Component: AdminContent },
          { path: "circles", Component: AdminCircles },
          { path: "ai", Component: AdminAI },
          { path: "analytics", Component: AdminAnalytics },
          { path: "feedback", Component: AdminFeedback },
          { path: "settings", Component: AdminSettings },
        ],
      },
    ],
  },
]);
