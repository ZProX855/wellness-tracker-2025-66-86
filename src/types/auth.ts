
// User type
export interface User {
  id: string;
  username: string;
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
  food1: string;
  food2: string;
  notes?: string;
}

// Meal recognition type
export interface MealRecognition {
  id: string;
  date: string;
  mealName: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
}

// Sleep data type
export interface SleepData {
  id: string;
  date: string;
  duration: number;
  quality: number;
  notes?: string;
}

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
