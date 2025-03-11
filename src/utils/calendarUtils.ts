import { RoutineData, Task, CompletionStatus } from '../types/routine';
import { startOfWeek, endOfWeek, isSameWeek, startOfMonth, endOfMonth, isSameMonth, isSameDay, isWithinInterval, format } from 'date-fns';

export const getTasksForTimeframe = (task: Task, date: Date, timeFrame: 'daily' | 'weekly' | 'monthly'): boolean => {
  const taskDate = new Date(task.createdAt || Date.now());
  
  switch (timeFrame) {
    case 'daily':
      return true; // Show task every day
    case 'weekly': {
      // If repeatDay is specified, only show on that day of week
      if (task.repeatDay && task.repeatDay !== 'any') {
        const dayMap = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 0
        };
        return date.getDay() === dayMap[task.repeatDay];
      }
      // Otherwise, show on the same day of week as when created
      return taskDate.getDay() === date.getDay();
    }
    case 'monthly': {
      // If repeatDay is specified, show on that day of week each week of the month
      if (task.repeatDay && task.repeatDay !== 'any') {
        const dayMap = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 0
        };
        return date.getDay() === dayMap[task.repeatDay];
      }
      // Otherwise, show on the same date of month as when created
      return taskDate.getDate() === date.getDate();
    }
    default:
      return true;
  }
};

export const getCompletionForDate = (
  completionStatus: CompletionStatus,
  date: Date,
  timeFrame: 'daily' | 'weekly' | 'monthly'
): { [taskId: string]: boolean } => {
  const dateStr = date.toISOString().split('T')[0];
  
  if (timeFrame === 'daily') {
    return completionStatus[dateStr] || {};
  }

  // For weekly/monthly, check if any day in that period has completion
  const entries = Object.entries(completionStatus);
  const relevantEntries = entries.filter(([dateKey]) => {
    const entryDate = new Date(dateKey);
    
    if (timeFrame === 'weekly') {
      return isSameWeek(entryDate, date);
    } else if (timeFrame === 'monthly') {
      return isSameMonth(entryDate, date);
    }
    return false;
  });

  // Merge all completions for the period
  return relevantEntries.reduce((acc, [_, value]) => ({
    ...acc,
    ...value
  }), {});
};

export const getDateInterval = (date: Date, timeFrame: 'daily' | 'weekly' | 'monthly') => {
  switch (timeFrame) {
    case 'daily':
      return { start: date, end: date };
    case 'weekly':
      return {
        start: startOfWeek(date),
        end: endOfWeek(date)
      };
    case 'monthly':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      };
  }
};

export const shouldShowTaskForDate = (
  task: Task,
  date: Date,
  timeFrame: 'daily' | 'weekly' | 'monthly'
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

export const formatTimeFrameTitle = (date: Date, timeFrame: 'daily' | 'weekly' | 'monthly'): string => {
  switch (timeFrame) {
    case 'daily':
      return "Today's Tasks";
    case 'weekly':
      return `This Week's Tasks (${format(date, 'MMM d')} - ${format(endOfWeek(date), 'MMM d')})`;
    case 'monthly':
      return `This Month's Tasks (${format(date, 'MMMM yyyy')})`;
  }
};
