import { RoutineData, Task, CompletionStatus } from '../types/routine';
import { startOfWeek, endOfWeek, isSameWeek, startOfMonth, endOfMonth, isSameMonth, isSameDay, isWithinInterval, format } from 'date-fns';

export const getTasksForTimeframe = (task: Task, date: Date, timeFrame: 'daily' | 'weekly'): boolean => {
  const taskDate = new Date(task.createdAt || Date.now());
  
  switch (timeFrame) {
    case 'daily':
      return true; // Show task every day
    case 'weekly': {
      // If repeatDays is specified, only show on those days of week
      if (task.repeatDays && task.repeatDays.length > 0) {
        const dayMap: Record<string, number> = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 0
        };
        const currentDay = date.getDay();
        return task.repeatDays.some(day => dayMap[day] === currentDay);
      }
      // Otherwise, show on the same day of week as when created
      return taskDate.getDay() === date.getDay();
    }
    default:
      return true;
  }
};

export const getCompletionForDate = (
  completionStatus: CompletionStatus,
  date: Date,
  timeFrame: 'daily' | 'weekly'
): { [taskId: string]: boolean } => {
  const dateStr = date.toISOString().split('T')[0];
  
  if (timeFrame === 'daily') {
    return completionStatus[dateStr] || {};
  }

  // For weekly, check if any day in that period has completion
  const entries = Object.entries(completionStatus);
  const relevantEntries = entries.filter(([dateKey]) => {
    const entryDate = new Date(dateKey);
    
    if (timeFrame === 'weekly') {
      return isSameWeek(entryDate, date);
    }
    return false;
  });

  // Merge all completions for the period
  return relevantEntries.reduce((acc, [_, value]) => ({
    ...acc,
    ...value
  }), {});
};

export const getDateInterval = (date: Date, timeFrame: 'daily' | 'weekly') => {
  switch (timeFrame) {
    case 'daily':
      return { start: date, end: date };
    case 'weekly':
      return {
        start: startOfWeek(date),
        end: endOfWeek(date)
      };
  }
};

export const shouldShowTaskForDate = (
  task: Task,
  date: Date,
  timeFrame: 'daily' | 'weekly'
): boolean => {
  if (!task.createdAt) return true;
  
  const taskDate = new Date(task.createdAt);
  const interval = getDateInterval(date, timeFrame);
  
  return isWithinInterval(date, interval) && getTasksForTimeframe(task, date, timeFrame);
};

export const getDayName = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};

export const formatTimeFrameTitle = (date: Date, timeFrame: 'daily' | 'weekly'): string => {
  switch (timeFrame) {
    case 'daily':
      return format(date, "EEEE, MMMM d") + "'s Habits";
    case 'weekly':
      return `This Week's Habits (${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d')})`;
  }
};

export const getStreakInfo = (
  taskId: string,
  completionStatus: CompletionStatus
): { currentStreak: number, longestStreak: number } => {
  // Sort dates in ascending order
  const dateKeys = Object.keys(completionStatus).sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (const dateKey of dateKeys) {
    const taskCompleted = completionStatus[dateKey]?.[taskId] || false;
    
    if (taskCompleted) {
      tempStreak++;
    } else {
      tempStreak = 0;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  
  // Calculate current streak (recent consecutive completions)
  for (let i = dateKeys.length - 1; i >= 0; i--) {
    const taskCompleted = completionStatus[dateKeys[i]]?.[taskId] || false;
    
    if (taskCompleted) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return { currentStreak, longestStreak };
};

export const getCompletionRate = (
  taskId: string,
  completionStatus: CompletionStatus
): number => {
  const dateKeys = Object.keys(completionStatus);
  if (dateKeys.length === 0) return 0;
  
  let completedCount = 0;
  
  for (const dateKey of dateKeys) {
    if (completionStatus[dateKey]?.[taskId]) {
      completedCount++;
    }
  }
  
  return Math.round((completedCount / dateKeys.length) * 100);
};
