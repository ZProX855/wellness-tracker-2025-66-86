
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent
} from '../ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Award, 
  Clock, 
  Lightbulb,
  CheckCircle,
  BookOpen,
  Heart
} from 'lucide-react';
import { RoutineData } from '../../types/routine';
import { addDays, format, startOfWeek, isWithinInterval, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface AIInsightsProps {
  routineData: RoutineData;
}

const AIInsights: React.FC<AIInsightsProps> = ({ routineData }) => {
  // Calculate overall consistency percentage
  const overallConsistency = useMemo(() => {
    const allDates = Object.keys(routineData.completionStatus);
    if (allDates.length === 0 || routineData.tasks.length === 0) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    allDates.forEach(dateKey => {
      const taskCompletions = routineData.completionStatus[dateKey];
      if (taskCompletions) {
        Object.keys(taskCompletions).forEach(taskId => {
          totalTasks++;
          if (taskCompletions[taskId]) {
            completedTasks++;
          }
        });
      }
    });
    
    return Math.round((completedTasks / totalTasks) * 100);
  }, [routineData]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (routineData.tasks.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    let currentDate = today;
    
    while (true) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const taskCompletions = routineData.completionStatus[dateKey];
      
      if (!taskCompletions) break;
      
      const completedCount = Object.values(taskCompletions).filter(Boolean).length;
      if (completedCount === 0) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  }, [routineData]);

  // Generate weekly completion data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const startWeek = startOfWeek(today);
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startWeek, i);
      const dateKey = day.toISOString().split('T')[0];
      const taskCompletions = routineData.completionStatus[dateKey] || {};
      
      const completedCount = Object.values(taskCompletions).filter(Boolean).length;
      const totalTasks = routineData.tasks.length;
      const percentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      
      data.push({
        day: format(day, 'EEE'),
        completion: percentage,
      });
    }
    
    return data;
  }, [routineData]);

  // Generate task completion distribution
  const taskCompletionData = useMemo(() => {
    const tasks = routineData.tasks;
    if (tasks.length === 0) return [];
    
    const completionCounts = tasks.map(task => {
      let completeCount = 0;
      let totalDaysShown = 0;
      
      Object.keys(routineData.completionStatus).forEach(dateKey => {
        const date = new Date(dateKey);
        if (shouldShowTask(task, date)) {
          totalDaysShown++;
          if (routineData.completionStatus[dateKey]?.[task.id]) {
            completeCount++;
          }
        }
      });
      
      const completionRate = totalDaysShown === 0 ? 0 : Math.round((completeCount / totalDaysShown) * 100);
      
      return {
        name: task.title,
        value: completionRate,
      };
    });
    
    return completionCounts;
  }, [routineData]);
  
  // Helper to check if task should be shown on date
  const shouldShowTask = (task: any, date: Date) => {
    if (!task.createdAt) return true;
    const taskDate = new Date(task.createdAt);
    
    if (routineData.timeFrame === 'daily') return true;
    
    if (routineData.timeFrame === 'weekly') {
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
        return date.getDay() === dayMap[task.repeatDay as keyof typeof dayMap];
      }
      return taskDate.getDay() === date.getDay();
    }
    
    if (routineData.timeFrame === 'monthly') {
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
        return date.getDay() === dayMap[task.repeatDay as keyof typeof dayMap];
      }
      return taskDate.getDate() === date.getDate();
    }
    
    return true;
  };

  // Generate motivational tips
  const motivationalTips = [
    "Start small and build momentum. Even completing one task is progress!",
    "Try the 2-minute rule: If a task takes less than 2 minutes, do it now.",
    "Consistency beats perfection. It's better to do a little every day than a lot occasionally.",
    "Celebrate your wins, no matter how small. Every completion builds your confidence.",
    "Having trouble with a task? Break it down into smaller, more manageable steps.",
    "Morning routines set the tone for your entire day. Try completing important tasks early.",
    "Use visual cues around your home/workspace to remind you of your habits.",
    "Share your goals with others - accountability can boost your consistency."
  ];
  
  // Select 3 random tips
  const randomTips = useMemo(() => {
    const shuffled = [...motivationalTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);
  
  // Colors for pie chart
  const COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-wellness-softGreen/30 to-wellness-softGreen/5 border-wellness-softGreen/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-wellness-darkGreen">Overall Consistency</CardTitle>
              <TrendingUp className="h-5 w-5 text-wellness-darkGreen/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-wellness-darkGreen">{overallConsistency}%</div>
              <div className="text-sm text-wellness-darkGreen/70">complete</div>
            </div>
            <Progress value={overallConsistency} className="h-2 mt-3" />
            <p className="text-xs mt-2 text-wellness-charcoal/70">
              {overallConsistency < 30 ? "You're just getting started!" : 
               overallConsistency < 70 ? "Good progress! Keep going!" : 
               "Excellent work! You're crushing it!"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-wellness-softGreen/30 to-wellness-softGreen/5 border-wellness-softGreen/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-wellness-darkGreen">Current Streak</CardTitle>
              <Award className="h-5 w-5 text-wellness-darkGreen/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-wellness-darkGreen">{currentStreak}</div>
              <div className="text-sm text-wellness-darkGreen/70">days in a row</div>
            </div>
            <div className="flex gap-1 mt-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-sm ${i < currentStreak % 7 ? 'bg-wellness-darkGreen' : 'bg-wellness-softGreen/30'}`}></div>
              ))}
            </div>
            <p className="text-xs mt-2 text-wellness-charcoal/70">
              {currentStreak === 0 ? "Complete today's tasks to start a streak!" : 
               `Keep it up! You're building great habits.`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-wellness-softGreen/30 to-wellness-softGreen/5 border-wellness-softGreen/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-wellness-darkGreen">Task Progress</CardTitle>
              <CheckCircle className="h-5 w-5 text-wellness-darkGreen/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-20 flex justify-center">
              {routineData.tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskCompletionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {taskCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}% complete`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-wellness-charcoal/50 text-sm">No tasks yet</p>
                </div>
              )}
            </div>
            <p className="text-xs mt-2 text-wellness-charcoal/70 text-center">
              {routineData.tasks.length} tasks in your routine
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-wellness-softGreen/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-wellness-darkGreen">Weekly Overview</CardTitle>
            <CardDescription>
              Your task completion rate over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={{
              dayCompleted: { color: "#4CAF50" },
              dayPartial: { color: "#2196F3" },
              dayMissed: { color: "#F44336" }
            }}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis tickFormatter={(value) => `${value}%`} stroke="#666" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #f0f0f0',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
                <Bar 
                  dataKey="completion" 
                  fill="#4CAF50"
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                  name="Completion Rate"
                >
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.completion > 80 ? '#4CAF50' : 
                            entry.completion > 50 ? '#8BC34A' :
                            entry.completion > 30 ? '#FFC107' : 
                            entry.completion > 0 ? '#FF9800' : '#F5F5F5'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="border-wellness-softGreen/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-wellness-darkGreen">Helpful Tips</CardTitle>
              <BookOpen className="h-5 w-5 text-wellness-darkGreen/70" />
            </div>
            <CardDescription>
              Ideas to boost your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {randomTips.map((tip, index) => (
                <div key={index} className="flex gap-3 p-3 bg-wellness-softGreen/10 rounded-lg border border-wellness-softGreen/20">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-wellness-charcoal/80">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-wellness-softGreen/20 bg-gradient-to-br from-white to-wellness-softGreen/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium text-wellness-darkGreen">Wellness Insight</CardTitle>
            <Heart className="h-5 w-5 text-red-400" />
          </div>
          <CardDescription>
            Maintaining routines is key for mental wellness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-wellness-charcoal/80 mb-3">
              Studies show that consistent routines can reduce stress by up to 43% and improve sleep quality.
              By tracking your habits, you're taking an important step toward better overall wellbeing.
            </p>
            <div className="text-sm text-wellness-charcoal/60 italic">
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
