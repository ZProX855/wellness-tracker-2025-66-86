
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
  // Timetable integration fields
  fromTimetable?: boolean;
  timetableEventId?: string;
  suggestedByAI?: boolean;
  colorTheme?: string;
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
  // Theme and UI preferences
  colorTheme?: string;
  linkedToTimetable?: boolean;
  timetableId?: string;
}

export interface HabitStat {
  taskId: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

// Interface for Timetable data integration
export interface TimetableEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  category?: string;
  color?: string;
}

export interface TimetableData {
  id: string;
  title: string;
  description?: string;
  events: TimetableEvent[];
  createdAt: string;
}

// Habit suggestion from timetable
export interface HabitSuggestion {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  repeatDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  fromTimetable: boolean;
  timetableEventId?: string;
  colorTheme?: string;
}
