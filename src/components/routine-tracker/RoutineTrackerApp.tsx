
import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';
import RoutineBuilder from './RoutineBuilder';
import RoutineCalendar from './RoutineCalendar';
import AIInsights from './AIInsights';
import TimetableIntegration from './TimetableIntegration';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Settings2, 
  BarChart3, 
  Download, 
  RefreshCcw,
  ArrowRightCircle,
  Link,
  Sparkles,
  Layers
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
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
    colorTheme: 'green',
    linkedToTimetable: false
  };

  // Use local storage to persist user data
  const [routineData, setRoutineData] = useLocalStorage<RoutineData>(
    'habitTrackerData',
    initialRoutineData
  );

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState('calendar');
  const [showTimetableIntegration, setShowTimetableIntegration] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(!localStorage.getItem('habitTrackerOnboarded'));
  
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
  
  // Add multiple tasks at once (for timetable integration)
  const addMultipleTasks = (tasks: Task[]) => {
    setRoutineData({
      ...routineData,
      tasks: [...routineData.tasks, ...tasks],
      linkedToTimetable: true
    });
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
    const success = generatePDF(routineData, currentDate);
    if (success) {
      toast.success("PDF downloaded successfully!");
    } else {
      toast.error("Failed to generate PDF. Please try again.");
    }
  };
  
  // Mark onboarding as complete
  const completeOnboarding = () => {
    localStorage.setItem('habitTrackerOnboarded', 'true');
    setShowWelcomeDialog(false);
  };

  // Welcome dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
                
                <div className="mt-4 pt-4 border-t border-wellness-softGreen/20 space-y-3">
                  {routineData.tasks.length > 0 && (
                    <Button 
                      onClick={handleExportPDF}
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 border-wellness-mediumGreen/30 text-wellness-darkGreen hover:bg-wellness-softGreen/20"
                    >
                      <Download className="h-4 w-4" />
                      Export Current Month
                    </Button>
                  )}
                  
                  <Dialog open={showTimetableIntegration} onOpenChange={setShowTimetableIntegration}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full flex items-center justify-center gap-2 bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
                      >
                        <Link className="h-4 w-4" />
                        <span>Connect with Timetable</span>
                        <Sparkles className="h-3 w-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl bg-transparent border-none shadow-none p-0">
                      <TimetableIntegration 
                        onAddTasks={addMultipleTasks} 
                        onClose={() => setShowTimetableIntegration(false)} 
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {routineData.tasks.length === 0 && selectedTab === 'calendar' && (
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
                  )}
                </div>
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
      
      {/* Onboarding Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-lg bg-white p-0 overflow-hidden rounded-xl">
          <AnimatePresence>
            <motion.div
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <div className="p-6 pb-0">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <Layers className="h-14 w-14 text-wellness-darkGreen mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-wellness-darkGreen mb-2">Welcome to Habit Tracker</h2>
                  <p className="text-wellness-charcoal/70 mb-6">
                    Your ultimate tool for building better habits and achieving your goals.
                  </p>
                </motion.div>
              </div>
              
              <div className="p-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="bg-wellness-softGreen/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-wellness-softGreen/30 flex items-center justify-center text-wellness-darkGreen mr-2">
                        1
                      </div>
                      <h3 className="font-medium">Create Your Habits</h3>
                    </div>
                    <p className="text-sm text-wellness-charcoal/70">
                      Start by adding the habits you want to track. Customize priorities and schedules to fit your routine.
                    </p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                    className="bg-wellness-softGreen/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-wellness-softGreen/30 flex items-center justify-center text-wellness-darkGreen mr-2">
                        2
                      </div>
                      <h3 className="font-medium">Connect Your Timetable</h3>
                    </div>
                    <p className="text-sm text-wellness-charcoal/70">
                      Sync with your existing timetable to auto-create an optimized habit plan based on your schedule.
                    </p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                    className="bg-wellness-softGreen/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-wellness-softGreen/30 flex items-center justify-center text-wellness-darkGreen mr-2">
                        3
                      </div>
                      <h3 className="font-medium">Track Your Progress</h3>
                    </div>
                    <p className="text-sm text-wellness-charcoal/70">
                      Check off completed habits, build streaks, and watch your consistency grow day by day.
                    </p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                    className="bg-wellness-softGreen/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-wellness-softGreen/30 flex items-center justify-center text-wellness-darkGreen mr-2">
                        4
                      </div>
                      <h3 className="font-medium">Get AI Insights</h3>
                    </div>
                    <p className="text-sm text-wellness-charcoal/70">
                      Receive personalized feedback, stats, and motivation to help you stay consistent and improve.
                    </p>
                  </motion.div>
                </div>
                
                <motion.div 
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex justify-center"
                >
                  <Button 
                    onClick={completeOnboarding}
                    className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 w-full md:w-auto"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutineTrackerApp;
