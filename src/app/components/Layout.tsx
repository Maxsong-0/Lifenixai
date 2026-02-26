import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { AuthProvider } from "./AuthContext";
import { DynamicBackground } from "./DynamicBackground";

export function Layout() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen">
        <DynamicBackground variant="landing" />
        <div className="relative" style={{ zIndex: 1 }}>
          <Navbar />
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  );
}
