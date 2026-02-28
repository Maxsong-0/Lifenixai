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
    ],
  },
]);
