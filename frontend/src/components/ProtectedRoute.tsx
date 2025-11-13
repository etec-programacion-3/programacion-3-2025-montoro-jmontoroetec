import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import type { ReactElement } from "react";
type Props = { children: ReactElement };


export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}
