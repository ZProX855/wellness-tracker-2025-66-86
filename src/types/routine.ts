
// Types for the Daily Routine Tracker

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  createdAt?: string;
}

export interface CompletionStatus {
  [date: string]: {
    [taskId: string]: boolean;
  };
}

export interface RoutineData {
  title: string;
  description: string;
  timeFrame: 'daily' | 'weekly' | 'monthly';
  tasks: Task[];
  completionStatus: CompletionStatus;
}
