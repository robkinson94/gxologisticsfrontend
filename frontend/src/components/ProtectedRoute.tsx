import React from "react";
import { Navigate } from "react-router-dom";

interface JwtPayload {
  exp: number; // Expiration time
  [key: string]: any; // Other possible claims
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const decodeToken = (token: string): JwtPayload | null => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload)); // Decode base64 string
    return payload as JwtPayload;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("access");

  if (token) {
    const decodedToken = decodeToken(token);

    if (decodedToken) {
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if the token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.warn("Token has expired.");
        localStorage.removeItem("access");
        return <Navigate to="/login" />;
      }
    } else {
      console.warn("Invalid token.");
      return <Navigate to="/login" />;
    }
  } else {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
