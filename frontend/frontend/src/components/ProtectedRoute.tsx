import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { token } = useAuth();          
  const location = useLocation();

  const isAuthenticated = !!token;      

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

