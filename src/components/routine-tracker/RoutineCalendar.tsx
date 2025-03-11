
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
import { shouldShowTaskForDate, getCompletionForDate, formatTimeFrameTitle } from '../../utils/calendarUtils';

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

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    setMonthStart(start);
    
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  };

  const isTaskCompleted = (taskId: string, date: Date): boolean => {
    const completions = getCompletionForDate(routineData.completionStatus, date, routineData.timeFrame);
    return !!completions[taskId];
  };

  const getCompletionPercentage = (date: Date): number => {
    const relevantTasks = routineData.tasks.filter(task => 
      shouldShowTaskForDate(task, date, routineData.timeFrame)
    );
    
    if (relevantTasks.length === 0) return 0;
    
    const completions = getCompletionForDate(routineData.completionStatus, date, routineData.timeFrame);
    const completedCount = relevantTasks.reduce((count, task) => {
      return count + (completions[task.id] ? 1 : 0);
    }, 0);
    
    return Math.round((completedCount / relevantTasks.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-wellness-softGreen/30 transition-all duration-300 hover:shadow-md">
      <div className="p-4 bg-gradient-to-r from-wellness-darkGreen to-wellness-mediumGreen text-white flex justify-between items-center rounded-t-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="text-white hover:bg-white/10 hover:text-white transition-colors duration-200"
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
          className="text-white hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        {routineData.tasks.length === 0 ? (
          <div className="text-center py-10 px-4">
            <CalendarIcon className="mx-auto h-12 w-12 text-wellness-mediumGreen/30 mb-3" />
            <p className="text-wellness-charcoal/70 mb-2">No tasks created yet.</p>
            <p className="text-sm text-wellness-charcoal/50">Add tasks in the Settings tab to get started with your routine tracking.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden border-wellness-softGreen/30">
            <div className="grid grid-cols-7 text-center bg-wellness-softGreen/20">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div 
                  key={day} 
                  className={cn(
                    "py-2 font-medium text-sm border-b border-wellness-softGreen/30",
                    index === 0 ? "text-wellness-darkGreen/70" : "text-wellness-charcoal/80"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="aspect-square p-1 border border-wellness-softGreen/10 bg-wellness-softGreen/5"></div>
              ))}

              {calendarDays.map((day) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const completionPercentage = getCompletionPercentage(day);
                const relevantTasks = routineData.tasks.filter(task => 
                  shouldShowTaskForDate(task, day, routineData.timeFrame)
                );
                
                return (
                  <div 
                    key={day.toString()}
                    className={cn(
                      "aspect-square p-1 border border-wellness-softGreen/20 relative transition-all duration-200",
                      isSelected ? "bg-wellness-softGreen/30" : "",
                      !isCurrentMonth ? "opacity-50" : "",
                      "hover:bg-wellness-softGreen/10 cursor-pointer"
                    )}
                    onClick={() => setCurrentDate(day)}
                  >
                    <div className={cn(
                      "absolute top-1 right-1 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center",
                      isSunday(day) ? "text-wellness-darkGreen" : "",
                      isToday(day) ? "bg-wellness-mediumGreen text-white" : ""
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    {relevantTasks.length > 0 && (
                      <div className="mt-5 space-y-1 overflow-y-auto max-h-[80%] text-xs">
                        {relevantTasks.map(task => {
                          const completed = isTaskCompleted(task.id, day);
                          return (
                            <div 
                              key={task.id} 
                              className="flex items-center gap-1 cursor-pointer hover:bg-wellness-softGreen/20 p-0.5 rounded transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskCompletion(task.id, day);
                              }}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-3 w-3 text-wellness-darkGreen" />
                              ) : (
                                <div className="h-3 w-3 border border-wellness-mediumGreen/50 rounded-sm" />
                              )}
                              <span className={cn(
                                "truncate",
                                completed ? "line-through text-wellness-charcoal/40" : "text-wellness-charcoal/80"
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
                        className="absolute bottom-0 left-0 right-0 h-1 bg-wellness-softGreen/30"
                        title={`${completionPercentage}% completed`}
                      >
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            completionPercentage === 100 ? "bg-wellness-darkGreen" : "bg-wellness-mediumGreen"
                          )}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {Array.from({ length: 6 - endOfMonth(currentDate).getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="aspect-square p-1 border border-wellness-softGreen/10 bg-wellness-softGreen/5"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isSameDay(currentDate, new Date()) && (
        <div className="p-4 bg-wellness-softGreen/20 border-t border-wellness-softGreen/30">
          <h3 className="font-medium text-wellness-darkGreen mb-2">
            {formatTimeFrameTitle(currentDate, routineData.timeFrame)}
          </h3>
          <div className="mt-2 space-y-2">
            {routineData.tasks
              .filter(task => shouldShowTaskForDate(task, currentDate, routineData.timeFrame))
              .map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-wellness-softGreen/30 transition-all duration-200 hover:border-wellness-softGreen/60 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full",
                        isTaskCompleted(task.id, currentDate) 
                          ? "text-wellness-darkGreen hover:text-wellness-darkGreen/80" 
                          : "text-wellness-charcoal/30 hover:text-wellness-charcoal/50"
                      )}
                      onClick={() => toggleTaskCompletion(task.id, currentDate)}
                    >
                      {isTaskCompleted(task.id, currentDate) ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-wellness-charcoal/30" />
                      )}
                    </Button>
                    <span className={cn(
                      isTaskCompleted(task.id, currentDate) ? "line-through text-wellness-charcoal/40" : "text-wellness-charcoal"
                    )}>
                      {task.title}
                    </span>
                  </div>
                  {task.repeatDay && task.repeatDay !== 'any' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-wellness-softGreen/20 text-wellness-darkGreen/70 mr-2">
                      {task.repeatDay.charAt(0).toUpperCase() + task.repeatDay.slice(1)}
                    </span>
                  )}
                  {task.priority && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      task.priority === "high" ? "bg-wellness-darkGreen/10 text-wellness-darkGreen" :
                      task.priority === "medium" ? "bg-wellness-mediumGreen/10 text-wellness-mediumGreen" :
                      "bg-wellness-softGreen/30 text-wellness-darkGreen/70"
                    )}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineCalendar;
