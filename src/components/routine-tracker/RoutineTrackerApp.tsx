
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
  RefreshCcw,
  ArrowRightCircle
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import useLocalStorage from '../../hooks/useLocalStorage';
import { RoutineData, Task } from '../../types/routine';
import { toast } from 'sonner';

const RoutineTrackerApp: React.FC = () => {
  // Initial routine data structure
  const initialRoutineData: RoutineData = {
    title: 'My Habit Tracker',
    description: 'Track your daily habits and build consistency',
    timeFrame: 'daily',
    tasks: [],
    completionStatus: {},
  };

  // Use local storage to persist user data
  const [routineData, setRoutineData] = useLocalStorage<RoutineData>(
    'habitTrackerData',
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
    
    // Show toast for better feedback
    if (newCompletionStatus[dateKey][taskId]) {
      toast.success("Habit marked as complete!");
    } else {
      toast.info("Habit marked as incomplete");
    }
  };

  // Add a new task to the routine
  const addTask = (task: Task) => {
    setRoutineData({
      ...routineData,
      tasks: [...routineData.tasks, task]
    });
    toast.success("Habit added successfully!");
  };

  // Update an existing task
  const updateTask = (taskId: string, updatedTask: Task) => {
    setRoutineData({
      ...routineData,
      tasks: routineData.tasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    });
    toast.success("Habit updated successfully!");
  };

  // Remove a task from the routine
  const removeTask = (taskId: string) => {
    setRoutineData({
      ...routineData,
      tasks: routineData.tasks.filter(task => task.id !== taskId)
    });
    toast.success("Habit removed successfully!");
  };

  // Update routine metadata
  const updateRoutineData = (data: Partial<RoutineData>) => {
    setRoutineData({
      ...routineData,
      ...data
    });
    toast.success("Habit tracker updated successfully!");
  };

  // Reset all data
  const resetData = () => {
    if (confirm("Are you sure you want to reset all your habit data? This action cannot be undone.")) {
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-darkGreen to-wellness-mediumGreen bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-wellness-charcoal/70 mt-1">
            Track your habits, stay disciplined, and achieve your goals effortlessly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-wellness-mediumGreen/30 hover:bg-wellness-softGreen/20 text-wellness-darkGreen"
            onClick={resetData}
            size="sm"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-wellness-softGreen/20 p-1 rounded-xl">
          <TabsTrigger 
            value="calendar" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen rounded-lg"
          >
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen rounded-lg"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen rounded-lg"
          >
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
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
              <div className="bg-white/80 shadow-sm p-5 rounded-xl border border-wellness-softGreen/20">
                <h3 className="text-lg font-medium mb-3 text-wellness-darkGreen">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  className="mx-auto"
                  highlightToday={true}
                />
                
                {routineData.tasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-wellness-softGreen/20">
                    <Button 
                      onClick={handleExportPDF}
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 border-wellness-mediumGreen/30 text-wellness-darkGreen hover:bg-wellness-softGreen/20"
                    >
                      <Download className="h-4 w-4" />
                      Export Current Month
                    </Button>
                  </div>
                )}
                
                {routineData.tasks.length === 0 && selectedTab === 'calendar' && (
                  <div className="mt-4 pt-4 border-t border-wellness-softGreen/20">
                    <div className="text-center p-4 bg-wellness-softGreen/10 rounded-lg">
                      <p className="text-wellness-charcoal mb-2">No habits added yet</p>
                      <Button 
                        onClick={() => setSelectedTab('settings')}
                        className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
                        size="sm"
                      >
                        <ArrowRightCircle className="h-4 w-4 mr-2" />
                        Add Your First Habit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
          <RoutineBuilder 
            routineData={routineData}
            updateRoutineData={updateRoutineData}
            addTask={addTask}
            updateTask={updateTask}
            removeTask={removeTask}
            setSelectedTab={setSelectedTab}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
          <AIInsights routineData={routineData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoutineTrackerApp;
