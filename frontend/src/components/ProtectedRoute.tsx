import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("access");

  // Redirect to login if no token exists
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Render children if token exists
  return <>{children}</>;
};

export default ProtectedRoute;
