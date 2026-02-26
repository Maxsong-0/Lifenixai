import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { FocusPage } from "./FocusPage";

export function FocusProtected() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <FocusPage />
      </ProtectedRoute>
    </AuthProvider>
  );
}
