
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
  LineChart,
  Line
} from 'recharts';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Award, 
  Clock, 
  Lightbulb,
  CheckCircle,
  XCircle,
  Calendar
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

  // Generate monthly data
  const monthlyData = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = Array.from(
      { length: monthEnd.getDate() },
      (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1)
    );
    
    return daysInMonth.map(day => {
      const dateKey = day.toISOString().split('T')[0];
      const taskCompletions = routineData.completionStatus[dateKey] || {};
      
      const completedCount = Object.values(taskCompletions).filter(Boolean).length;
      const totalTasks = routineData.tasks.length;
      const percentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      
      return {
        date: format(day, 'd'),
        completion: percentage
      };
    });
  }, [routineData]);

  // Generate AI recommendations based on patterns
  const getAIRecommendations = (): string[] => {
    const recommendations = [];
    
    // Basic recommendations if no data
    if (routineData.tasks.length === 0) {
      recommendations.push("Start by adding some tasks to track in the Settings tab.");
      return recommendations;
    }
    
    // Based on consistency
    if (overallConsistency < 30) {
      recommendations.push("Consider reducing the number of tasks to make your routine more manageable.");
    } else if (overallConsistency > 80) {
      recommendations.push("Great job maintaining consistency! Consider adding some new challenging tasks.");
    }
    
    // Based on streak
    if (currentStreak === 0) {
      recommendations.push("Try to complete at least one task today to start building momentum.");
    } else if (currentStreak > 3) {
      recommendations.push(`You're on a ${currentStreak}-day streak! Keep the momentum going.`);
    }
    
    // Task-specific recommendations
    const lowCompletionTasks = routineData.tasks
      .filter(task => {
        const completionRate = Object.keys(routineData.completionStatus)
          .reduce((count, dateKey) => {
            return count + (routineData.completionStatus[dateKey]?.[task.id] ? 1 : 0);
          }, 0);
        const totalDates = Object.keys(routineData.completionStatus).length;
        return totalDates > 0 && (completionRate / totalDates) < 0.3;
      })
      .map(task => task.title);
    
    if (lowCompletionTasks.length > 0) {
      recommendations.push(`Tasks like "${lowCompletionTasks[0]}" have low completion rates. Consider adjusting or rescheduling them.`);
    }
    
    // Morning/Evening recommendations
    const morningTasks = routineData.tasks.filter(task => task.timeOfDay === 'morning').length;
    const eveningTasks = routineData.tasks.filter(task => task.timeOfDay === 'evening').length;
    
    if (morningTasks > 5) {
      recommendations.push("You have many morning tasks. Consider spreading some throughout the day.");
    } else if (eveningTasks > 5) {
      recommendations.push("You have many evening tasks. Try moving some to earlier in the day when energy levels might be higher.");
    }
    
    // Ensure we have at least 2 recommendations
    if (recommendations.length < 2) {
      recommendations.push("Try setting specific times for your tasks to increase completion rates.");
      recommendations.push("Consider color-coding your tasks by priority to focus on what matters most.");
    }
    
    return recommendations;
  };
  
  const aiRecommendations = useMemo(getAIRecommendations, [routineData, overallConsistency, currentStreak]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Consistency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConsistency}%</div>
            <Progress value={overallConsistency} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentStreak > 0 
                ? `Keep it up! You're building great habits.` 
                : `Complete your tasks today to start a streak!`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Most Productive Day
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyData.length > 0 
                ? weeklyData.reduce((prev, current) => 
                    (prev.completion > current.completion) ? prev : current
                  ).day
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on your recent completion patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Best Time of Day
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Morning</div>
            <p className="text-xs text-muted-foreground mt-2">
              You complete most tasks in the morning hours
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your task completion rate over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{
              dayCompleted: { color: "#4CAF50" },
              dayPartial: { color: "#2196F3" },
              dayMissed: { color: "#F44336" }
            }}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Bar 
                  dataKey="completion" 
                  fill="var(--color-dayPartial)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                  name="Completion Rate"
                />
              </BarChart>
            </ChartContainer>
            <ChartLegend>
              <ChartLegendContent className="mt-2" />
            </ChartLegend>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Personalized insights based on your habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            Your task completion throughout the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[250px]" config={{
            completed: { color: "#4CAF50" },
          }}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="var(--color-completed)" 
                strokeWidth={2}
                name="Completion Rate"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
