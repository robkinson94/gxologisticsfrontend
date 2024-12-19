// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api"; // Ensure this is correctly configured

// Define types for AuthContext
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Default values for AuthContext
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  logout: () => {},
});

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debugging: Log when AuthProvider mounts
  console.log("AuthProvider mounted");

  const login = async (username: string, password: string) => {
    console.log("Login function called with:", { username, password });
    try {
      const response = await api.post<{ access: string; refresh: string }>(
        "/login/", // Ensure this endpoint is correct
        { username, password }
      );
      console.log("Login response received:", response.data);

      const { access, refresh } = response.data;

      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      console.log("Tokens stored in localStorage");

      // Fetch user data
      const userResponse = await api.get<User>("/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      console.log("User data fetched:", userResponse.data);

      setUser(userResponse.data);
      setIsAuthenticated(true);
      console.log("User authenticated and state updated");
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error; // Rethrow to let the caller handle it
    }
  };

  const logout = () => {
    console.log("Logout function called");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    console.log("Tokens removed from localStorage and state updated");
    window.location.href = "/login"; // Redirect to login
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing authentication...");
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      setLoading(true);

      if (token) {
        try {
          console.log("Validating token by fetching user data...");
          const response = await api.get<User>("/me/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("User data fetched during initialization:", response.data);
          setUser(response.data);
          setIsAuthenticated(true);
          console.log("User authenticated during initialization");
        } catch (error: any) {
          console.error("Failed to initialize authentication:", error);
          logout(); // Redirect to login if auth initialization fails
        }
      } else {
        console.log("No token found in localStorage");
      }

      setLoading(false);
      console.log("Authentication initialization complete. Loading set to false");
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {!loading ? (
        children
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p>Loading authentication...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};
