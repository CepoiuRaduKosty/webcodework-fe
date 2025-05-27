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
  updateUserProfilePhoto: (newPhotoUrl: string | null) => void;
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
            user: { username: parsedData.username, profilePhotoUrl: parsedData.profilePhotoUrl, id: parsedData.id },
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

      console.log(data)

      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));

      setAuthState({
        isAuthenticated: true,
        user: { username: data.username, profilePhotoUrl: data.profilePhotoUrl, id: data.id },
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

  const updateUserProfilePhoto = useCallback((newPhotoUrl: string | null) => {
    setAuthState(prev => {
        if (prev.user) {
            const updatedUser = { ...prev.user, profilePhotoUrl: newPhotoUrl };
            const currentAuthDataString = localStorage.getItem(AUTH_TOKEN_KEY);
            if (currentAuthDataString) {
                try {
                    const currentAuthData: AuthResponse = JSON.parse(currentAuthDataString);
                    const updatedAuthData = { ...currentAuthData, profilePhotoUrl: newPhotoUrl, username: updatedUser.username }; // ensure username is also up-to-date
                    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(updatedAuthData));
                } catch (e) { console.error("Failed to update auth data in localStorage", e); }
            }
            return { ...prev, user: updatedUser };
        }
        return prev;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, clearError, updateUserProfilePhoto }}>
      {/* Don't render children until loading check is complete */}
      {authState.isLoading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F9F7F7]"> {/* Palette: Page Background */}
          {/* Animated Spinner */}
          <svg
            className="animate-spin h-12 w-12 text-[#3F72AF]" // Palette: Primary Blue for spinner
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {/* Loading Text */}
          <p className="mt-4 text-lg font-medium text-[#112D4E]"> {/* Palette: Darkest Blue for text */}
            Loading Session...
          </p>
          <p className="mt-1 text-sm text-[#3F72AF]"> {/* Palette: Primary Blue for subtle text */}
            Please wait a moment.
          </p>
        </div>
      ) : (
        children
      )}
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