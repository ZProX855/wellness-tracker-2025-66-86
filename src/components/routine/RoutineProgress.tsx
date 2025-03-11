
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar } from '@/components/ui/calendar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  CheckSquare, Calendar as CalendarIcon, BarChart2, PieChart as PieChartIcon, 
  Activity, ArrowUpRight, ArrowDownRight, Award
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';

const COLORS = ['#8FC0A9', '#E4F3E1', '#F8F4E3', '#EADBC8', '#403E43'];

const RoutineProgress: React.FC = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completionData, setCompletionData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    routineCount: 0,
    change: 0
  });
  
  useEffect(() => {
    if (user) {
      fetchRoutines();
    }
  }, [user]);
  
  useEffect(() => {
    if (routines.length > 0) {
      processData();
    }
  }, [routines, timeframe, selectedDate]);
  
  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('user_routines')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processData = () => {
    // Determine date range
    let startDate: Date, endDate: Date;
    
    switch(timeframe) {
      case 'day':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
    }
    
    // Filter routines for the selected period
    const filteredRoutines = routines.filter(routine => {
      // Check if any of the dates in the routine's dates array falls within our range
      if (!routine.dates || routine.dates.length === 0) return false;
      
      return routine.dates.some((dateStr: string) => {
        const date = parseISO(dateStr);
        return isWithinInterval(date, { start: startDate, end: endDate });
      });
    });
    
    // Process completion data
    if (timeframe === 'day') {
      // For day view, just show completion by routine
      const dayData = filteredRoutines.map(routine => {
        const completedTasks = routine.tasks.filter((task: any) => task.completed).length;
        const totalTasks = routine.tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
          name: routine.name,
          completion: Math.round(completionRate),
          tasks: totalTasks
        };
      });
      
      setCompletionData(dayData);
    } else if (timeframe === 'week') {
      // For week view, aggregate by day of week
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekData = dayNames.map((day, index) => {
        const dayOfWeek = new Date(startDate);
        dayOfWeek.setDate(startDate.getDate() + index);
        
        // Find routines for this day
        const dayRoutines = filteredRoutines.filter(routine => 
          routine.dates.some((dateStr: string) => {
            const date = parseISO(dateStr);
            return date.getDate() === dayOfWeek.getDate() && 
                   date.getMonth() === dayOfWeek.getMonth() &&
                   date.getFullYear() === dayOfWeek.getFullYear();
          })
        );
        
        let totalTasks = 0;
        let completedTasks = 0;
        
        dayRoutines.forEach(routine => {
          totalTasks += routine.tasks.length;
          completedTasks += routine.tasks.filter((task: any) => task.completed).length;
        });
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
          name: day,
          completion: Math.round(completionRate),
          tasks: totalTasks
        };
      });
      
      setCompletionData(weekData);
    } else {
      // For month view, aggregate by week
      const monthData = [];
      let currentDate = new Date(startDate);
      let weekNumber = 1;
      
      while (currentDate <= endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekEnd > endDate) {
          weekEnd.setTime(endDate.getTime());
        }
        
        // Find routines for this week
        const weekRoutines = filteredRoutines.filter(routine => 
          routine.dates.some((dateStr: string) => {
            const date = parseISO(dateStr);
            return date >= weekStart && date <= weekEnd;
          })
        );
        
        let totalTasks = 0;
        let completedTasks = 0;
        
        weekRoutines.forEach(routine => {
          totalTasks += routine.tasks.length;
          completedTasks += routine.tasks.filter((task: any) => task.completed).length;
        });
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        monthData.push({
          name: `Week ${weekNumber}`,
          completion: Math.round(completionRate),
          tasks: totalTasks
        });
        
        currentDate.setDate(currentDate.getDate() + 7);
        weekNumber++;
      }
      
      setCompletionData(monthData);
    }
    
    // Process category data
    const categories: { [key: string]: { completed: number, total: number } } = {};
    
    filteredRoutines.forEach(routine => {
      routine.tasks.forEach((task: any) => {
        const category = task.category || 'Uncategorized';
        
        if (!categories[category]) {
          categories[category] = { completed: 0, total: 0 };
        }
        
        categories[category].total += 1;
        if (task.completed) {
          categories[category].completed += 1;
        }
      });
    });
    
    const categoryChartData = Object.entries(categories).map(([name, data]) => ({
      name,
      value: data.total,
      completed: data.completed,
      completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
    
    setCategoryData(categoryChartData);
    
    // Calculate overall stats
    let totalTasks = 0;
    let completedTasks = 0;
    
    filteredRoutines.forEach(routine => {
      totalTasks += routine.tasks.length;
      completedTasks += routine.tasks.filter((task: any) => task.completed).length;
    });
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate change from previous period
    let previousPeriodStart: Date, previousPeriodEnd: Date;
    
    switch(timeframe) {
      case 'day':
        previousPeriodStart = subDays(startDate, 1);
        previousPeriodEnd = subDays(endDate, 1);
        break;
      case 'week':
        previousPeriodStart = subDays(startDate, 7);
        previousPeriodEnd = subDays(endDate, 7);
        break;
      case 'month':
        previousPeriodStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        previousPeriodEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        break;
      default:
        previousPeriodStart = subDays(startDate, 1);
        previousPeriodEnd = subDays(endDate, 1);
    }
    
    const previousRoutines = routines.filter(routine => {
      if (!routine.dates || routine.dates.length === 0) return false;
      
      return routine.dates.some((dateStr: string) => {
        const date = parseISO(dateStr);
        return date >= previousPeriodStart && date <= previousPeriodEnd;
      });
    });
    
    let previousTotalTasks = 0;
    let previousCompletedTasks = 0;
    
    previousRoutines.forEach(routine => {
      previousTotalTasks += routine.tasks.length;
      previousCompletedTasks += routine.tasks.filter((task: any) => task.completed).length;
    });
    
    const previousCompletionRate = previousTotalTasks > 0 ? (previousCompletedTasks / previousTotalTasks) * 100 : 0;
    const change = completionRate - previousCompletionRate;
    
    setStats({
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate),
      routineCount: filteredRoutines.length,
      change: Math.round(change)
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (routines.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <Activity className="h-12 w-12 mx-auto text-wellness-softGreen opacity-50" />
        <p className="mt-2 text-wellness-charcoal/70">No routines found</p>
        <p className="text-sm text-wellness-charcoal/50">
          Create a routine to start tracking your progress
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-medium text-wellness-darkGreen">Routine Progress</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select
            defaultValue="week"
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily View</SelectItem>
              <SelectItem value="week">Weekly View</SelectItem>
              <SelectItem value="month">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-wellness-charcoal mb-2 flex items-center">
            <CalendarIcon size={16} className="mr-2 text-wellness-darkGreen" />
            Select Date Range
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date || new Date())}
            className="rounded-md border-0"
          />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-wellness-charcoal mb-2">Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-wellness-softGreen/30 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-wellness-charcoal/70">Completion Rate</p>
                  <p className="text-2xl font-medium text-wellness-darkGreen mt-1">
                    {stats.completionRate}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${
                  stats.change >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {stats.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className={`text-xs mt-2 flex items-center ${
                stats.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span>{Math.abs(stats.change)}% from previous period</span>
              </div>
            </div>
            
            <div className="bg-wellness-softGreen/30 rounded-lg p-3">
              <p className="text-xs text-wellness-charcoal/70">Tasks Completed</p>
              <p className="text-2xl font-medium text-wellness-darkGreen mt-1">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
              <p className="text-xs text-wellness-charcoal/70 mt-2">
                Across {stats.routineCount} routines
              </p>
            </div>
            
            <div className="bg-wellness-softGreen/30 rounded-lg p-3 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-wellness-charcoal/70">Overall Progress</p>
                  <p className="text-lg font-medium text-wellness-darkGreen mt-1">
                    {timeframe === 'day' ? format(selectedDate, 'MMMM d, yyyy') :
                     timeframe === 'week' ? `Week of ${format(selectedDate, 'MMM d')}` :
                     format(selectedDate, 'MMMM yyyy')}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-wellness-softBeige">
                  <Award className="h-5 w-5 text-wellness-darkGreen" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-wellness-charcoal mb-4 flex items-center">
            <BarChart2 size={16} className="mr-2 text-wellness-darkGreen" />
            Completion Rate {timeframe === 'day' ? 'by Routine' : timeframe === 'week' ? 'by Day' : 'by Week'}
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completionData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="completion" fill="#8FC0A9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-wellness-charcoal mb-4 flex items-center">
            <PieChartIcon size={16} className="mr-2 text-wellness-darkGreen" />
            Tasks by Category
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} tasks (${props.payload.completion}% complete)`,
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-wellness-charcoal mb-4 flex items-center">
          <CheckSquare size={16} className="mr-2 text-wellness-darkGreen" />
          Task Completion Details
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-wellness-softGreen/30">
                <th className="text-left p-2 text-sm font-medium text-wellness-darkGreen">Category</th>
                <th className="text-center p-2 text-sm font-medium text-wellness-darkGreen">Total Tasks</th>
                <th className="text-center p-2 text-sm font-medium text-wellness-darkGreen">Completed</th>
                <th className="text-center p-2 text-sm font-medium text-wellness-darkGreen">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category, index) => (
                <tr key={category.name} className={index % 2 === 0 ? 'bg-white' : 'bg-wellness-softBeige/20'}>
                  <td className="p-2 text-sm border-t border-wellness-softGreen/20">{category.name}</td>
                  <td className="p-2 text-sm text-center border-t border-wellness-softGreen/20">{category.value}</td>
                  <td className="p-2 text-sm text-center border-t border-wellness-softGreen/20">{category.completed}</td>
                  <td className="p-2 text-sm text-center border-t border-wellness-softGreen/20">
                    <div className="flex items-center justify-center">
                      <div className="w-24 h-2 bg-gray-100 rounded-full mr-2">
                        <div 
                          className="h-full rounded-full bg-wellness-mediumGreen"
                          style={{ width: `${category.completion}%` }}
                        ></div>
                      </div>
                      <span>{category.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RoutineProgress;
