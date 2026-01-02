import { createContext, useState, useEffect } from 'react';
import { isAuthenticated as checkAuth, removeToken } from '../api/api';

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Manages authentication state across the application
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  /**
   * Login function - sets authenticated state to true
   */
  const login = () => {
    setIsAuthenticated(true);
  };

  /**
   * Logout function - removes token and sets authenticated state to false
   */
  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

