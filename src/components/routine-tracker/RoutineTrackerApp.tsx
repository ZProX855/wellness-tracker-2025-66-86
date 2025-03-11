
import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';
import RoutineBuilder from './RoutineBuilder';
import RoutineCalendar from './RoutineCalendar';
import AIInsights from './AIInsights';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Settings2, 
  BarChart3, 
  Download, 
  RefreshCcw 
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import useLocalStorage from '../../hooks/useLocalStorage';
import { RoutineData, Task } from '../../types/routine';
import { toast } from 'sonner';

const RoutineTrackerApp: React.FC = () => {
  // Initial routine data structure
  const initialRoutineData: RoutineData = {
    title: 'My Daily Routine',
    description: 'Personal daily tasks and habits',
    timeFrame: 'daily',
    tasks: [],
    completionStatus: {},
  };

  // Use local storage to persist user data
  const [routineData, setRoutineData] = useLocalStorage<RoutineData>(
    'dailyRoutineTrackerData',
    initialRoutineData
  );

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState('calendar');

  // Handle task completion toggling
  const toggleTaskCompletion = (taskId: string, date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const newCompletionStatus = { ...routineData.completionStatus };
    
    if (!newCompletionStatus[dateKey]) {
      newCompletionStatus[dateKey] = {};
    }
    
    newCompletionStatus[dateKey][taskId] = !newCompletionStatus[dateKey]?.[taskId];
    
    setRoutineData({
      ...routineData,
      completionStatus: newCompletionStatus
    });
  };

  // Add a new task to the routine
  const addTask = (task: Task) => {
    setRoutineData({
      ...routineData,
      tasks: [...routineData.tasks, task]
    });
    toast.success("Task added successfully!");
  };

  // Update an existing task
  const updateTask = (taskId: string, updatedTask: Task) => {
    setRoutineData({
      ...routineData,
      tasks: routineData.tasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    });
    toast.success("Task updated successfully!");
  };

  // Remove a task from the routine
  const removeTask = (taskId: string) => {
    setRoutineData({
      ...routineData,
      tasks: routineData.tasks.filter(task => task.id !== taskId)
    });
    toast.success("Task removed successfully!");
  };

  // Update routine metadata
  const updateRoutineData = (data: Partial<RoutineData>) => {
    setRoutineData({
      ...routineData,
      ...data
    });
    toast.success("Routine updated successfully!");
  };

  // Reset all data
  const resetData = () => {
    if (confirm("Are you sure you want to reset all your routine data? This action cannot be undone.")) {
      setRoutineData(initialRoutineData);
      toast.success("All data has been reset");
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    generatePDF(routineData, currentDate);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wellness-darkGreen">Ultimate Daily Routine Tracker</h1>
          <p className="text-wellness-charcoal/70 mt-1">
            Track your habits, stay disciplined, and achieve your goals effortlessly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={resetData}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <RoutineCalendar 
                routineData={routineData}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                toggleTaskCompletion={toggleTaskCompletion}
              />
            </div>
            <div className="lg:col-span-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-3 text-wellness-darkGreen">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  className="mx-auto"
                  highlightToday={true}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <RoutineBuilder 
            routineData={routineData}
            updateRoutineData={updateRoutineData}
            addTask={addTask}
            updateTask={updateTask}
            removeTask={removeTask}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <AIInsights routineData={routineData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoutineTrackerApp;
