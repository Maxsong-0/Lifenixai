import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { ThinkClawPage } from "./ThinkClawPage";

export function ThinkClawProtected() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ThinkClawPage />
      </ProtectedRoute>
    </AuthProvider>
  );
}
