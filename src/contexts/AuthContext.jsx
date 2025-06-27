// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API base URL - adjust this based on your backend deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API utility functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiCall('/auth/profile');
          setUser(response.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, userType) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          userType
        }
      });

      if (response.success) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: {
          email,
          password,
          userData
        }
      });

      if (response.success) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: updates
      });

      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Activity-related functions
  const getActivities = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiCall(`/activities?${queryParams}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return { success: false, error: error.message };
    }
  };

  const createActivity = async (activityData) => {
    try {
      const response = await apiCall('/activities', {
        method: 'POST',
        body: activityData
      });

      if (response.success) {
        return { success: true, activity: response.activity };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Failed to create activity:', error);
      return { success: false, error: error.message };
    }
  };

  const registerForActivity = async (activityId) => {
    try {
      const response = await apiCall(`/activities/${activityId}/register`, {
        method: 'POST'
      });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Failed to register for activity:', error);
      return { success: false, error: error.message };
    }
  };

  // Blockchain-related functions
  const updateWalletAddress = async (walletAddress) => {
    try {
      const response = await apiCall('/blockchain/wallet', {
        method: 'POST',
        body: { walletAddress }
      });

      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Failed to update wallet address:', error);
      return { success: false, error: error.message };
    }
  };

  const recordTransaction = async (txHash, type, amount) => {
    try {
      const response = await apiCall('/blockchain/transaction', {
        method: 'POST',
        body: { txHash, type, amount }
      });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Failed to record transaction:', error);
      return { success: false, error: error.message };
    }
  };

  const getTransactions = async () => {
    try {
      const response = await apiCall('/blockchain/transactions');
      return { success: true, transactions: response.transactions };
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    // Activity functions
    getActivities,
    createActivity,
    registerForActivity,
    // Blockchain functions
    updateWalletAddress,
    recordTransaction,
    getTransactions,
    // Utility
    isAuthenticated: !!user,
    isVolunteer: user?.role === 'volunteer',
    isNGO: user?.role === 'ngo'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};