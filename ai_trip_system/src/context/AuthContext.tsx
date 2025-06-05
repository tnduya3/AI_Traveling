"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { useGoogleLogin } from '@react-oauth/google';

// Define the shape of our context
interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (token: string, username: string) => void;
  logout: () => void;
  socialLogin: (provider: string, token?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  username: '',
  login: () => {},
  logout: () => {},
  socialLogin: async () => {},
  isLoading: false,
  error: null,
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Traditional login function (username + password only)
  const login = (token: string, username: string) => {
    // Set cookie
    setCookie('token', token);

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
    }

    // Update state
    setIsLoggedIn(true);
    setUsername(username);
    setError(null);
  };

  // Function to handle social login
  const socialLogin = async (provider: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (provider === 'google' && data) {
        // Cập nhật trạng thái đăng nhập
        login(data.access_token, data.username || 'User');
      } else {
        throw new Error(`Provider ${provider} không được hỗ trợ hoặc thiếu token`);
      }
    } catch (err: any) {
      setError(err.message);
      throw err; // Ném lỗi để component xử lý
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear cookie
    deleteCookie('token');

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
    }

    // Update state
    setIsLoggedIn(false);
    setUsername('');
    setError(null);
  };

  // Initialize state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const storedUsername = localStorage.getItem('username') || '';
      const token = getCookie('token');

      // Only set logged in if both localStorage and token cookie exist
      setIsLoggedIn(storedLoggedIn && !!token);
      setUsername(storedUsername);
      setIsInitialized(true);
    }
  }, []);

  // Don't render children until auth is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      username,
      login,
      logout,
      socialLogin,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}