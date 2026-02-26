import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "./AppLayout";

export function DashboardProtected() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    </AuthProvider>
  );
}
