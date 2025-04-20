// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { LoginPayload, AuthResponse, User } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiration: Date | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authTokenData';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    tokenExpiration: null,
    isLoading: true, // Start as true to check local storage
    error: null,
  });
  const navigate = useNavigate();

  const loadAuthDataFromStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedData) {
        const parsedData: AuthResponse = JSON.parse(storedData);
        const expirationDate = new Date(parsedData.expiration);

        if (expirationDate > new Date()) {
          setAuthState({
            isAuthenticated: true,
            user: { username: parsedData.username },
            token: parsedData.token,
            tokenExpiration: expirationDate,
            isLoading: false,
            error: null,
          });
          console.log("Auth data loaded from storage.");
        } else {
          // Token expired
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setAuthState(prev => ({ ...prev, isLoading: false }));
           console.log("Stored token expired.");
        }
      } else {
         setAuthState(prev => ({ ...prev, isLoading: false }));
          console.log("No auth data in storage.");
      }
    } catch (error) {
      console.error("Failed to load auth data from storage:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY); // Clear potentially corrupted data
       setAuthState(prev => ({ ...prev, isLoading: false, error: "Failed to load session" }));
    }
  }, []);


  useEffect(() => {
    loadAuthDataFromStorage();
  }, [loadAuthDataFromStorage]);

  const login = async (credentials: LoginPayload) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loginUser(credentials);
      const expirationDate = new Date(data.expiration);

      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));

      setAuthState({
        isAuthenticated: true,
        user: { username: data.username },
        token: data.token,
        tokenExpiration: expirationDate,
        isLoading: false,
        error: null,
      });
      navigate('/dashboard'); // Redirect after successful login
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null,
        tokenExpiration: null,
      }));
       console.error("Login error:", err);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiration: null,
      isLoading: false,
      error: null,
    });
    navigate('/login'); // Redirect to login after logout
     console.log("User logged out.");
  }, [navigate]);

   // Optional: Check token expiration periodically or on specific actions
    useEffect(() => {
        const checkTokenInterval = setInterval(() => {
            if (authState.tokenExpiration && authState.tokenExpiration <= new Date()) {
                console.log("Token expired during session, logging out.");
                logout();
            }
        }, 60 * 1000); // Check every minute

        return () => clearInterval(checkTokenInterval);
    }, [authState.tokenExpiration, logout]);


    const clearError = useCallback(() => {
      setAuthState(prev => {
          if (prev.error === null) {
              return prev;
          }
          return { ...prev, error: null };
      });
    }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, clearError }}>
      {/* Don't render children until loading check is complete */}
      {authState.isLoading ? <div>Loading Session...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};