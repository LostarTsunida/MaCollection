import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tokenValide } from "../utils/jwt";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!tokenValide(token)) {
    // on garde la page demandée pour y revenir après la connexion
    return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;
  }
  return children;
}
