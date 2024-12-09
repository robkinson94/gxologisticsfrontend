import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api"; // Import your Axios instance

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // Loading state for authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Make a test API call to verify token validity
        await API.get("/token/verify/"); // Replace with an appropriate API endpoint
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token invalid or expired. Attempting refresh...");
          try {
            // Refresh the token via Axios interceptors
            await API.post("/token/refresh/", {
              refresh: localStorage.getItem("refresh"),
            });
            setIsAuthenticated(true);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setIsAuthenticated(false);
          }
        } else {
          console.error("Unexpected error during token verification:", error);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false); // Authentication check is complete
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Optionally show a spinner or skeleton UI
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
