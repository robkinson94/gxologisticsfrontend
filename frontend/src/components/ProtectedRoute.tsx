import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "./api"; // Import your Axios instance

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Utility to decode a JWT token
const decodeToken = (token: string) => {
  try {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // Loading state for authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem("access");
      const refreshToken = localStorage.getItem("refresh");

      if (!accessToken || !refreshToken) {
        console.warn("No tokens found.");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const decodedToken = decodeToken(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken?.exp && decodedToken.exp < currentTime) {
        console.warn("Access token expired. Attempting refresh...");
        try {
          // Use your Axios instance to refresh the token
          const response = await API.post("/token/refresh/", { refresh: refreshToken });
          const newAccessToken = response.data.access;

          // Save the new token in localStorage
          localStorage.setItem("access", newAccessToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setIsAuthenticated(false);
        }
      } else {
        console.info("Access token is valid.");
        setIsAuthenticated(true);
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
