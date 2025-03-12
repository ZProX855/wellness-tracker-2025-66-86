
import { TimetableData, TimetableEvent, HabitSuggestion, Task } from '../types/routine';
import { v4 as uuidv4 } from 'uuid';

// AI-like suggestions based on timetable events
const suggestHabitsFromEvent = (event: TimetableEvent): HabitSuggestion[] => {
  const suggestions: HabitSuggestion[] = [];
  
  // Basic habit mapping - in a real app, this would use more sophisticated AI
  if (event.title.toLowerCase().includes('class') || 
      event.title.toLowerCase().includes('lecture') || 
      event.title.toLowerCase().includes('study')) {
    
    // Study-related habit
    suggestions.push({
      title: `Review notes from ${event.title}`,
      description: `Quick 15-minute review of material from ${event.title}`,
      priority: 'high',
      timeOfDay: 'evening',
      repeatDays: [event.day],
      fromTimetable: true,
      timetableEventId: event.id,
      colorTheme: event.color
    });
  }
  
  if (event.title.toLowerCase().includes('gym') || 
      event.title.toLowerCase().includes('workout') || 
      event.title.toLowerCase().includes('exercise')) {
    
    // Fitness-related follow-up
    suggestions.push({
      title: `Stretch after ${event.title}`,
      description: 'Do 10 minutes of stretching for recovery',
      priority: 'medium',
      timeOfDay: 'evening',
      repeatDays: [event.day],
      fromTimetable: true,
      timetableEventId: event.id,
      colorTheme: event.color
    });
  }
  
  // For all events, suggest preparation habit
  suggestions.push({
    title: `Prepare for ${event.title}`,
    description: `Gather materials and mentally prepare for ${event.title}`,
    priority: 'medium',
    timeOfDay: 'morning',
    repeatDays: [event.day],
    fromTimetable: true,
    timetableEventId: event.id,
    colorTheme: event.color
  });
  
  return suggestions;
};

// Convert timetable events to suggested habits
export const generateHabitsFromTimetable = (timetableData: TimetableData): HabitSuggestion[] => {
  if (!timetableData || !timetableData.events || timetableData.events.length === 0) {
    return [];
  }
  
  // Analyze timetable and suggest habits
  let suggestions: HabitSuggestion[] = [];
  
  // Generate suggestions from individual events
  timetableData.events.forEach(event => {
    const eventSuggestions = suggestHabitsFromEvent(event);
    suggestions = [...suggestions, ...eventSuggestions];
  });
  
  // Add general habits based on schedule patterns (morning, evening routines)
  const hasMorningEvents = timetableData.events.some(
    event => {
      const startHour = new Date(event.startTime).getHours();
      return startHour < 12;
    }
  );
  
  const hasEveningEvents = timetableData.events.some(
    event => {
      const endHour = new Date(event.endTime).getHours();
      return endHour > 17;
    }
  );
  
  if (hasMorningEvents) {
    suggestions.push({
      title: 'Morning preparation',
      description: 'Prepare for the day by reviewing your schedule',
      priority: 'high',
      timeOfDay: 'morning',
      repeatDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      fromTimetable: true
    });
  }
  
  if (hasEveningEvents) {
    suggestions.push({
      title: 'Evening reflection',
      description: 'Reflect on your day and prepare for tomorrow',
      priority: 'medium',
      timeOfDay: 'evening',
      repeatDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      fromTimetable: true
    });
  }
  
  // Remove duplicate suggestions
  const uniqueSuggestions = suggestions.reduce((acc: HabitSuggestion[], current) => {
    const exists = acc.some(item => item.title === current.title && 
                                 item.timeOfDay === current.timeOfDay &&
                                 JSON.stringify(item.repeatDays) === JSON.stringify(current.repeatDays));
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  return uniqueSuggestions;
};

// Convert HabitSuggestion to Task objects
export const convertSuggestionsToTasks = (suggestions: HabitSuggestion[]): Task[] => {
  return suggestions.map(suggestion => ({
    id: uuidv4(),
    title: suggestion.title,
    description: suggestion.description,
    priority: suggestion.priority,
    timeOfDay: suggestion.timeOfDay,
    repeatDays: suggestion.repeatDays,
    createdAt: new Date().toISOString(),
    fromTimetable: suggestion.fromTimetable,
    timetableEventId: suggestion.timetableEventId,
    suggestedByAI: true,
    colorTheme: suggestion.colorTheme,
    streak: 0
  }));
};

// Fetch saved timetables from local storage (in a real app, this would come from an API)
export const getSavedTimetables = (): TimetableData[] => {
  try {
    const savedTimetables = localStorage.getItem('savedTimetables');
    if (savedTimetables) {
      return JSON.parse(savedTimetables);
    }
  } catch (error) {
    console.error('Error fetching saved timetables:', error);
  }
  
  // Return mock data if no saved timetables are found
  return [
    {
      id: 'mock-timetable-1',
      title: 'My Weekly Schedule',
      description: 'Regular weekly schedule',
      events: [
        {
          id: 'event-1',
          title: 'Morning Workout',
          description: 'Gym training session',
          startTime: '2023-09-01T07:00:00',
          endTime: '2023-09-01T08:00:00',
          day: 'monday',
          category: 'fitness',
          color: '#f97316'
        },
        {
          id: 'event-2',
          title: 'Study Session',
          description: 'Focus on project work',
          startTime: '2023-09-01T10:00:00',
          endTime: '2023-09-01T12:00:00',
          day: 'wednesday',
          category: 'education',
          color: '#0ea5e9'
        },
        {
          id: 'event-3',
          title: 'Evening Yoga',
          description: 'Relaxation and stretching',
          startTime: '2023-09-01T18:00:00',
          endTime: '2023-09-01T19:00:00',
          day: 'friday',
          category: 'fitness',
          color: '#8b5cf6'
        }
      ],
      createdAt: '2023-09-01T00:00:00'
    }
  ];
};
