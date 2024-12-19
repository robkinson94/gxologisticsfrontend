import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthCheck } from "../useAuthChecks";

interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthCheck();

  if (isAuthenticated) {
    // If already logged in, redirect to /dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow access to this public page (e.g., login/register)
  return <>{children}</>;
}

export default PublicRoute;
