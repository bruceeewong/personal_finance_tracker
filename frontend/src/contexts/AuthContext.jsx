import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

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
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token is valid
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Handle both object and separate email/password parameters
      const { email, password } = typeof credentials === 'object' ? credentials : { email: arguments[0], password: arguments[1] };
      const response = await api.post('/auth/login', { email, password });
      const { user, access_token } = response.data;
      
      setUser(user);
      setToken(access_token);
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, access_token } = response.data;
      
      setUser(user);
      setToken(access_token);
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};