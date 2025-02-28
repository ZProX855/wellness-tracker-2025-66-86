
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Moon, Clock, Calendar, BarChart2, BedDouble, Zap, Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Types
interface SleepSession {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 'Restful' | 'Good' | 'Average' | 'Light' | 'Disturbed' | 'Poor';
  factors: string[];
  notes: string;
}

interface SleepInsight {
  type: 'info' | 'warning' | 'success' | 'tip';
  message: string;
  icon: React.ReactNode;
}

interface SleepChartData {
  date: string;
  duration: number;
  qualityScore: number;
  sleepScore: number;
}

const SleepTracker = () => {
  const navigate = useNavigate();
  const [sleepData, setSleepData] = useState<SleepSession[]>(() => {
    const savedData = localStorage.getItem('sleepTrackerData');
    return savedData ? JSON.parse(savedData) : [];
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<SleepSession, 'id' | 'duration'>>({
    date: new Date().toISOString().split('T')[0],
    bedTime: '22:30',
    wakeTime: '06:30',
    quality: 'Good',
    factors: [],
    notes: '',
  });
  
  const [activeTab, setActiveTab] = useState<'insights' | 'history' | 'trends'>('insights');
  const [insights, setInsights] = useState<SleepInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<SleepChartData[]>([]);
  
  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('sleepTrackerData', JSON.stringify(sleepData));
    
    // Generate insights whenever sleep data changes
    if (sleepData.length > 0) {
      generateSleepInsights();
      prepareChartData();
    }
  }, [sleepData]);
  
  // Prepare chart data for visualization
  const prepareChartData = () => {
    // Convert quality string to numeric value for the chart
    const qualityToScore = (quality: string): number => {
      switch (quality) {
        case 'Restful': return 100;
        case 'Good': return 80;
        case 'Average': return 60;
        case 'Light': return 40;
        case 'Disturbed': return 20;
        case 'Poor': return 0;
        default: return 50;
      }
    };

    // Get last 14 days of sleep data (or all if less than 14)
    const last14Days = [...sleepData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14);
    
    const data = last14Days.map(session => ({
      date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: Math.round(session.duration / 60 * 10) / 10, // Convert to hours with 1 decimal
      qualityScore: qualityToScore(session.quality),
      sleepScore: calculateSleepScore(session)
    }));
    
    setChartData(data);
  };
  
  // Generate insights based on sleep data
  const generateSleepInsights = () => {
    setLoading(true);
    
    // This would ideally use the Gemini API to generate personalized insights
    // For now, we'll generate some sample insights based on the data
    
    setTimeout(() => {
      const newInsights: SleepInsight[] = [];
      
      // Calculate average sleep duration
      const totalDuration = sleepData.reduce((sum, session) => sum + session.duration, 0);
      const avgDuration = totalDuration / sleepData.length;
      const avgHours = Math.floor(avgDuration / 60);
      const avgMinutes = Math.round(avgDuration % 60);
      
      // Add insights based on average duration
      if (avgDuration < 420) { // Less than 7 hours
        newInsights.push({
          type: 'warning',
          message: `Your average sleep of ${avgHours}h ${avgMinutes}m is below the recommended 7-8 hours. Try going to bed 30 minutes earlier.`,
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        });
      } else if (avgDuration > 540) { // More than 9 hours
        newInsights.push({
          type: 'info',
          message: `Your average sleep of ${avgHours}h ${avgMinutes}m is above average. Quality matters as much as quantity.`,
          icon: <Moon className="h-5 w-5 text-violet-500" />,
        });
      } else {
        newInsights.push({
          type: 'success',
          message: `Great job! Your average sleep of ${avgHours}h ${avgMinutes}m is within the optimal range.`,
          icon: <Zap className="h-5 w-5 text-green-500" />,
        });
      }
      
      // Check sleep consistency
      if (sleepData.length >= 3) {
        const recentSessions = sleepData.slice(-3);
        const bedTimes = recentSessions.map(s => {
          const [hours, minutes] = s.bedTime.split(':').map(Number);
          return hours * 60 + minutes;
        });
        
        const maxDiff = Math.max(...bedTimes) - Math.min(...bedTimes);
        
        if (maxDiff > 90) {
          newInsights.push({
            type: 'warning',
            message: 'Your bedtime varies by more than 90 minutes. Consistent sleep schedules improve sleep quality.',
            icon: <Clock className="h-5 w-5 text-amber-500" />,
          });
        } else if (maxDiff < 30) {
          newInsights.push({
            type: 'success',
            message: 'Excellent sleep consistency! Your regular bedtime routine supports your circadian rhythm.',
            icon: <Calendar className="h-5 w-5 text-green-500" />,
          });
        }
      }
      
      // Check for common factors affecting sleep
      const factorCounts: Record<string, number> = {};
      sleepData.forEach(session => {
        session.factors.forEach(factor => {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
      });
      
      const commonFactors = Object.entries(factorCounts)
        .filter(([_, count]) => count >= 2)
        .map(([factor]) => factor);
      
      if (commonFactors.includes('Screen time')) {
        newInsights.push({
          type: 'tip',
          message: 'Screen time before bed affects your sleep quality. Try the 30-minute no-screen rule before bedtime.',
          icon: <Activity className="h-5 w-5 text-blue-500" />,
        });
      }
      
      if (commonFactors.includes('Caffeine')) {
        newInsights.push({
          type: 'tip',
          message: 'Caffeine can stay in your system for 6+ hours. Try switching to herbal tea after 2 PM.',
          icon: <Activity className="h-5 w-5 text-blue-500" />,
        });
      }
      
      // Generate a smart sleep schedule recommendation
      const recentSleepSessions = sleepData.slice(-7);
      if (recentSleepSessions.length > 0) {
        const lastSession = recentSleepSessions[recentSleepSessions.length - 1];
        const [wakeHours, wakeMinutes] = lastSession.wakeTime.split(':').map(Number);
        
        // Suggest a bedtime based on last wake time (about 16 hours later)
        const suggestedBedHours = (wakeHours + 16) % 24;
        const suggestedBedTime = `${String(suggestedBedHours).padStart(2, '0')}:${String(wakeMinutes).padStart(2, '0')}`;
        
        newInsights.push({
          type: 'tip',
          message: `Based on your wake time, a good bedtime tonight would be around ${suggestedBedTime}.`,
          icon: <BedDouble className="h-5 w-5 text-blue-500" />,
        });
      }
      
      setInsights(newInsights);
      setLoading(false);
    }, 1000); // Simulate API call
  };
  
  // Calculate sleep duration from bed time and wake time
  const calculateDuration = (bedTime: string, wakeTime: string): number => {
    const [bedHours, bedMinutes] = bedTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
    
    let durationMinutes = (wakeHours * 60 + wakeMinutes) - (bedHours * 60 + bedMinutes);
    
    // Handle overnight sleep (e.g., 23:00 to 06:00)
    if (durationMinutes <= 0) {
      durationMinutes += 24 * 60;
    }
    
    return durationMinutes;
  };
  
  // Format minutes as hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFactorToggle = (factor: string) => {
    setFormData(prev => {
      const currentFactors = [...prev.factors];
      if (currentFactors.includes(factor)) {
        return { ...prev, factors: currentFactors.filter(f => f !== factor) };
      } else {
        return { ...prev, factors: [...currentFactors, factor] };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate duration
    const duration = calculateDuration(formData.bedTime, formData.wakeTime);
    
    // Create new sleep session
    const newSession: SleepSession = {
      id: Date.now().toString(),
      duration,
      ...formData,
    };
    
    // Add to sleep data
    setSleepData(prev => [newSession, ...prev]);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      bedTime: '22:30',
      wakeTime: '06:30',
      quality: 'Good',
      factors: [],
      notes: '',
    });
    
    // Hide form
    setShowAddForm(false);
    
    // Show success message
    toast.success('Sleep session added successfully');
  };
  
  // Calculates the sleep quality score (0-100)
  const calculateSleepScore = (session: SleepSession): number => {
    // Base score from duration (optimal is 7-8 hours)
    let score = 70;
    
    // Duration factor
    const hours = session.duration / 60;
    if (hours >= 7 && hours <= 8) {
      score += 15;
    } else if (hours >= 6 && hours < 7) {
      score += 5;
    } else if (hours > 8 && hours <= 9) {
      score += 5;
    } else if (hours < 6) {
      score -= 15;
    } else if (hours > 9) {
      score -= 5;
    }
    
    // Quality factor
    switch (session.quality) {
      case 'Restful':
        score += 15;
        break;
      case 'Good':
        score += 10;
        break;
      case 'Average':
        score += 5;
        break;
      case 'Light':
        score -= 5;
        break;
      case 'Disturbed':
        score -= 10;
        break;
      case 'Poor':
        score -= 15;
        break;
    }
    
    // Negative factors
    const negativeFactors = ['Caffeine', 'Alcohol', 'Screen time', 'Stress', 'Noise'];
    const negativeCount = session.factors.filter(f => negativeFactors.includes(f)).length;
    score -= negativeCount * 5;
    
    // Positive factors
    const positiveFactors = ['Exercise', 'Meditation', 'Reading'];
    const positiveCount = session.factors.filter(f => positiveFactors.includes(f)).length;
    score += positiveCount * 5;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  };
  
  // Get sleep score color
  const getSleepScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get the average sleep duration for the past 7 days
  const getAverageSleepDuration = (): number => {
    if (sleepData.length === 0) return 0;
    
    const recentData = sleepData.slice(0, 7); // Up to 7 most recent sessions
    const totalDuration = recentData.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / recentData.length;
  };
  
  const avgDuration = getAverageSleepDuration();

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-md border border-wellness-softGreen/30 text-sm">
          <p className="font-medium text-wellness-darkGreen">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'qualityScore' ? 'Quality: ' : entry.name === 'sleepScore' ? 'Sleep Score: ' : 'Duration: '}
              {entry.name === 'duration' ? `${entry.value}h` : `${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2">Sleep Tracker</h1>
            <p className="text-wellness-charcoal">Monitor your sleep patterns and get AI-powered insights for better rest.</p>
          </div>
          
          {/* Dashboard Overview */}
          <div className="glass-panel p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 flex flex-col items-center justify-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <Moon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-wellness-darkGreen mb-1">Average Sleep</h3>
                <p className="text-2xl font-bold text-wellness-darkGreen">
                  {avgDuration > 0 ? formatDuration(avgDuration) : 'No data'}
                </p>
                <p className="text-sm text-wellness-charcoal">Past 7 days</p>
              </div>
              
              <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 flex flex-col items-center justify-center">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <BedDouble className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-wellness-darkGreen mb-1">Sleep Score</h3>
                <p className="text-2xl font-bold text-wellness-darkGreen">
                  {sleepData.length > 0 ? (
                    <span className={getSleepScoreColor(calculateSleepScore(sleepData[0]))}>
                      {calculateSleepScore(sleepData[0])}
                    </span>
                  ) : 'No data'}
                </p>
                <p className="text-sm text-wellness-charcoal">Last night</p>
              </div>
              
              <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 flex flex-col items-center justify-center">
                <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-wellness-darkGreen mb-1">Tracking Streak</h3>
                <p className="text-2xl font-bold text-wellness-darkGreen">
                  {sleepData.length} days
                </p>
                <p className="text-sm text-wellness-charcoal">Keep it going!</p>
              </div>
            </div>
            
            {sleepData.length > 0 ? (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary rounded-lg"
                >
                  Add Sleep Data
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-wellness-charcoal mb-4">Start tracking your sleep to get personalized insights!</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary rounded-lg"
                >
                  Add First Sleep Data
                </button>
              </div>
            )}
          </div>
          
          {/* Add Sleep Form */}
          {showAddForm && (
            <div className="glass-panel p-6 mb-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-wellness-darkGreen">Add Sleep Data</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-wellness-charcoal hover:text-wellness-darkGreen"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-wellness-charcoal mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white bg-opacity-80 border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedTime" className="block text-sm font-medium text-wellness-charcoal mb-1">
                        Bed Time
                      </label>
                      <input
                        type="time"
                        id="bedTime"
                        name="bedTime"
                        value={formData.bedTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-80 border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="wakeTime" className="block text-sm font-medium text-wellness-charcoal mb-1">
                        Wake Time
                      </label>
                      <input
                        type="time"
                        id="wakeTime"
                        name="wakeTime"
                        value={formData.wakeTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-80 border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quality" className="block text-sm font-medium text-wellness-charcoal mb-1">
                    Sleep Quality
                  </label>
                  <select
                    id="quality"
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white bg-opacity-80 border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                  >
                    <option value="Restful">Restful</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Light">Light</option>
                    <option value="Disturbed">Disturbed</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-wellness-charcoal mb-2">
                    Factors Affecting Sleep
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Caffeine', 'Alcohol', 'Screen time', 'Stress', 'Noise', 'Exercise', 'Meditation', 'Reading'].map(factor => (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => handleFactorToggle(factor)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.factors.includes(factor)
                            ? 'bg-wellness-darkGreen text-white'
                            : 'bg-wellness-softGreen/30 text-wellness-darkGreen'
                        }`}
                      >
                        {factor}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-wellness-charcoal mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white bg-opacity-80 border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                    placeholder="Any additional notes about your sleep..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary rounded-lg mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary rounded-lg"
                  >
                    Save Sleep Data
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Tabs for Insights, History, and Trends */}
          {sleepData.length > 0 && (
            <div className="glass-panel p-6">
              <div className="border-b border-wellness-softGreen/30 mb-6">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'insights'
                        ? 'border-wellness-darkGreen text-wellness-darkGreen'
                        : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                    }`}
                  >
                    AI Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-wellness-darkGreen text-wellness-darkGreen'
                        : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                    }`}
                  >
                    Sleep History
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trends'
                        ? 'border-wellness-darkGreen text-wellness-darkGreen'
                        : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                    }`}
                  >
                    Sleep Trends
                  </button>
                </div>
              </div>
              
              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium text-wellness-darkGreen mb-4">Your Sleep Insights</h3>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-10 h-10 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : insights.length > 0 ? (
                    <div className="space-y-3">
                      {insights.map((insight, index) => (
                        <div 
                          key={index} 
                          className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30 flex items-start gap-3"
                        >
                          {insight.icon}
                          <div>
                            <p className="text-wellness-charcoal">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-wellness-charcoal">
                      <Moon className="h-12 w-12 mx-auto mb-3 text-wellness-mediumGreen opacity-50" />
                      <p>No insights available yet. Add more sleep data to get personalized recommendations.</p>
                    </div>
                  )}
                  
                  <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-medium text-wellness-darkGreen mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      Sleep Challenge
                    </h4>
                    <p className="text-wellness-charcoal mb-3">
                      {sleepData.length < 7 
                        ? `Track your sleep for ${7 - sleepData.length} more days to unlock your personalized sleep profile!`
                        : 'Try going to bed and waking up at the same time for 7 consecutive days, even on weekends.'}
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(sleepData.length / 7 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium text-wellness-darkGreen mb-4">Sleep History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-wellness-softGreen/30">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Sleep Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Quality
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white bg-opacity-50 divide-y divide-wellness-softGreen/20">
                        {sleepData.map((session) => (
                          <tr key={session.id} className="hover:bg-wellness-softGreen/10">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {new Date(session.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {session.bedTime} - {session.wakeTime}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {formatDuration(session.duration)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${session.quality === 'Restful' || session.quality === 'Good' 
                                  ? 'bg-green-100 text-green-800' 
                                  : session.quality === 'Average' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : session.quality === 'Light' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {session.quality}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <span className={getSleepScoreColor(calculateSleepScore(session))}>
                                {calculateSleepScore(session)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium text-wellness-darkGreen mb-4">Sleep Trends</h3>
                  
                  {sleepData.length >= 3 ? (
                    <div>
                      {/* Sleep Quality Trend Line Graph */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-wellness-charcoal mb-2">Sleep Quality Trends</h4>
                        <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30">
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  stroke="#6b7280"
                                />
                                <YAxis 
                                  yAxisId="left"
                                  orientation="left" 
                                  stroke="#6b7280"
                                  tick={{ fontSize: 12 }}
                                  domain={[0, 100]}
                                  label={{ 
                                    value: 'Score', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    style: { fill: '#6b7280', fontSize: 12 } 
                                  }}
                                />
                                <YAxis
                                  yAxisId="right"
                                  orientation="right"
                                  stroke="#6b7280"
                                  tick={{ fontSize: 12 }}
                                  domain={[0, 'dataMax + 1']}
                                  label={{ 
                                    value: 'Hours', 
                                    angle: 90, 
                                    position: 'insideRight',
                                    style: { fill: '#6b7280', fontSize: 12 } 
                                  }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="qualityScore"
                                  name="Quality"
                                  stroke="#8884d8"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                  animationDuration={1000}
                                />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="sleepScore"
                                  name="Sleep Score"
                                  stroke="#82ca9d"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                  animationDuration={1000}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="duration"
                                  name="Duration"
                                  stroke="#ffa726"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                  animationDuration={1000}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-wellness-charcoal">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-1"></div>
                              <span>Quality</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-1"></div>
                              <span>Sleep Score</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#ffa726] mr-1"></div>
                              <span>Duration (hours)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bar chart for duration */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-wellness-charcoal mb-2">Sleep Duration (Last 7 Days)</h4>
                        <div className="h-40 bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30">
                          {/* Simple visual representation of sleep duration */}
                          <div className="h-full flex items-end space-x-1">
                            {sleepData.slice(0, 7).reverse().map((session, index) => {
                              const hours = session.duration / 60;
                              const heightPercentage = Math.min(Math.max((hours / 12) * 100, 10), 100);
                              
                              return (
                                <div 
                                  key={index} 
                                  className="flex-1 flex flex-col items-center justify-end"
                                >
                                  <div 
                                    className={`w-full rounded-t-md ${
                                      hours >= 7 && hours <= 9 
                                        ? 'bg-green-400' 
                                        : hours >= 6 && hours < 7 
                                        ? 'bg-yellow-400'
                                        : 'bg-red-400'
                                    }`}
                                    style={{ height: `${heightPercentage}%` }}
                                  ></div>
                                  <div className="text-xs text-wellness-charcoal mt-1">
                                    {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-wellness-charcoal mb-2">
                            Average Sleep Score
                          </h4>
                          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30 text-center">
                            <div className="inline-flex justify-center items-center h-32 w-32 rounded-full border-8 border-wellness-softGreen/30 relative mb-2">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-3xl font-bold ${
                                  getSleepScoreColor(
                                    sleepData.slice(0, 7).reduce((sum, session) => sum + calculateSleepScore(session), 0) / 
                                    Math.min(sleepData.length, 7)
                                  )
                                }`}>
                                  {Math.round(
                                    sleepData.slice(0, 7).reduce((sum, session) => sum + calculateSleepScore(session), 0) / 
                                    Math.min(sleepData.length, 7)
                                  )}
                                </span>
                              </div>
                            </div>
                            <p className="text-wellness-charcoal">7-day average</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-wellness-charcoal mb-2">
                            Sleep Quality Distribution
                          </h4>
                          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30">
                            {/* Simplified quality distribution */}
                            <div className="space-y-2">
                              {['Restful', 'Good', 'Average', 'Light', 'Disturbed', 'Poor'].map(quality => {
                                const count = sleepData.filter(s => s.quality === quality).length;
                                const percentage = Math.round((count / sleepData.length) * 100);
                                
                                return (
                                  <div key={quality}>
                                    <div className="flex justify-between text-xs text-wellness-charcoal mb-1">
                                      <span>{quality}</span>
                                      <span>{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-wellness-softGreen/20 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          quality === 'Restful' 
                                            ? 'bg-green-500' 
                                            : quality === 'Good' 
                                            ? 'bg-green-400'
                                            : quality === 'Average' 
                                            ? 'bg-blue-400'
                                            : quality === 'Light' 
                                            ? 'bg-yellow-400'
                                            : quality === 'Disturbed' 
                                            ? 'bg-orange-400'
                                            : 'bg-red-400'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-wellness-charcoal mb-2">
                          Sleep Factors Impact
                        </h4>
                        <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Caffeine', 'Alcohol', 'Screen time', 'Stress', 'Noise', 'Exercise', 'Meditation', 'Reading'].map(factor => {
                              const sessionsWithFactor = sleepData.filter(s => s.factors.includes(factor));
                              if (sessionsWithFactor.length === 0) return null;
                              
                              const avgScore = sessionsWithFactor.reduce((sum, s) => sum + calculateSleepScore(s), 0) / sessionsWithFactor.length;
                              const sessionsWithoutFactor = sleepData.filter(s => !s.factors.includes(factor));
                              const avgScoreWithout = sessionsWithoutFactor.length > 0 
                                ? sessionsWithoutFactor.reduce((sum, s) => sum + calculateSleepScore(s), 0) / sessionsWithoutFactor.length
                                : 0;
                              
                              const impact = avgScore - avgScoreWithout;
                              
                              return (
                                <div key={factor} className="text-center p-2 rounded-lg bg-wellness-softGreen/10">
                                  <div className="text-sm font-medium text-wellness-darkGreen">{factor}</div>
                                  <div className={`text-sm ${impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {impact > 0 ? '+' : ''}{Math.round(impact)} points
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-wellness-charcoal">
                      <BarChart2 className="h-12 w-12 mx-auto mb-3 text-wellness-mediumGreen opacity-50" />
                      <p>Not enough data to show trends yet. Add at least 3 sleep records.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SleepTracker;
