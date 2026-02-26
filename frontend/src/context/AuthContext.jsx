import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (Splash screen check)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await authService.getMe();
        if (res.data.success) setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const res = await authService.login({ email, password, rememberMe });
      if (res.data.success) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};