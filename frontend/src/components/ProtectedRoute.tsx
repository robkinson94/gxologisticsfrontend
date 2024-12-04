import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        await API.post("/token/verify/", { token });
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    // Loading state while token is verified
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
