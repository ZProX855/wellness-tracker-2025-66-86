import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthState, User, UserData, BMIRecord } from '../types/auth';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { supabase, Database } from '../lib/supabase';

type UserDataTables = {
  bmi_history: Database['public']['Tables']['bmi_history']['Row'];
  food_comparisons: Database['public']['Tables']['food_comparisons']['Row'];
  meal_recognitions: Database['public']['Tables']['meal_recognitions']['Row'];
  sleep_data: Database['public']['Tables']['sleep_data']['Row'];
  user_profiles: Database['public']['Tables']['user_profiles']['Row'];
};

interface AuthContextType extends AuthState {
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  
  const userDataRef = useRef<UserData | null>(null);
  const subscriptionsRef = useRef<(() => void)[]>([]);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setAuthState({
          user: currentUser,
          isLoading: false,
          error: null,
        });
        
        if (currentUser) {
          await initializeUserData(currentUser.id);
        }
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const mappedUser: User = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'User',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.user_metadata?.avatar_url,
          createdAt: session.user.created_at || new Date().toISOString(),
        };
        
        setAuthState({
          user: mappedUser,
          isLoading: false,
          error: null,
        });
        
        sessionStorage.setItem('currentUser', JSON.stringify(mappedUser));
        
        await initializeUserData(mappedUser.id);
      } else if (event === 'SIGNED_OUT') {
        clearSubscriptions();
        userDataRef.current = null;
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        sessionStorage.removeItem('currentUser');
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearSubscriptions();
    };
  }, []);
  
  const clearSubscriptions = () => {
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current = [];
  };
  
  const initializeUserData = async (userId: string) => {
    try {
      const initialData = await authService.getUserData(userId);
      userDataRef.current = initialData;
      
      setupUserDataSubscriptions(userId);
      
      return initialData;
    } catch (error) {
      console.error('Error initializing user data:', error);
      return null;
    }
  };
  
  const setupUserDataSubscriptions = (userId: string) => {
    clearSubscriptions();
    
    const bmiSubscription = supabase
      .channel('bmi_history_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'bmi_history',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('BMI history changed:', payload);
          
          if (!userDataRef.current) return;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as Database['public']['Tables']['bmi_history']['Row'];
            
            const formattedItem: BMIRecord = {
              id: newItem.id,
              date: newItem.date,
              bmi: newItem.bmi,
              category: newItem.category,
              height: newItem.height || 0,
              weight: newItem.weight || 0
            };
            
            const updatedHistory = [...userDataRef.current.bmiHistory];
            const existingIndex = updatedHistory.findIndex(
              item => item.date === newItem.date
            );
            
            if (existingIndex >= 0) {
              updatedHistory[existingIndex] = formattedItem;
            } else {
              updatedHistory.push(formattedItem);
            }
            
            userDataRef.current = {
              ...userDataRef.current,
              bmiHistory: updatedHistory,
            };
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as Database['public']['Tables']['bmi_history']['Row'];
            userDataRef.current = {
              ...userDataRef.current,
              bmiHistory: userDataRef.current.bmiHistory.filter(
                item => item.date !== deletedItem.date
              ),
            };
          }
        }
      )
      .subscribe();
    
    subscriptionsRef.current.push(() => bmiSubscription.unsubscribe());
  };
  
  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.register(email, password);
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
  
  const login = async (username: string, password: string, rememberMe = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(username, password);
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
  
  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.loginWithGoogle();
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
  
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      clearSubscriptions();
      userDataRef.current = null;
      
      sessionStorage.removeItem('currentUser');
      
      const logoutPromise = authService.logout();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          console.log('Logout timed out, forcing logout state');
          reject(new Error('Logout timed out'));
        }, 3000);
      });
      
      await Promise.race([logoutPromise, timeoutPromise]);
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      
      setAuthState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
      
      toast.error('There was an issue during logout, but you have been signed out.');
    }
  };
  
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
  
  const getUserData = async (): Promise<UserData> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      if (userDataRef.current) {
        return userDataRef.current;
      }
      
      const data = await authService.getUserData(authState.user.id);
      userDataRef.current = data;
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user data';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const updateUserData = async (newData: Partial<UserData>): Promise<UserData> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      const updatedData = await authService.updateUserData(authState.user.id, newData);
      userDataRef.current = updatedData;
      return updatedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user data';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const resetUserProgress = async (): Promise<void> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }
      
      await authService.resetUserProgress(authState.user.id);
      
      userDataRef.current = {
        bmiHistory: [],
        foodComparisons: [],
        mealRecognitions: [],
        sleepData: [],
      };
      
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
