
// User type
export interface User {
  id: string;
  username: string;
  name: string;
  email: string | null; // Make email optional
  avatar?: string;
  createdAt: string;
}

// BMI record type
export interface BMIRecord {
  id: string;
  date: string;
  bmi: number;
  category: string;
  height: number;
  weight: number;
}

// Food comparison type
export interface FoodComparison {
  id: string;
  date: string;
  food1: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  food2: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  notes?: string;
}

// Meal recognition type
export interface MealRecognition {
  id: string;
  date: string;
  foodIdentified: string;
  imageUrl?: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

// Sleep data type
export interface SleepData {
  id: string;
  date: string;
  duration: number;
  quality: string;
  bedTime: string;
  wakeTime: string;
  factors: string[];
  notes?: string;
}

// Adding missing types referenced in Dashboard.tsx
export type MealRecord = MealRecognition;
export type SleepRecord = SleepData;

// User data type
export interface UserData {
  bmiHistory: BMIRecord[];
  foodComparisons: FoodComparison[];
  mealRecognitions: MealRecognition[];
  sleepData: SleepData[];
}

// Auth state type
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
