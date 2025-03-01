
import { User, UserData } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// Function to convert Supabase user to our app User type
const mapSupabaseUser = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    username: supabaseUser.user_metadata?.username || 'User',
    name: supabaseUser.user_metadata?.username || 'User',
    email: null, // Remove email dependency
    avatar: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.user_metadata?.username || 'User')}&background=random`,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
};

// Simulate API calls with localStorage for user data (while keeping auth with Supabase)
const USER_DATA_KEY = 'wellness_tracker_user_data';

// This key is used to cache the current user in sessionStorage
const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  // Register a new user
  async register(username: string, password: string): Promise<User> {
    try {
      // Generate a placeholder email based on username for Supabase (which requires email)
      // This is just a technical workaround since Supabase requires email but we don't want users to provide one
      const email = `${username.toLowerCase()}_${Date.now()}@placeholder.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
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
  async login(username: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      // Find the user's placeholder email from their username
      // In a real app, you would store username-to-email mapping in a database
      // For this demo, we'll use the same pattern as in registration
      const email = `${username.toLowerCase()}_${Date.now()}@placeholder.local`;
      
      // First attempt with current timestamp
      let authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If failed, try with a generic pattern since we don't know the timestamp used during registration
      if (authResponse.error) {
        // Try with just the username as the email prefix
        const genericEmail = `${username.toLowerCase()}@placeholder.local`;
        authResponse = await supabase.auth.signInWithPassword({
          email: genericEmail,
          password,
        });
        
        // If still failed, try with example.com domain which was used previously
        if (authResponse.error) {
          const exampleEmail = `${username.toLowerCase()}@example.com`;
          authResponse = await supabase.auth.signInWithPassword({
            email: exampleEmail,
            password,
          });
        }
      }
      
      if (authResponse.error) {
        throw new Error('Invalid username or password');
      }
      
      if (!authResponse.data.user) {
        throw new Error('Login failed');
      }
      
      const user = mapSupabaseUser(authResponse.data.user);
      
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
      const { username, avatar } = updates;
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          username,
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
};
