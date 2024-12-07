import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Metrics from "./pages/Metrics";
import Records from "./pages/Records";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Registration";
import EmailVerified from "./components/EmailVerfied";

// Define the type for JWT payload
interface JwtPayload {
  exp?: number; // Expiration time as UNIX timestamp
  [key: string]: any; // Any additional claims in the token
}

// Helper function to decode token and check login status
const decodeToken = (token: string): JwtPayload | null => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload)); // Decode base64 string
    return payload as JwtPayload;
  } catch {
    return null; // Invalid token
  }
};

const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("access");
  if (!token) return false;

  const decodedToken = decodeToken(token);
  if (!decodedToken) return false;

  // Check if token is expired
  return decodedToken.exp ? decodedToken.exp * 1000 > Date.now() : true;
};

const App: React.FC = () => {
  const isLoggedIn = isUserLoggedIn();

  return (
    <Router>
      <Routes>
        {/* Redirect logged-in users away from login and registration pages */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route path="/email-verify" element={<EmailVerified />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/metrics"
          element={
            <ProtectedRoute>
              <Metrics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <Records />
            </ProtectedRoute>
          }
        />
        {/* Redirect all unknown paths to dashboard if logged in, otherwise login */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
