import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { success, error } = useNotifications();

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getAuthToken();
      if (token) {
        try {
          const userData = await apiService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Auth check failed:', err);
          apiService.setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.token) {
        apiService.setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        success('Login Successful', 'Welcome back!');
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      error('Login Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      if (response.token) {
        apiService.setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        success('Registration Successful', 'Welcome to PlantDetect!');
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      error('Registration Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      apiService.setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      success('Logged Out', 'You have been successfully logged out.');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
      success('Profile Updated', 'Your profile has been updated successfully.');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile.';
      error('Update Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getProfile();
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 