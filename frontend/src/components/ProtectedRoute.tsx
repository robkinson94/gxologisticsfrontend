import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api"; // Import your Axios instance
import { AxiosError } from "axios";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
          throw new Error("No access token available.");
        }

        // POST request to verify the token
        await API.post("/token/verify/", { token: accessToken });
        setIsAuthenticated(true);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          console.warn("Access token invalid or expired. Attempting refresh...");
          try {
            // Refresh the token
            const refreshToken = localStorage.getItem("refresh");
            if (!refreshToken) throw new Error("No refresh token available.");

            const response = await API.post("/token/refresh/", { refresh: refreshToken });
            const newAccessToken = response.data.access;

            // Save the new token and mark as authenticated
            localStorage.setItem("access", newAccessToken);
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
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
