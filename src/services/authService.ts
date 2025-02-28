
import { User, UserData } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

// Simulate API calls with localStorage for auth
const AUTH_STORAGE_KEY = 'wellness_tracker_auth';
const USER_DATA_KEY = 'wellness_tracker_user_data';

// Decode JWT token to get user info
const decodeJwt = (token: string) => {
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
};

// Mock AI API for authentication (this would be replaced with actual API calls)
export const authService = {
  // Register a new user
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
      const userExists = existingUsers.some((user: { email: string }) => user.email === email);
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }
      
      // Create a new user
      const newUser: User = {
        id: uuidv4(),
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      
      // Store user credentials (email/password) securely
      // In a real app, we would never store passwords in localStorage!
      const secureUserData = {
        ...newUser,
        password, // In a real app, this would be hashed
      };
      
      // Save to localStorage (simulating API storage)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([...existingUsers, secureUserData]));
      
      // Initialize empty user data
      this.initializeUserData(newUser.id);
      
      // Return user without password
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      // Retrieve users from storage
      const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
      
      // Find matching user
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Store current user session
      const { password: _, ...userWithoutPassword } = user;
      
      // Set session
      const sessionData = {
        user: userWithoutPassword,
        expiresAt: rememberMe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 days if remember me
      };
      
      sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
      
      // If remember me is checked, also store in localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify(sessionData));
      }
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Login with Google token (real)
  async loginWithGoogleToken(credential: string): Promise<User> {
    try {
      // Decode the Google JWT token
      const payload = decodeJwt(credential);
      
      if (!payload) {
        throw new Error('Invalid Google token');
      }
      
      const { email, name, picture, sub } = payload;
      
      if (!email) {
        throw new Error('Email not provided in Google token');
      }
      
      // Check if this Google user already exists
      const existingUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
      let existingUser = existingUsers.find((user: any) => user.email === email);
      
      // Create a new user if it doesn't exist
      if (!existingUser) {
        const googleUser: User = {
          id: uuidv4(),
          email,
          name: name || email.split('@')[0],
          avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
          createdAt: new Date().toISOString(),
          googleId: sub,
        };
        
        // Store new Google user
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([...existingUsers, googleUser]));
        this.initializeUserData(googleUser.id);
        
        existingUser = googleUser;
      } else if (!existingUser.avatar && picture) {
        // Update the user's avatar if they don't have one but Google provided one
        existingUser.avatar = picture;
        // Update the user in storage
        const updatedUsers = existingUsers.map((user: any) => 
          user.email === email ? { ...user, avatar: picture } : user
        );
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUsers));
      }
      
      // Set session
      sessionStorage.setItem('currentUser', JSON.stringify({
        user: existingUser,
        expiresAt: null,
      }));
      
      return existingUser;
    } catch (error) {
      console.error('Google token login error:', error);
      throw error;
    }
  },
  
  // Login with Google (mock)
  async loginWithGoogle(): Promise<User> {
    try {
      // This would normally be handled by a Google Auth API
      // For demo purposes, we'll create a mock Google user
      const googleUser: User = {
        id: uuidv4(),
        email: `user${Math.floor(Math.random() * 10000)}@gmail.com`,
        name: 'Google User',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random',
        createdAt: new Date().toISOString(),
      };
      
      // Check if this Google user already exists
      const existingUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
      const existingUser = existingUsers.find((user: any) => user.email === googleUser.email);
      
      if (!existingUser) {
        // Store new Google user
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([...existingUsers, googleUser]));
        this.initializeUserData(googleUser.id);
      }
      
      // Set session
      sessionStorage.setItem('currentUser', JSON.stringify({
        user: existingUser || googleUser,
        expiresAt: null,
      }));
      
      return existingUser || googleUser;
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
    sessionStorage.removeItem('currentUser');
  },
  
  // Get current user from session
  getCurrentUser(): User | null {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      
      if (!sessionData) {
        // Check if we have a remembered user
        const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser') || 'null');
        
        if (rememberedUser) {
          // Check if the remembered session is still valid
          const expiresAt = new Date(rememberedUser.expiresAt).getTime();
          if (expiresAt > Date.now()) {
            // Restore session from remembered user
            sessionStorage.setItem('currentUser', JSON.stringify(rememberedUser));
            return rememberedUser.user;
          } else {
            // Expired remember-me session
            localStorage.removeItem('rememberedUser');
            return null;
          }
        }
        return null;
      }
      
      return sessionData.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
      
      // Find and update the user
      const updatedUsers = users.map((user: any) => {
        if (user.id === userId) {
          return { ...user, ...updates };
        }
        return user;
      });
      
      // Save updated users
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      // Update current session
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        const sessionData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        sessionStorage.setItem('currentUser', JSON.stringify({
          ...sessionData,
          user: updatedUser,
        }));
        
        // Update remembered user if it exists
        const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser') || 'null');
        if (rememberedUser && rememberedUser.user.id === userId) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            ...rememberedUser,
            user: updatedUser,
          }));
        }
        
        return updatedUser;
      }
      
      throw new Error('User not found or not logged in');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get user data
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
  
  // Update user data
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
  }
};
