import { User, UserData, BMIRecord, FoodComparison, MealRecord, SleepRecord } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

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

const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  async register(email: string, password: string): Promise<User> {
    try {
      if (!email.includes('@')) {
        email = `${email.toLowerCase()}@wellness.local`;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0],
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
      
      await supabase.from('user_profiles').insert({
        user_id: user.id,
        name: user.name,
        created_at: new Date().toISOString(),
      });
      
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  async login(username: string, password: string): Promise<User> {
    try {
      let email = username;
      if (!email.includes('@')) {
        email = `${email.toLowerCase()}@wellness.local`;
      }
      
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
      
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // This will redirect to Google's OAuth page
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
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
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const cachedUser = sessionStorage.getItem(CURRENT_USER_KEY);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return null;
      }
      
      const user = mapSupabaseUser(data.user);
      
      if (user) {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
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
      
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  async getUserData(userId: string): Promise<UserData> {
    try {
      const userData: UserData = {
        bmiHistory: [],
        foodComparisons: [],
        mealRecognitions: [],
        sleepData: [],
      };
      
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
      
      const { data: foodData, error: foodError } = await supabase
        .from('food_comparisons')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (foodError) {
        console.error('Error fetching food comparison data:', foodError);
      } else if (foodData) {
        userData.foodComparisons = foodData.map(item => {
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
            fiber: 0
          },
          imageUrl: item.image_url
        }));
      }
      
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
  
  async updateUserData(userId: string, newData: Partial<UserData>): Promise<UserData> {
    try {
      if (newData.bmiHistory) {
        for (const record of newData.bmiHistory) {
          if (!record.id) {
            await this.addBMIRecord(userId, record);
          } else {
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
      
      if (newData.foodComparisons) {
        for (const comparison of newData.foodComparisons) {
          if (!comparison.id) {
            await this.addFoodComparison(userId, comparison);
          } else {
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
      
      if (newData.mealRecognitions) {
        for (const meal of newData.mealRecognitions) {
          if (!meal.id) {
            await this.addMealRecognition(userId, meal);
          } else {
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
      
      if (newData.sleepData) {
        for (const sleep of newData.sleepData) {
          if (!sleep.id) {
            await this.addSleepRecord(userId, sleep);
          } else {
            const qualityNumber = 
              sleep.quality === 'Restful' ? 5 : 
              sleep.quality === 'Good' ? 4 : 
              sleep.quality === 'Average' ? 3 : 
              sleep.quality === 'Light' ? 2 : 
              sleep.quality === 'Disturbed' ? 1 : 0;
            
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
      
      return await this.getUserData(userId);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },
  
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
          fiber: 0
        },
        imageUrl: insertData.image_url
      };
    } catch (error) {
      console.error('Error adding meal recognition:', error);
      throw error;
    }
  },
  
  async addSleepRecord(userId: string, data: Omit<SleepRecord, 'id'>): Promise<SleepRecord> {
    try {
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
  
  async resetUserProgress(userId: string): Promise<void> {
    try {
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
