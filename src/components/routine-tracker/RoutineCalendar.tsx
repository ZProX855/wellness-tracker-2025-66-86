
import React from 'react';
import { motion } from 'framer-motion';
import { formatTimeFrameTitle, shouldShowTaskForDate, getCompletionForDate } from '../../utils/calendarUtils';
import TransparentCheckbox from '../ui/transparent-checkbox';
import { RoutineData } from '../../types/routine';

interface RoutineCalendarProps {
  routineData: RoutineData;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
}

const RoutineCalendar: React.FC<RoutineCalendarProps> = ({
  routineData,
  currentDate,
  toggleTaskCompletion
}) => {
  const completion = getCompletionForDate(
    routineData.completionStatus,
    currentDate,
    routineData.timeFrame
  );

  const tasksForDate = routineData.tasks.filter(task =>
    shouldShowTaskForDate(task, currentDate, routineData.timeFrame)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-wellness-softGreen/20 p-6"
    >
      <h2 className="text-2xl font-bold text-wellness-darkGreen mb-6">
        {formatTimeFrameTitle(currentDate, routineData.timeFrame)}
      </h2>

      <div className="space-y-4">
        {tasksForDate.length === 0 ? (
          <div className="text-center py-8 text-wellness-charcoal/70">
            No habits scheduled for this day
          </div>
        ) : (
          tasksForDate.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-4 rounded-lg bg-wellness-softGreen/5 border border-wellness-softGreen/10 hover:bg-wellness-softGreen/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <TransparentCheckbox
                  checked={completion[task.id] || false}
                  onChange={() => toggleTaskCompletion(task.id, currentDate)}
                  size="lg"
                />
                <div className="space-y-1">
                  <h3 className="font-medium text-wellness-charcoal">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-wellness-charcoal/70">{task.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RoutineCalendar;
