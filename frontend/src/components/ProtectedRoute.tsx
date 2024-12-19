// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthCheck } from "../useAuthChecks";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthCheck();

  if (isAuthenticated === null) {
    return <div>Checking auth status...</div>; // loading indicator
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
