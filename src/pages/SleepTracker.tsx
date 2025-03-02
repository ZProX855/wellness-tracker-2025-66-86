
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Moon, Clock, Calendar, BarChart2, BedDouble, Zap, Activity, AlertCircle, AlarmClock, Sun, Calculator } from 'lucide-react';
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

// Sleep cycle durations (in minutes)
const SLEEP_CYCLE_LENGTH = 90; // Average sleep cycle is 90 minutes
const FALL_ASLEEP_TIME = 15; // Average time to fall asleep

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
    notes: ''
  });
  const [activeTab, setActiveTab] = useState<'insights' | 'history' | 'trends'>('insights');
  const [insights, setInsights] = useState<SleepInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<SleepChartData[]>([]);
  const [showSleepCalculator, setShowSleepCalculator] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState<'bedtime' | 'waketime'>('bedtime');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('22:30');
  const [sleepCycles, setSleepCycles] = useState(5);
  const [calculatedTimes, setCalculatedTimes] = useState<string[]>([]);
  const [sleepAdvice, setSleepAdvice] = useState<SleepInsight[]>([]);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('sleepTrackerData', JSON.stringify(sleepData));

    // Generate insights whenever sleep data changes
    if (sleepData.length > 0) {
      generateSleepInsights();
      prepareChartData();
    }
  }, [sleepData]);

  // Generate sleep time recommendations
  const calculateSleepTimes = () => {
    // Clear previous recommendations
    setCalculatedTimes([]);
    let times: string[] = [];
    
    if (calculatorMode === 'bedtime') {
      // Calculate bedtime based on wake-up time
      // Parse wake-up time
      const [wakeHours, wakeMinutes] = wakeupTime.split(':').map(Number);
      
      // Calculate bedtimes for different numbers of sleep cycles (4-6 cycles = 6-9 hours)
      for (let cycles = 4; cycles <= 6; cycles++) {
        // Total sleep time needed in minutes
        const sleepTimeNeeded = cycles * SLEEP_CYCLE_LENGTH + FALL_ASLEEP_TIME;
        
        // Calculate bedtime by subtracting sleep time from wake-up time
        let bedtimeMinutes = wakeHours * 60 + wakeMinutes - sleepTimeNeeded;
        
        // Adjust for previous day if negative
        if (bedtimeMinutes < 0) {
          bedtimeMinutes += 24 * 60;
        }
        
        // Convert back to hours and minutes
        const bedHours = Math.floor(bedtimeMinutes / 60);
        const bedMins = Math.floor(bedtimeMinutes % 60);
        
        // Format time string
        const formattedTime = `${String(bedHours).padStart(2, '0')}:${String(bedMins).padStart(2, '0')}`;
        
        times.push(formattedTime);
      }
      
      setCalculatedTimes(times);
      generateSleepAdvice();
      
    } else {
      // Calculate wake-up time based on bedtime
      // Parse bedtime
      const [bedHours, bedMinutes] = bedTime.split(':').map(Number);
      
      // Calculate wake-up time based on sleep cycles
      const sleepTimeNeeded = sleepCycles * SLEEP_CYCLE_LENGTH + FALL_ASLEEP_TIME;
      
      // Calculate wake-up time by adding sleep time to bedtime
      let wakeupMinutes = bedHours * 60 + bedMinutes + sleepTimeNeeded;
      
      // Adjust for next day if over 24 hours
      if (wakeupMinutes >= 24 * 60) {
        wakeupMinutes -= 24 * 60;
      }
      
      // Convert back to hours and minutes
      const wakeHours = Math.floor(wakeupMinutes / 60);
      const wakeMins = Math.floor(wakeupMinutes % 60);
      
      // Format time string
      const formattedTime = `${String(wakeHours).padStart(2, '0')}:${String(wakeMins).padStart(2, '0')}`;
      
      times.push(formattedTime);
      setCalculatedTimes(times);
      generateSleepAdvice();
    }
  };

  // Generate personalized sleep advice
  const generateSleepAdvice = () => {
    const newAdvice: SleepInsight[] = [
      {
        type: 'info',
        message: 'Complete sleep cycles help you wake up feeling refreshed. Each cycle lasts about 90 minutes.',
        icon: <Moon className="h-5 w-5 text-blue-500" />
      },
      {
        type: 'tip',
        message: 'Try to maintain consistent sleep and wake times, even on weekends, to regulate your body\'s internal clock.',
        icon: <Clock className="h-5 w-5 text-blue-500" />
      },
      {
        type: 'success',
        message: 'Adults typically need 7-9 hours of quality sleep per night. Aim for 5-6 complete sleep cycles.',
        icon: <Zap className="h-5 w-5 text-green-500" />
      },
      {
        type: 'tip',
        message: 'Create a relaxing bedtime routine: dim the lights, avoid screens, and try reading or gentle stretching.',
        icon: <Moon className="h-5 w-5 text-blue-500" />
      }
    ];
    
    // Add personalized advice based on sleep data if available
    if (sleepData.length > 0) {
      const recentSessions = sleepData.slice(0, 7);
      const avgDuration = recentSessions.reduce((sum, session) => sum + session.duration, 0) / recentSessions.length / 60;
      
      if (avgDuration < 7) {
        newAdvice.push({
          type: 'warning',
          message: `You're averaging ${avgDuration.toFixed(1)} hours of sleep. Try going to bed earlier for better health outcomes.`,
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />
        });
      }
      
      // Check if user has consistent sleep schedule
      const bedTimes = recentSessions.map(s => {
        const [hours, minutes] = s.bedTime.split(':').map(Number);
        return hours * 60 + minutes;
      });
      const maxDiff = Math.max(...bedTimes) - Math.min(...bedTimes);
      
      if (maxDiff > 90) {
        newAdvice.push({
          type: 'warning',
          message: 'Your bedtimes vary significantly. A consistent sleep schedule can improve sleep quality.',
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />
        });
      }
      
      // Check common factors affecting sleep
      const factorCounts: Record<string, number> = {};
      recentSessions.forEach(session => {
        session.factors.forEach(factor => {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
      });
      
      if (factorCounts['Screen time'] && factorCounts['Screen time'] > 2) {
        newAdvice.push({
          type: 'tip',
          message: 'Blue light from screens can disrupt sleep. Try using night mode or blue light filters in the evening.',
          icon: <Activity className="h-5 w-5 text-blue-500" />
        });
      }
      
      if (factorCounts['Caffeine'] && factorCounts['Caffeine'] > 2) {
        newAdvice.push({
          type: 'tip',
          message: 'Consider cutting off caffeine at least 8 hours before bedtime to improve sleep quality.',
          icon: <Activity className="h-5 w-5 text-blue-500" />
        });
      }
    }
    
    setSleepAdvice(newAdvice);
  };

  // Prepare chart data for visualization
  const prepareChartData = () => {
    // Convert quality string to numeric value for the chart
    const qualityToScore = (quality: string): number => {
      switch (quality) {
        case 'Restful':
          return 100;
        case 'Good':
          return 80;
        case 'Average':
          return 60;
        case 'Light':
          return 40;
        case 'Disturbed':
          return 20;
        case 'Poor':
          return 0;
        default:
          return 50;
      }
    };

    // Get last 14 days of sleep data (or all if less than 14)
    const last14Days = [...sleepData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-14);
    const data = last14Days.map(session => ({
      date: new Date(session.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      duration: Math.round(session.duration / 60 * 10) / 10,
      // Convert to hours with 1 decimal
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
      if (avgDuration < 420) {
        // Less than 7 hours
        newInsights.push({
          type: 'warning',
          message: `Your average sleep of ${avgHours}h ${avgMinutes}m is below the recommended 7-8 hours. Try going to bed 30 minutes earlier.`,
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />
        });
      } else if (avgDuration > 540) {
        // More than 9 hours
        newInsights.push({
          type: 'info',
          message: `Your average sleep of ${avgHours}h ${avgMinutes}m is above average. Quality matters as much as quantity.`,
          icon: <Moon className="h-5 w-5 text-violet-500" />
        });
      } else {
        newInsights.push({
          type: 'success',
          message: `Great job! Your average sleep of ${avgHours}h ${avgMinutes}m is within the optimal range.`,
          icon: <Zap className="h-5 w-5 text-green-500" />
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
            icon: <Clock className="h-5 w-5 text-amber-500" />
          });
        } else if (maxDiff < 30) {
          newInsights.push({
            type: 'success',
            message: 'Excellent sleep consistency! Your regular bedtime routine supports your circadian rhythm.',
            icon: <Calendar className="h-5 w-5 text-green-500" />
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
      const commonFactors = Object.entries(factorCounts).filter(([_, count]) => count >= 2).map(([factor]) => factor);
      if (commonFactors.includes('Screen time')) {
        newInsights.push({
          type: 'tip',
          message: 'Screen time before bed affects your sleep quality. Try the 30-minute no-screen rule before bedtime.',
          icon: <Activity className="h-5 w-5 text-blue-500" />
        });
      }
      if (commonFactors.includes('Caffeine')) {
        newInsights.push({
          type: 'tip',
          message: 'Caffeine can stay in your system for 6+ hours. Try switching to herbal tea after 2 PM.',
          icon: <Activity className="h-5 w-5 text-blue-500" />
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
          icon: <BedDouble className="h-5 w-5 text-blue-500" />
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
    let durationMinutes = wakeHours * 60 + wakeMinutes - (bedHours * 60 + bedMinutes);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFactorToggle = (factor: string) => {
    setFormData(prev => {
      const currentFactors = [...prev.factors];
      if (currentFactors.includes(factor)) {
        return {
          ...prev,
          factors: currentFactors.filter(f => f !== factor)
        };
      } else {
        return {
          ...prev,
          factors: [...currentFactors, factor]
        };
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
      ...formData
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
      notes: ''
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
            <Link to="/" className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors">
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
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => setShowAddForm(true)} className="btn-primary rounded-lg">
                  Add Sleep Data
                </button>
                <button 
                  onClick={() => setShowSleepCalculator(!showSleepCalculator)} 
                  className="btn-secondary rounded-lg flex items-center"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {showSleepCalculator ? 'Hide Sleep Calculator' : 'Sleep Time Calculator'}
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-wellness-charcoal mb-4">Start tracking your sleep to get personalized insights!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setShowAddForm(true)} className="btn-primary rounded-lg">
                    Add First Sleep Data
                  </button>
                  <button 
                    onClick={() => setShowSleepCalculator(!showSleepCalculator)} 
                    className="btn-secondary rounded-lg flex items-center justify-center"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Sleep Time Calculator
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sleep Time Calculator */}
          {showSleepCalculator && (
            <div className="glass-panel p-6 mb-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-wellness-darkGreen">Sleep Time Calculator</h3>
                <button onClick={() => setShowSleepCalculator(false)} className="text-wellness-charcoal hover:text-wellness-darkGreen">
                  ✕
                </button>
              </div>
              
              <div className="bg-white bg-opacity-70 rounded-lg p-5 border border-wellness-softGreen/30">
                <div className="mb-6">
                  <div className="flex bg-wellness-softGreen/20 rounded-lg mb-4 overflow-hidden">
                    <button 
                      onClick={() => setCalculatorMode('bedtime')} 
                      className={`flex-1 py-2 px-4 text-center ${calculatorMode === 'bedtime' ? 'bg-wellness-mediumGreen text-white' : 'text-wellness-darkGreen'}`}
                    >
                      <span className="flex items-center justify-center">
                        <Moon className="h-4 w-4 mr-1" />
                        Find Bedtime
                      </span>
                    </button>
                    <button 
                      onClick={() => setCalculatorMode('waketime')} 
                      className={`flex-1 py-2 px-4 text-center ${calculatorMode === 'waketime' ? 'bg-wellness-mediumGreen text-white' : 'text-wellness-darkGreen'}`}
                    >
                      <span className="flex items-center justify-center">
                        <Sun className="h-4 w-4 mr-1" />
                        Find Wake Time
                      </span>
                    </button>
                  </div>
                  
                  {calculatorMode === 'bedtime' ? (
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label htmlFor="wakeupTime" className="block text-sm font-medium text-wellness-charcoal mb-1">
                          I need to wake up at
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <AlarmClock className="h-4 w-4 text-wellness-charcoal" />
                          </div>
                          <input 
                            type="time" 
                            id="wakeupTime" 
                            value={wakeupTime} 
                            onChange={(e) => setWakeupTime(e.target.value)} 
                            className="w-full pl-10 px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          />
                        </div>
                      </div>
                      <div>
                        <button 
                          onClick={calculateSleepTimes} 
                          className="w-full md:w-auto bg-wellness-darkGreen text-white py-2 px-6 rounded-lg hover:bg-wellness-mediumGreen transition-colors"
                        >
                          Calculate Bedtime
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label htmlFor="bedTime" className="block text-sm font-medium text-wellness-charcoal mb-1">
                          I plan to go to bed at
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <BedDouble className="h-4 w-4 text-wellness-charcoal" />
                          </div>
                          <input 
                            type="time" 
                            id="bedTime" 
                            value={bedTime} 
                            onChange={(e) => setBedTime(e.target.value)} 
                            className="w-full pl-10 px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="sleepCycles" className="block text-sm font-medium text-wellness-charcoal mb-1">
                          Sleep cycles (4-6 recommended)
                        </label>
                        <input 
                          type="range" 
                          id="sleepCycles" 
                          min="3" 
                          max="7" 
                          step="1" 
                          value={sleepCycles} 
                          onChange={(e) => setSleepCycles(parseInt(e.target.value))} 
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-wellness-charcoal">
                          <span>3 cycles</span>
                          <span>5 cycles</span>
                          <span>7 cycles</span>
                        </div>
                      </div>
                      <div>
                        <button 
                          onClick={calculateSleepTimes} 
                          className="w-full md:w-auto bg-wellness-darkGreen text-white py-2 px-6 rounded-lg hover:bg-wellness-mediumGreen transition-colors"
                        >
                          Calculate Wake Time
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Results */}
                {calculatedTimes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-wellness-darkGreen mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-wellness-mediumGreen" />
                      {calculatorMode === 'bedtime' ? 'Recommended Bedtimes' : 'Optimal Wake-up Time'}
                    </h4>
                    
                    {calculatorMode === 'bedtime' ? (
                      <div className="bg-wellness-softGreen/10 p-4 rounded-lg mb-4">
                        <p className="text-sm text-wellness-charcoal mb-2">For the best sleep quality, go to bed at one of these times:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {calculatedTimes.map((time, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 text-center border border-wellness-softGreen/30">
                              <p className="text-xl font-bold text-wellness-darkGreen">{time}</p>
                              <p className="text-xs text-wellness-charcoal">
                                {index === 0 ? '4 cycles • 6h' : index === 1 ? '5 cycles • 7.5h' : '6 cycles • 9h'}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-wellness-charcoal mt-2">These times account for the average 15 minutes it takes to fall asleep.</p>
                      </div>
                    ) : (
                      <div className="bg-wellness-softGreen/10 p-4 rounded-lg mb-4">
                        <p className="text-sm text-wellness-charcoal mb-2">Based on your bedtime, you should wake up at:</p>
                        <div className="bg-white rounded-lg p-3 text-center border border-wellness-softGreen/30">
                          <p className="text-xl font-bold text-wellness-darkGreen">{calculatedTimes[0]}</p>
                          <p className="text-xs text-wellness-charcoal">
                            {sleepCycles} cycles • {Math.round((sleepCycles * 90 + 15) / 60 * 10) / 10}h
                          </p>
                        </div>
                        <p className="text-xs text-wellness-charcoal mt-2">This time accounts for the average 15 minutes it takes to fall asleep.</p>
                      </div>
                    )}
                    
                    {/* Sleep Advice */}
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-wellness-darkGreen mb-3 flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-wellness-mediumGreen" />
                        Sleep Tips
                      </h4>
                      <div className="space-y-3">
                        {sleepAdvice.map((advice, index) => (
                          <div key={index} className={`p-3 rounded-lg flex items-start ${
                            advice.type === 'warning' ? 'bg-amber-50' : 
                            advice.type === 'success' ? 'bg-green-50' : 
                            advice.type === 'tip' ? 'bg-blue-50' : 'bg-violet-50'
                          }`}>
                            <div className="flex-shrink-0 mr-3 mt-1">
                              {advice.icon}
                            </div>
                            <p className="text-sm text-wellness-charcoal">{advice.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main content tabs */}
          <div className="glass-panel p-6">
            <div className="flex border-b border-wellness-softGreen/30 mb-6">
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-3 px-4 font-medium ${activeTab === 'insights' ? 'text-wellness-darkGreen border-b-2 border-wellness-mediumGreen' : 'text-wellness-charcoal'}`}
              >
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Insights
                </span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 px-4 font-medium ${activeTab === 'history' ? 'text-wellness-darkGreen border-b-2 border-wellness-mediumGreen' : 'text-wellness-charcoal'}`}
              >
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  History
                </span>
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`pb-3 px-4 font-medium ${activeTab === 'trends' ? 'text-wellness-darkGreen border-b-2 border-wellness-mediumGreen' : 'text-wellness-charcoal'}`}
              >
                <span className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Trends
                </span>
              </button>
            </div>
            
            {/* Tab content */}
            {activeTab === 'insights' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wellness-mediumGreen mx-auto"></div>
                    <p className="mt-2 text-wellness-charcoal">Analyzing your sleep data...</p>
                  </div>
                ) : sleepData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-wellness-charcoal">Add sleep data to get personalized insights!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg flex items-start ${
                          insight.type === 'warning' ? 'bg-amber-50' : 
                          insight.type === 'success' ? 'bg-green-50' : 
                          insight.type === 'tip' ? 'bg-blue-50' : 'bg-violet-50'
                        }`}
                      >
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {insight.icon}
                        </div>
                        <div>
                          <p className="text-wellness-charcoal">{insight.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'history' && (
              <div>
                {sleepData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-wellness-charcoal">No sleep data recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...sleepData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => (
                      <div key={session.id} className="bg-white bg-opacity-70 rounded-lg p-4 border border-wellness-softGreen/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-wellness-darkGreen">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                            <div className="flex items-center text-sm text-wellness-charcoal mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {session.bedTime} - {session.wakeTime} ({formatDuration(session.duration)})
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-wellness-softGreen/20 text-wellness-darkGreen">
                              {session.quality}
                            </div>
                            <div className={`text-sm font-medium mt-1 ${getSleepScoreColor(calculateSleepScore(session))}`}>
                              Score: {calculateSleepScore(session)}
                            </div>
                          </div>
                        </div>
                        
                        {session.factors.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-wellness-charcoal mb-1">Factors affecting sleep:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.factors.map(factor => (
                                <span key={factor} className="text-xs bg-wellness-softGreen/10 text-wellness-darkGreen px-2 py-0.5 rounded">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {session.notes && (
                          <div className="mt-3">
                            <p className="text-xs text-wellness-charcoal mb-1">Notes:</p>
                            <p className="text-sm text-wellness-charcoal bg-wellness-softGreen/5 p-2 rounded">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'trends' && (
              <div>
                {chartData.length < 2 ? (
                  <div className="text-center py-8">
                    <p className="text-wellness-charcoal">Need more data to show trends. Add at least two sleep records.</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white bg-opacity-80 rounded-lg p-4 border border-wellness-softGreen/30 mb-6">
                      <h4 className="font-medium text-wellness-darkGreen mb-4">Sleep Duration Over Time</h4>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#4b5563" />
                            <YAxis tickFormatter={(value) => `${value}h`} stroke="#4b5563" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="duration" name="Duration (hours)" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
                            <Line type="monotone" dataKey="sleepScore" name="Sleep Score" stroke="#10b981" dot={{ r: 4 }} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white bg-opacity-80 rounded-lg p-4 border border-wellness-softGreen/30">
                        <h4 className="font-medium text-wellness-darkGreen mb-2">Sleep Quality Distribution</h4>
                        <p className="text-sm text-wellness-charcoal mb-4">How often you experience different sleep quality levels</p>
                        
                        {/* Simple bar chart showing quality distribution */}
                        <div className="space-y-3">
                          {['Restful', 'Good', 'Average', 'Light', 'Disturbed', 'Poor'].map(quality => {
                            const count = sleepData.filter(s => s.quality === quality).length;
                            const percentage = sleepData.length > 0 ? Math.round((count / sleepData.length) * 100) : 0;
                            
                            return (
                              <div key={quality} className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium text-wellness-charcoal">{quality}</span>
                                  <span className="text-wellness-charcoal">{percentage}% ({count})</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      quality === 'Restful' ? 'bg-green-500' : 
                                      quality === 'Good' ? 'bg-emerald-500' : 
                                      quality === 'Average' ? 'bg-teal-500' : 
                                      quality === 'Light' ? 'bg-yellow-500' : 
                                      quality === 'Disturbed' ? 'bg-orange-500' : 
                                      'bg-red-500'
                                    }`} 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="bg-white bg-opacity-80 rounded-lg p-4 border border-wellness-softGreen/30">
                        <h4 className="font-medium text-wellness-darkGreen mb-2">Common Sleep Factors</h4>
                        <p className="text-sm text-wellness-charcoal mb-4">Factors that may be affecting your sleep</p>
                        
                        {/* Factors chart */}
                        <div className="space-y-3">
                          {(() => {
                            const factorCounts: Record<string, number> = {};
                            sleepData.forEach(session => {
                              session.factors.forEach(factor => {
                                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
                              });
                            });
                            
                            const sortedFactors = Object.entries(factorCounts)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 6);
                            
                            if (sortedFactors.length === 0) {
                              return <p className="text-sm text-wellness-charcoal">No factors recorded yet.</p>;
                            }
                            
                            return sortedFactors.map(([factor, count]) => {
                              const percentage = Math.round((count / sleepData.length) * 100);
                              const isNegative = ['Caffeine', 'Alcohol', 'Screen time', 'Stress', 'Noise'].includes(factor);
                              
                              return (
                                <div key={factor} className="relative">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-wellness-charcoal">{factor}</span>
                                    <span className="text-wellness-charcoal">{percentage}% ({count})</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded overflow-hidden">
                                    <div 
                                      className={isNegative ? 'bg-amber-500 h-full' : 'bg-emerald-500 h-full'} 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Add Sleep Data Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-wellness-darkGreen">Add Sleep Data</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-wellness-charcoal hover:text-wellness-darkGreen">
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {/* Date */}
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
                          className="w-full px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          required
                        />
                      </div>
                      
                      {/* Bed Time */}
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
                          className="w-full px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          required
                        />
                      </div>
                      
                      {/* Wake Time */}
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
                          className="w-full px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          required
                        />
                      </div>
                      
                      {/* Sleep Quality */}
                      <div>
                        <label htmlFor="quality" className="block text-sm font-medium text-wellness-charcoal mb-1">
                          Sleep Quality
                        </label>
                        <select
                          id="quality"
                          name="quality"
                          value={formData.quality}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          required
                        >
                          <option value="Restful">Restful - Woke up completely refreshed</option>
                          <option value="Good">Good - Woke up feeling rested</option>
                          <option value="Average">Average - Felt okay upon waking</option>
                          <option value="Light">Light - Sleep was not deep enough</option>
                          <option value="Disturbed">Disturbed - Woke up multiple times</option>
                          <option value="Poor">Poor - Barely slept, feel exhausted</option>
                        </select>
                      </div>
                      
                      {/* Factors affecting sleep */}
                      <div>
                        <label className="block text-sm font-medium text-wellness-charcoal mb-1">
                          Factors affecting sleep (select all that apply)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Caffeine', 'Alcohol', 'Exercise', 'Screen time', 'Stress', 'Meditation', 'Reading', 'Noise', 'Temperature', 'Late meal'].map(factor => (
                            <div key={factor} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`factor-${factor}`}
                                checked={formData.factors.includes(factor)}
                                onChange={() => handleFactorToggle(factor)}
                                className="h-4 w-4 text-wellness-mediumGreen rounded border-wellness-softGreen focus:ring-wellness-mediumGreen"
                              />
                              <label htmlFor={`factor-${factor}`} className="ml-2 text-sm text-wellness-charcoal">
                                {factor}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-wellness-charcoal mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-wellness-softGreen/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen"
                          placeholder="Any additional notes about your sleep..."
                        />
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full bg-wellness-darkGreen text-white py-2 px-4 rounded-lg hover:bg-wellness-mediumGreen transition-colors"
                        >
                          Save Sleep Data
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SleepTracker;
