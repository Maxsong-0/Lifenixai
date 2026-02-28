import { Outlet } from "react-router";
import { LanguageProvider } from "./LanguageContext";

export function RootLayout() {
  return (
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  );
}
