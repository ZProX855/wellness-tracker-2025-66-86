import { User, UserData } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// Function to convert Supabase user to our app User type
const mapSupabaseUser = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatar: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.user_metadata?.name || supabaseUser.email || 'User')}&background=random`,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
    googleId: supabaseUser.app_metadata?.provider === 'google' ? supabaseUser.id : undefined,
  };
};

// Simulate API calls with localStorage for user data (while keeping auth with Supabase)
const USER_DATA_KEY = 'wellness_tracker_user_data';

// This key is used to cache the current user in sessionStorage
const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  // Register a new user
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.user) {
        throw new Error('Registration failed');
      }
      
      const user = mapSupabaseUser(data.user);
      
      if (!user) {
        throw new Error('Failed to create user');
      }
      
      // Initialize empty user data
      this.initializeUserData(user.id);
      
      // Save current user to session storage
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.user) {
        throw new Error('Login failed');
      }
      
      const user = mapSupabaseUser(data.user);
      
      if (!user) {
        throw new Error('Failed to get user data');
      }
      
      // Save to session storage
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Login with Google token
  async loginWithGoogleToken(credential: string): Promise<User> {
    try {
      // Supabase's signInWithIdToken requires a provider and a token
      // For Google OAuth with JavaScript client, we need to use the ID token
      // However, Supabase doesn't directly support this flow with the credential from Google's JavaScript client
      // As a workaround, we'll use signInWithOAuth to redirect to Google
      
      // For our mock implementation, we'll parse the credential and create a user
      const payload = this.decodeJwt(credential);
      
      if (!payload) {
        throw new Error('Invalid Google token');
      }
      
      const { email, name, picture, sub } = payload;
      
      if (!email) {
        throw new Error('Email not provided in Google token');
      }
      
      // Try to sign in with Google OAuth using Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      // Since this will redirect, we wouldn't normally reach this point
      // But in case we do (or for testing), we'll create a mock user
      
      const googleUser: User = {
        id: sub || uuidv4(),
        email,
        name: name || email.split('@')[0],
        avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
        createdAt: new Date().toISOString(),
        googleId: sub,
      };
      
      // Save to session storage
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
      
      return googleUser;
    } catch (error) {
      console.error('Google token login error:', error);
      throw error;
    }
  },
  
  // Login with Google (mock)
  async loginWithGoogle(): Promise<User> {
    try {
      // Redirect to Google sign in
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Since this redirects, we'll never reach this point normally
      // But we'll include this mock for testing or in case the redirect doesn't happen
      
      const googleUser: User = {
        id: uuidv4(),
        email: `user${Math.floor(Math.random() * 10000)}@gmail.com`,
        name: 'Google User',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random',
        createdAt: new Date().toISOString(),
      };
      
      // Save to session storage
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
      
      return googleUser;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
  // Initialize empty user data for new users
  initializeUserData(userId: string): void {
    const emptyUserData: UserData = {
      bmiHistory: [],
      foodComparisons: [],
      mealRecognitions: [],
      sleepData: [],
    };
    
    // Get existing user data store
    const allUserData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
    
    // Add empty data for new user
    allUserData[userId] = emptyUserData;
    
    // Save back to storage
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(allUserData));
  },
  
  // Logout current user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      sessionStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // First check session storage for cached user
      const cachedUser = sessionStorage.getItem(CURRENT_USER_KEY);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
      
      // If no cached user, check with Supabase
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return null;
      }
      
      const user = mapSupabaseUser(data.user);
      
      if (user) {
        // Cache the user in session storage
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Only update allowed fields
      const { name, avatar } = updates;
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name,
          avatar_url: avatar,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.user) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = mapSupabaseUser(data.user);
      
      if (!updatedUser) {
        throw new Error('Failed to get updated user data');
      }
      
      // Update cached user
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get user data (still using localStorage for simplicity)
  async getUserData(userId: string): Promise<UserData> {
    try {
      // Get all user data
      const allUserData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
      
      // Return this user's data or initialize if it doesn't exist
      if (!allUserData[userId]) {
        this.initializeUserData(userId);
        return {
          bmiHistory: [],
          foodComparisons: [],
          mealRecognitions: [],
          sleepData: [],
        };
      }
      
      return allUserData[userId];
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },
  
  // Update user data (still using localStorage for simplicity)
  async updateUserData(userId: string, newData: Partial<UserData>): Promise<UserData> {
    try {
      // Get all user data
      const allUserData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
      
      // Get current user data or initialize
      const currentUserData = allUserData[userId] || {
        bmiHistory: [],
        foodComparisons: [],
        mealRecognitions: [],
        sleepData: [],
      };
      
      // Update with new data
      const updatedUserData = {
        ...currentUserData,
        ...newData,
      };
      
      // Save back to storage
      allUserData[userId] = updatedUserData;
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(allUserData));
      
      return updatedUserData;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },
  
  // Reset user progress
  async resetUserProgress(userId: string): Promise<void> {
    try {
      // Initialize empty user data
      this.initializeUserData(userId);
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw error;
    }
  },
  
  // Helper function to decode JWT token
  decodeJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
      return null;
    }
  }
};
