import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Verificando sesión…</div>;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <>{children}</>;
};

export default PrivateRoute;
