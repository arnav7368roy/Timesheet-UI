import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session
  const checkUserSession = async () => {
    // If user is directly visiting the login page, skip calling /auth/me on initial load
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/auth/me');
      if (response && response.ok && response.data && (response.data.status || response.data.data)) {
        setUser(response.data.data || response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', 'POST', { email, password });
      if (response && response.ok) {
        const meResponse = await apiRequest('/auth/me');
        if (meResponse && meResponse.ok) {
          setUser(meResponse.data.data || meResponse.data);
          return { success: true };
        }
      }
      
      return { 
        success: false, 
        message: response?.data?.message || 'Login failed. Please check credentials.' 
      };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkUserSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
