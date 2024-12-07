import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

// Define the type for JWT payload
interface JwtPayload {
  exp?: number; // Expiration time as UNIX timestamp
  [key: string]: any; // Any additional claims in the token
}

// Props for the ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("access");

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token
    const decodedToken = jwtDecode<JwtPayload>(token);

    // Check if the token has expired
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      console.warn("Token has expired.");
      localStorage.removeItem("access"); // Remove expired token
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("access"); // Remove invalid token
    return <Navigate to="/login" />;
  }

  // Token is valid and not expired, render children
  return <>{children}</>;
};

export default ProtectedRoute;
