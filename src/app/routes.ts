import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { DashboardProtected } from "./components/DashboardProtected";
import { Dashboard } from "./components/Dashboard";
import { PricingPage } from "./components/PricingPage";
import { LoginPage, RegisterPage } from "./components/AuthPage";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
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
    path: "/dashboard",
    Component: DashboardProtected,
    children: [
      { index: true, Component: Dashboard },
    ],
  },
]);
