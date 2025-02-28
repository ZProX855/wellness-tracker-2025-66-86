
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthState, User, UserData } from '../types/auth';
import { authService } from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleToken: (credential: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getUserData: () => Promise<UserData>;
  updateUserData: (newData: Partial<UserData>) => Promise<UserData>;
  resetUserProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  
  // Check for existing user session on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setAuthState({
          user: currentUser,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };
    
    initializeAuth();
  }, []);
  
  // Register
  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.register(email, password, name);
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      toast.success('Account created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Login
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(email, password, rememberMe);
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      toast.success('Logged in successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Login with Google (mock - used as fallback)
  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.loginWithGoogle();
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      toast.success('Logged in with Google!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Login with Google token (real)
  const loginWithGoogleToken = async (credential: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.loginWithGoogleToken(credential);
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      toast.success('Logged in with Google!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      toast.success('Logged out successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      toast.error(errorMessage);
    }
  };
  
  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedUser = await authService.updateProfile(authState.user.id, updates);
      setAuthState({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Get user data
  const getUserData = async (): Promise<UserData> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      return await authService.getUserData(authState.user.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user data';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Update user data
  const updateUserData = async (newData: Partial<UserData>): Promise<UserData> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      const updatedData = await authService.updateUserData(authState.user.id, newData);
      return updatedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user data';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Reset user progress
  const resetUserProgress = async (): Promise<void> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      await authService.resetUserProgress(authState.user.id);
      toast.success('Progress reset successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset progress';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const contextValue: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    loginWithGoogleToken,
    register,
    logout,
    updateProfile,
    getUserData,
    updateUserData,
    resetUserProgress,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
