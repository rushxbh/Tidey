import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useBalanceOfAQUA } from "../hooks/useAquaCoin";
interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: "volunteer" | "ngo";
  organizationName?: string;
  aquaCoins?: number;
  profilePicture?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
  eventsJoined?: number;
  totalHoursVolunteered?: number;
  achievements?: string[];
  verified?: boolean;
  website?: string;
  organizationDescription?: string;
  walletAddress?: string; // For MetaMask integration
  walletConnected?: boolean;
  AQUABalance?: number;
  AQUASymbol?: string;
  AQUADecimal?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Add AquaCoin hook
  const {
    tokenBalance,
    balanceLoading,
    tokenSymbol,
    symbolLoading,
    tokenDecimals,
    decimalsLoading,
  } = useBalanceOfAQUA();

  // Configure axios defaults
  useEffect(() => {
    // Set base URL for API calls
    axios.defaults.baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:3001";

    // Add request interceptor to include auth token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          setUser(null);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await fetchUser();
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      const userData = response.data.user || response.data;

      // Ensure user has an id field (some parts of the app expect this)
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error("Invalid response from server");
      }

      // Store token
      localStorage.setItem("token", token);

      // Ensure user has an id field
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }

      // Set user state
      setUser(userData);

      return userData;
    } catch (error: any) {
      console.error("Login error:", error);

      // Clean up on error
      localStorage.removeItem("token");
      setUser(null);

      // Re-throw with better error message
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const register = async (userData: any) => {
    try {
      // Clean and validate data
      const cleanedData = {
        ...userData,
        email: userData.email.toLowerCase().trim(),
        name: userData.name.trim(),
      };

      const response = await axios.post("/api/auth/register", cleanedData);

      const { token, user: newUser } = response.data;

      if (!token || !newUser) {
        throw new Error("Invalid response from server");
      }

      // Store token
      localStorage.setItem("token", token);

      // Ensure user has an id field
      if (newUser._id && !newUser.id) {
        newUser.id = newUser._id;
      }

      // Set user state
      setUser(newUser);

      return newUser;
    } catch (error: any) {
      console.error("Registration error:", error);

      // Clean up on error
      localStorage.removeItem("token");
      setUser(null);

      // Re-throw with better error message
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = () => {
    try {
      // Clear token and user data
      localStorage.removeItem("token");
      setUser(null);

      // Clear any cached data
      sessionStorage.clear();

      // Optional: Call logout endpoint to invalidate token on server
      axios.post("/api/auth/logout").catch(() => {
        // Ignore errors on logout endpoint
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    try {
      if (user) {
        const updatedUser = await fetchUser();
        return updatedUser;
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  };

  // MetaMask Integration
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          const walletAddress = accounts[0];

          // Update user with wallet info
          updateUser({
            walletAddress,
            walletConnected: true,
          });

          // Show success notification
          showNotification("Wallet connected successfully!", "success");
        }
      } else {
        showNotification(
          "MetaMask is not installed. Please install MetaMask to connect your wallet.",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      showNotification("Failed to connect wallet. Please try again.", "error");
    }
  };

  const disconnectWallet = () => {
    updateUser({
      walletAddress: undefined,
      walletConnected: false,
    });
    showNotification("Wallet disconnected", "info");
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    } text-white`;
    notification.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${
          type === "success"
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : type === "error"
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        }
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  // Sync AQUA balance to user if wallet is connected and values are available
  useEffect(() => {
    if (
      user?.walletConnected &&
      user.walletAddress &&
      tokenBalance !== undefined &&
      tokenSymbol !== undefined &&
      tokenDecimals !== undefined
    ) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              AQUABalance:
                typeof tokenBalance === "bigint"
                  ? Number(tokenBalance) / Math.pow(10, Number(tokenDecimals))
                  : Number(tokenBalance),
              AQUASymbol: String(tokenSymbol),
              AQUADecimal: Number(tokenDecimals),
            }
          : prev
      );
    }
    // Optionally, clear AQUA info if wallet disconnected
    if (user && !user.walletConnected) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              AQUABalance: undefined,
              AQUASymbol: undefined,
              AQUADecimal: undefined,
            }
          : prev
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tokenBalance,
    tokenSymbol,
    tokenDecimals,
    user?.walletConnected,
    user?.walletAddress,
  ]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
    refreshUser,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
