
/**
 * Utility functions for timetable functionality
 */

/**
 * Parses a timetable schedule object to get the number of activities
 */
export const getActivityCount = (schedule: any): number => {
  if (!schedule) return 0;
  return Object.keys(schedule).length;
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Create a fallback timetable when data can't be loaded
 */
export const createFallbackTimetable = () => {
  return [
    { time: '7:00 AM', activity: 'Wake up and morning routine', category: 'routine' },
    { time: '7:30 AM', activity: 'Breakfast', category: 'meal' },
    { time: '8:30 AM', activity: 'Work/Study session 1', category: 'work' },
    { time: '10:30 AM', activity: 'Short break', category: 'rest' },
    { time: '10:45 AM', activity: 'Work/Study session 2', category: 'work' },
    { time: '12:30 PM', activity: 'Lunch', category: 'meal' },
    { time: '1:30 PM', activity: 'Exercise', category: 'exercise' }
  ];
};
