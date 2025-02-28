
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences?: UserPreferences;
  googleId?: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserData {
  bmiHistory: BMIRecord[];
  foodComparisons: FoodComparison[];
  mealRecognitions: MealRecord[];
  sleepData: SleepRecord[];
}

export interface BMIRecord {
  id: string;
  date: string;
  height: number;
  weight: number;
  bmi: number;
  category: string;
}

export interface FoodComparison {
  id: string;
  date: string;
  food1: {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    fiber: number;
  };
  food2: {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    fiber: number;
  };
}

export interface MealRecord {
  id: string;
  date: string;
  foodIdentified: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  imageUrl?: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: 'Restful' | 'Good' | 'Average' | 'Light' | 'Disturbed' | 'Poor';
  factors: string[];
  notes?: string;
}
