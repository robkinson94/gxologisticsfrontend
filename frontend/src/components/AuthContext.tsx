import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api";

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

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post<{ access: string; refresh: string }>(
        "/login/",
        { username, password }
      );
      const { access, refresh } = response.data;

      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);

      const userResponse = await api.get<User>("/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login"; // Redirect to login
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (token) {
        try {
          const response = await api.get<User>("/me/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to initialize authentication:", error);
          logout(); // Redirect to login if auth initialization fails
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
