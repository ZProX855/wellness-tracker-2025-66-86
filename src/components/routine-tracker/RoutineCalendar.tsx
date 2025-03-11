
import React, { useState, useEffect } from 'react';
import { 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  isToday,
  isSunday
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { RoutineData } from '../../types/routine';
import { cn } from '@/lib/utils';

interface RoutineCalendarProps {
  routineData: RoutineData;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
}

const RoutineCalendar: React.FC<RoutineCalendarProps> = ({
  routineData,
  currentDate,
  setCurrentDate,
  toggleTaskCompletion
}) => {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [monthStart, setMonthStart] = useState<Date>(startOfMonth(currentDate));

  // Update calendar days when the month changes
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    setMonthStart(start);
    
    // Generate all days in the month
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(previousMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  };

  // Check if a task is completed for a specific date
  const isTaskCompleted = (taskId: string, date: Date): boolean => {
    const dateKey = date.toISOString().split('T')[0];
    return !!routineData.completionStatus[dateKey]?.[taskId];
  };

  // Calculate completion percentage for a date
  const getCompletionPercentage = (date: Date): number => {
    if (routineData.tasks.length === 0) return 0;
    
    const dateKey = date.toISOString().split('T')[0];
    const completedCount = routineData.tasks.reduce((count, task) => {
      return count + (routineData.completionStatus[dateKey]?.[task.id] ? 1 : 0);
    }, 0);
    
    return Math.round((completedCount / routineData.tasks.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-red-600 text-white flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="text-white hover:bg-red-700 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(monthStart, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="text-white hover:bg-red-700 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        {routineData.tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No tasks created yet. Add tasks in the Settings tab.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Calendar days header */}
            <div className="grid grid-cols-7 text-center bg-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div 
                  key={day} 
                  className={cn(
                    "py-2 font-medium text-sm border-b",
                    index === 0 ? "text-red-600" : "text-gray-700"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the start of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="aspect-square p-1 border border-gray-100"></div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const completionPercentage = getCompletionPercentage(day);
                
                return (
                  <div 
                    key={day.toString()}
                    className={cn(
                      "aspect-square p-1 border border-gray-100 relative",
                      isSelected ? "bg-blue-50" : "",
                      !isCurrentMonth ? "opacity-50" : ""
                    )}
                    onClick={() => setCurrentDate(day)}
                  >
                    <div className={cn(
                      "absolute top-1 right-1 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center",
                      isSunday(day) ? "text-red-600" : "",
                      isToday(day) ? "bg-blue-100" : ""
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    {routineData.tasks.length > 0 && (
                      <div className="mt-5 space-y-1 overflow-y-auto max-h-[80%] text-xs">
                        {routineData.tasks.map(task => {
                          const completed = isTaskCompleted(task.id, day);
                          return (
                            <div 
                              key={task.id} 
                              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-0.5 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskCompletion(task.id, day);
                              }}
                            >
                              {completed ? (
                                <XCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                <div className="h-3 w-3 border border-gray-300 rounded-sm" />
                              )}
                              <span className={cn(
                                "truncate",
                                completed ? "line-through text-gray-400" : ""
                              )}>
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {completionPercentage > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"
                        title={`${completionPercentage}% completed`}
                      >
                        <div 
                          className={cn(
                            "h-full",
                            completionPercentage === 100 ? "bg-green-500" : "bg-blue-500"
                          )}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Empty cells for days after the end of the month */}
              {Array.from({ length: 6 - endOfMonth(currentDate).getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="aspect-square p-1 border border-gray-100"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isSameDay(currentDate, new Date()) && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <h3 className="font-medium text-blue-800">Today's Tasks</h3>
          <div className="mt-2 space-y-2">
            {routineData.tasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 rounded-full",
                      isTaskCompleted(task.id, currentDate) 
                        ? "text-red-500 hover:text-red-600" 
                        : "text-gray-400 hover:text-gray-500"
                    )}
                    onClick={() => toggleTaskCompletion(task.id, currentDate)}
                  >
                    {isTaskCompleted(task.id, currentDate) ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </Button>
                  <span className={cn(
                    isTaskCompleted(task.id, currentDate) ? "line-through text-gray-400" : ""
                  )}>
                    {task.title}
                  </span>
                </div>
                {task.priority && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    task.priority === "high" ? "bg-red-100 text-red-800" :
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-blue-100 text-blue-800"
                  )}>
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
            {routineData.tasks.length === 0 && (
              <p className="text-sm text-gray-500">No tasks created yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineCalendar;
