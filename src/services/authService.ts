import { User, UserData, BMIRecord, FoodComparison, MealRecord, SleepRecord } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// Function to convert Supabase user to our app User type
const mapSupabaseUser = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    username: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatar: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.user_metadata?.name || supabaseUser.email || 'User')}&background=random`,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
    googleId: supabaseUser.app_metadata?.provider === 'google' ? supabaseUser.id : undefined,
  };
};

// This key is used to cache the current user in sessionStorage
const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  // Register a new user
  async register(username: string, password: string): Promise<User> {
    try {
      // Generate a fake email since Supabase requires one
      const email = `${username.toLowerCase()}@wellness.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username,
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
      
      // Initialize user profile
      await supabase.from('user_profiles').insert({
        user_id: user.id,
        name: username,
        created_at: new Date().toISOString(),
      });
      
      // Save current user to session storage
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  async login(username: string, password: string): Promise<User> {
    try {
      // Generate the email from username
      const email = `${username.toLowerCase()}@wellness.local`;
      
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
        username: name || email.split('@')[0],
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
        username: 'Google User',
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
      
      // Also update user_profiles table
      if (name) {
        await supabase.from('user_profiles').update({
          name,
          avatar_url: avatar
        }).eq('user_id', userId);
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
  
  // Update user data
  async updateUserData(userId: string, newData: Partial<UserData>): Promise<UserData> {
    try {
      // Handle BMI history updates
      if (newData.bmiHistory) {
        for (const record of newData.bmiHistory) {
          if (!record.id) {
            // Add new record
            await this.addBMIRecord(userId, record);
          } else {
            // Update existing record
            await supabase
              .from('bmi_history')
              .update({
                height: record.height,
                weight: record.weight,
                bmi: record.bmi,
                category: record.category,
                date: record.date
              })
              .eq('id', record.id)
              .eq('user_id', userId);
          }
        }
      }
      
      // Handle food comparisons updates
      if (newData.foodComparisons) {
        for (const comparison of newData.foodComparisons) {
          if (!comparison.id) {
            // Add new comparison
            await this.addFoodComparison(userId, comparison);
          } else {
            // Update existing comparison
            await supabase
              .from('food_comparisons')
              .update({
                food1: JSON.stringify(comparison.food1),
                food2: JSON.stringify(comparison.food2),
                date: comparison.date
              })
              .eq('id', comparison.id)
              .eq('user_id', userId);
          }
        }
      }
      
      // Handle meal recognitions updates
      if (newData.mealRecognitions) {
        for (const meal of newData.mealRecognitions) {
          if (!meal.id) {
            // Add new meal
            await this.addMealRecognition(userId, meal);
          } else {
            // Update existing meal
            await supabase
              .from('meal_recognitions')
              .update({
                meal_name: meal.foodIdentified,
                calories: meal.nutritionInfo.calories,
                proteins: meal.nutritionInfo.protein,
                carbs: meal.nutritionInfo.carbs,
                fats: meal.nutritionInfo.fats,
                date: meal.date,
                image_url: meal.imageUrl
              })
              .eq('id', meal.id)
              .eq('user_id', userId);
          }
        }
      }
      
      // Handle sleep data updates
      if (newData.sleepData) {
        for (const sleep of newData.sleepData) {
          if (!sleep.id) {
            // Add new sleep record
            await this.addSleepRecord(userId, sleep);
          } else {
            // Convert quality string to number
            const qualityNumber = 
              sleep.quality === 'Restful' ? 5 : 
              sleep.quality === 'Good' ? 4 : 
              sleep.quality === 'Average' ? 3 : 
              sleep.quality === 'Light' ? 2 : 
              sleep.quality === 'Disturbed' ? 1 : 0;
            
            // Update existing sleep record
            await supabase
              .from('sleep_data')
              .update({
                duration: sleep.duration,
                quality: qualityNumber,
                date: sleep.date,
                bed_time: sleep.bedTime,
                wake_time: sleep.wakeTime,
                factors: sleep.factors,
                notes: sleep.notes
              })
              .eq('id', sleep.id)
              .eq('user_id', userId);
          }
        }
      }
      
      // Return updated user data
      return await this.getUserData(userId);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },
  
  // Get user data from Supabase
  async getUserData(userId: string): Promise<UserData> {
    try {
      // Initialize empty user data
      const userData: UserData = {
        bmiHistory: [],
        foodComparisons: [],
        mealRecognitions: [],
        sleepData: [],
      };
      
      // Fetch BMI history
      const { data: bmiData, error: bmiError } = await supabase
        .from('bmi_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (bmiError) {
        console.error('Error fetching BMI data:', bmiError);
      } else if (bmiData) {
        userData.bmiHistory = bmiData.map(item => ({
          id: item.id,
          date: item.date,
          height: item.height,
          weight: item.weight,
          bmi: item.bmi,
          category: item.category
        }));
      }
      
      // Fetch food comparisons
      const { data: foodData, error: foodError } = await supabase
        .from('food_comparisons')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (foodError) {
        console.error('Error fetching food comparison data:', foodError);
      } else if (foodData) {
        userData.foodComparisons = foodData.map(item => {
          // Parse the JSON strings into objects
          const food1 = typeof item.food1 === 'string' ? JSON.parse(item.food1) : item.food1;
          const food2 = typeof item.food2 === 'string' ? JSON.parse(item.food2) : item.food2;
          
          return {
            id: item.id,
            date: item.date,
            food1,
            food2
          };
        });
      }
      
      // Fetch meal recognitions
      const { data: mealData, error: mealError } = await supabase
        .from('meal_recognitions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (mealError) {
        console.error('Error fetching meal recognition data:', mealError);
      } else if (mealData) {
        userData.mealRecognitions = mealData.map(item => ({
          id: item.id,
          date: item.date,
          foodIdentified: item.meal_name,
          nutritionInfo: {
            calories: item.calories,
            protein: item.proteins,
            carbs: item.carbs,
            fats: item.fats,
            fiber: 0 // Default value since it's not in the database schema
          },
          imageUrl: item.image_url
        }));
      }
      
      // Fetch sleep data
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (sleepError) {
        console.error('Error fetching sleep data:', sleepError);
      } else if (sleepData) {
        userData.sleepData = sleepData.map(item => ({
          id: item.id,
          date: item.date,
          bedTime: item.bed_time,
          wakeTime: item.wake_time,
          duration: item.duration,
          quality: item.quality === 5 ? 'Restful' : 
                  item.quality === 4 ? 'Good' : 
                  item.quality === 3 ? 'Average' : 
                  item.quality === 2 ? 'Light' : 
                  item.quality === 1 ? 'Disturbed' : 'Poor',
          factors: item.factors || [],
          notes: item.notes
        }));
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },
  
  // Add BMI record
  async addBMIRecord(userId: string, data: Omit<BMIRecord, 'id'>): Promise<BMIRecord> {
    try {
      const { data: insertData, error } = await supabase
        .from('bmi_history')
        .insert({
          user_id: userId,
          height: data.height,
          weight: data.weight,
          bmi: data.bmi,
          category: data.category,
          date: data.date
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to add BMI record: ${error.message}`);
      }
      
      return {
        id: insertData.id,
        date: insertData.date,
        height: insertData.height,
        weight: insertData.weight,
        bmi: insertData.bmi,
        category: insertData.category
      };
    } catch (error) {
      console.error('Error adding BMI record:', error);
      throw error;
    }
  },
  
  // Add food comparison
  async addFoodComparison(userId: string, data: Omit<FoodComparison, 'id'>): Promise<FoodComparison> {
    try {
      const { data: insertData, error } = await supabase
        .from('food_comparisons')
        .insert({
          user_id: userId,
          food1: JSON.stringify(data.food1),
          food2: JSON.stringify(data.food2),
          date: data.date
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to add food comparison: ${error.message}`);
      }
      
      return {
        id: insertData.id,
        date: insertData.date,
        food1: typeof insertData.food1 === 'string' ? JSON.parse(insertData.food1) : insertData.food1,
        food2: typeof insertData.food2 === 'string' ? JSON.parse(insertData.food2) : insertData.food2
      };
    } catch (error) {
      console.error('Error adding food comparison:', error);
      throw error;
    }
  },
  
  // Add meal recognition
  async addMealRecognition(userId: string, data: Omit<MealRecord, 'id'>): Promise<MealRecord> {
    try {
      const { data: insertData, error } = await supabase
        .from('meal_recognitions')
        .insert({
          user_id: userId,
          meal_name: data.foodIdentified,
          calories: data.nutritionInfo.calories,
          proteins: data.nutritionInfo.protein,
          carbs: data.nutritionInfo.carbs,
          fats: data.nutritionInfo.fats,
          date: data.date,
          image_url: data.imageUrl
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to add meal recognition: ${error.message}`);
      }
      
      return {
        id: insertData.id,
        date: insertData.date,
        foodIdentified: insertData.meal_name,
        nutritionInfo: {
          calories: insertData.calories,
          protein: insertData.proteins,
          carbs: insertData.carbs,
          fats: insertData.fats,
          fiber: 0 // Default value
        },
        imageUrl: insertData.image_url
      };
    } catch (error) {
      console.error('Error adding meal recognition:', error);
      throw error;
    }
  },
  
  // Add sleep record
  async addSleepRecord(userId: string, data: Omit<SleepRecord, 'id'>): Promise<SleepRecord> {
    try {
      // Convert quality string to number
      const qualityNumber = 
        data.quality === 'Restful' ? 5 : 
        data.quality === 'Good' ? 4 : 
        data.quality === 'Average' ? 3 : 
        data.quality === 'Light' ? 2 : 
        data.quality === 'Disturbed' ? 1 : 0;
      
      const { data: insertData, error } = await supabase
        .from('sleep_data')
        .insert({
          user_id: userId,
          duration: data.duration,
          quality: qualityNumber,
          date: data.date,
          bed_time: data.bedTime,
          wake_time: data.wakeTime,
          factors: data.factors,
          notes: data.notes
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to add sleep record: ${error.message}`);
      }
      
      return {
        id: insertData.id,
        date: insertData.date,
        bedTime: insertData.bed_time,
        wakeTime: insertData.wake_time,
        duration: insertData.duration,
        quality: insertData.quality === 5 ? 'Restful' : 
                insertData.quality === 4 ? 'Good' : 
                insertData.quality === 3 ? 'Average' : 
                insertData.quality === 2 ? 'Light' : 
                insertData.quality === 1 ? 'Disturbed' : 'Poor',
        factors: insertData.factors || [],
        notes: insertData.notes
      };
    } catch (error) {
      console.error('Error adding sleep record:', error);
      throw error;
    }
  },
  
  // Reset user progress
  async resetUserProgress(userId: string): Promise<void> {
    try {
      // Delete all user data from each table
      const promises = [
        supabase.from('bmi_history').delete().eq('user_id', userId),
        supabase.from('food_comparisons').delete().eq('user_id', userId),
        supabase.from('meal_recognitions').delete().eq('user_id', userId),
        supabase.from('sleep_data').delete().eq('user_id', userId)
      ];
      
      await Promise.all(promises);
      
      console.log('User progress reset successfully');
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
