
// Types for the Habit Tracker

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  createdAt?: string;
  // Day selection for weekly habits
  repeatDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  streak?: number;
}

export interface CompletionStatus {
  [date: string]: {
    [taskId: string]: boolean;
  };
}

export interface RoutineData {
  title: string;
  description: string;
  timeFrame: 'daily' | 'weekly';
  tasks: Task[];
  completionStatus: CompletionStatus;
}

export interface HabitStat {
  taskId: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}
