
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import TimetableHistoryPanel from '../components/dashboard/TimetableHistoryPanel';
import { 
  BarChart3, 
  User, 
  FileDown, 
  Trash2, 
  Flame, 
  Apple, 
  Camera, 
  Heart, 
  Moon, 
  Calendar,
  Clock,
  ChefHat,
  Brain,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { BMIRecord, FoodComparison, MealRecord, SleepRecord, UserData } from '../types/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Define a type for a Dashboard Tool card
interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
  count?: number;
  countLabel?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  icon, 
  title, 
  description, 
  path, 
  color, 
  count, 
  countLabel 
}) => (
  <div className="relative bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100 group hover:border-wellness-softGreen/50">
    <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('bg-', 'bg-').replace('/700', '/100')} ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
        {count !== undefined && (
          <div className="bg-gray-100 rounded-full py-1 px-2.5 text-xs font-medium text-gray-700">
            {count} {countLabel || ''}
          </div>
        )}
      </div>
      <h3 className="font-medium text-wellness-darkGreen mb-1">{title}</h3>
      <p className="text-sm text-wellness-charcoal mb-3 line-clamp-2">{description}</p>
      <Link 
        to={path} 
        className="inline-flex items-center text-xs font-medium text-wellness-darkGreen hover:text-wellness-mediumGreen group-hover:underline"
      >
        Open <ArrowUpRight className="ml-1 h-3 w-3" />
      </Link>
    </div>
  </div>
);

// Define a type for dashboard stat cards
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, bgColor }) => (
  <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
    <div className="flex items-center">
      <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-wellness-darkGreen font-medium">{title}</h3>
        <p className="text-2xl font-bold text-wellness-charcoal">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, getUserData, resetUserProgress } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bmi' | 'food' | 'meals' | 'sleep' | 'timetable'>('overview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [timetablesLoading, setTimetablesLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const data = await getUserData();
          setUserData(data);
          
          // Fetch timetable history
          const { data: timetableData, error } = await supabase
            .from('timetable_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('Error fetching timetable history:', error);
          } else {
            setTimetables(timetableData || []);
          }
          setTimetablesLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, getUserData]);
  
  const handleResetProgress = async () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      try {
        await resetUserProgress();
        // Refresh user data
        const data = await getUserData();
        setUserData(data);
        toast.success('Progress has been reset successfully');
      } catch (error) {
        console.error('Error resetting progress:', error);
        toast.error('Failed to reset progress');
      }
    }
  };
  
  const generatePDF = async () => {
    if (!userData) return;
    
    try {
      setIsGeneratingPdf(true);
      toast.info('Generating PDF report...');
      
      // Capture the dashboard element
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;
      
      const canvas = await html2canvas(dashboardElement);
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add title
      pdf.setFontSize(22);
      pdf.setTextColor(39, 95, 70); // wellness-darkGreen
      pdf.text('Wellness Tracker Report', 105, 15, { align: 'center' });
      
      // Add user name and date
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80); // wellness-charcoal
      pdf.text(`Generated for: ${user?.name}`, 105, 25, { align: 'center' });
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Add dashboard image
      pdf.addImage(imgData, 'PNG', 0, 35, pdfWidth, pdfHeight);
      
      // Save PDF
      pdf.save(`wellness-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-wellness-softGreen/20 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-medium text-wellness-darkGreen">Welcome, {user?.name}</h1>
                <p className="text-wellness-charcoal mt-1">
                  Track your progress and view your wellness history
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={generatePDF}
                  className="inline-flex items-center justify-center bg-wellness-softGreen hover:bg-wellness-mediumGreen text-wellness-darkGreen px-4 py-2 rounded-lg transition-colors disabled:opacity-70 text-sm"
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-wellness-darkGreen border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Report
                    </>
                  )}
                </button>
                
                <Link 
                  to="/dashboard/profile"
                  className="inline-flex items-center justify-center bg-white border border-wellness-softGreen/40 hover:bg-wellness-softGreen/20 text-wellness-darkGreen px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                
                <button 
                  onClick={handleResetProgress}
                  className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation - Sleek Apple-style design */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto md:overflow-visible scrollbar-hide">
            <div className="inline-flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-wellness-softGreen/20 shadow-sm">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline-block mr-1" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('bmi')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'bmi'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <Heart className="h-4 w-4 inline-block mr-1" />
                BMI
              </button>
              
              <button
                onClick={() => setActiveTab('food')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'food'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <Apple className="h-4 w-4 inline-block mr-1" />
                Food
              </button>
              
              <button
                onClick={() => setActiveTab('meals')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'meals'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <Camera className="h-4 w-4 inline-block mr-1" />
                Meals
              </button>
              
              <button
                onClick={() => setActiveTab('sleep')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'sleep'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <Moon className="h-4 w-4 inline-block mr-1" />
                Sleep
              </button>
              
              <button
                onClick={() => setActiveTab('timetable')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'timetable'
                    ? 'bg-wellness-darkGreen text-white shadow-sm'
                    : 'text-wellness-darkGreen hover:bg-wellness-softGreen/20'
                }`}
              >
                <Calendar className="h-4 w-4 inline-block mr-1" />
                Timetable
              </button>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div id="dashboard-content">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Overview - Apple-style clean cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    icon={<Heart className="h-6 w-6" />}
                    title="BMI Records"
                    value={userData?.bmiHistory.length || 0}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  
                  <StatCard 
                    icon={<Apple className="h-6 w-6" />}
                    title="Food Comparisons"
                    value={userData?.foodComparisons.length || 0}
                    color="text-green-600"
                    bgColor="bg-green-50"
                  />
                  
                  <StatCard 
                    icon={<Camera className="h-6 w-6" />}
                    title="Meal Records"
                    value={userData?.mealRecognitions.length || 0}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                  />
                  
                  <StatCard 
                    icon={<Moon className="h-6 w-6" />}
                    title="Sleep Entries"
                    value={userData?.sleepData.length || 0}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />
                </div>
                
                {/* Tools Section */}
                <div>
                  <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Wellness Tools</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ToolCard
                      icon={<Heart className="h-5 w-5" />}
                      title="BMI Calculator"
                      description="Track your Body Mass Index to monitor your health progress"
                      path="/bmi-calculator"
                      color="bg-blue-700"
                      count={userData?.bmiHistory.length || 0}
                      countLabel="records"
                    />
                    
                    <ToolCard
                      icon={<Apple className="h-5 w-5" />}
                      title="Food Comparison"
                      description="Compare nutritional values of different foods to make better choices"
                      path="/food-compare"
                      color="bg-green-700"
                      count={userData?.foodComparisons.length || 0}
                      countLabel="comparisons"
                    />
                    
                    <ToolCard
                      icon={<ChefHat className="h-5 w-5" />}
                      title="Meal Recognition"
                      description="Analyze your meals using AI to get detailed nutritional breakdowns"
                      path="/meal-recognition"
                      color="bg-amber-700"
                      count={userData?.mealRecognitions.length || 0}
                      countLabel="meals"
                    />
                    
                    <ToolCard
                      icon={<Moon className="h-5 w-5" />}
                      title="Sleep Tracker"
                      description="Monitor your sleep patterns and get insights for better rest"
                      path="/sleep-tracker"
                      color="bg-purple-700"
                      count={userData?.sleepData.length || 0}
                      countLabel="entries"
                    />
                    
                    <ToolCard
                      icon={<Calendar className="h-5 w-5" />}
                      title="Timetable Generator"
                      description="Create optimized daily schedules with AI to balance work and wellness"
                      path="/timetable-generator"
                      color="bg-indigo-700"
                      count={timetables.length}
                      countLabel="schedules"
                    />
                    
                    <ToolCard
                      icon={<Brain className="h-5 w-5" />}
                      title="Wellness Journey"
                      description="Follow guided wellness programs tailored to your needs and goals"
                      path="/wellness-journey"
                      color="bg-teal-700"
                    />
                    
                    <ToolCard
                      icon={<MessageSquare className="h-5 w-5" />}
                      title="Chat Assistant"
                      description="Get personalized advice and answers to your wellness questions"
                      path="/chat-assistant"
                      color="bg-cyan-700"
                    />
                  </div>
                </div>
                
                {/* Recent Activity & Timetable History - Two column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TimetableHistoryPanel 
                    timetables={timetables} 
                    isLoading={timetablesLoading} 
                  />
                  
                  {userData?.bmiHistory && userData.bmiHistory.length > 0 ? (
                    <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-wellness-darkGreen">Recent BMI History</h3>
                        <Link 
                          to="/bmi-calculator" 
                          className="text-sm text-wellness-darkGreen hover:text-wellness-mediumGreen flex items-center"
                        >
                          New Check <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                      
                      <div className="space-y-3">
                        {userData.bmiHistory.slice(0, 3).map((record: BMIRecord) => (
                          <div 
                            key={record.id} 
                            className="p-3 bg-wellness-softGreen/10 rounded-lg hover:bg-wellness-softGreen/20 transition-colors"
                          >
                            <div className="flex justify-between">
                              <div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  record.category === 'Normal weight' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.category === 'Underweight' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : record.category === 'Overweight' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.category}
                                </span>
                              </div>
                              <span className="text-xs text-wellness-charcoal">
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="mt-2 flex justify-between items-center">
                              <div className="flex space-x-3">
                                <div>
                                  <span className="text-xs text-wellness-charcoal">Height</span>
                                  <p className="font-medium text-wellness-darkGreen">{record.height} cm</p>
                                </div>
                                <div>
                                  <span className="text-xs text-wellness-charcoal">Weight</span>
                                  <p className="font-medium text-wellness-darkGreen">{record.weight} kg</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-wellness-charcoal">BMI</span>
                                <p className="font-bold text-wellness-darkGreen">{record.bmi.toFixed(1)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-wellness-darkGreen">Recent BMI History</h3>
                      </div>
                      <div className="text-center py-6">
                        <Heart className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                        <h4 className="text-wellness-darkGreen font-medium">No BMI records yet</h4>
                        <p className="text-sm text-wellness-charcoal mb-3">Track your BMI to monitor your health</p>
                        <Link 
                          to="/bmi-calculator" 
                          className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                        >
                          Calculate BMI
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* BMI History Tab */}
            {activeTab === 'bmi' && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">BMI History</h2>
                
                {userData?.bmiHistory && userData.bmiHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-wellness-softGreen/30">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Height (cm)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Weight (kg)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            BMI
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-wellness-charcoal uppercase tracking-wider">
                            Category
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white bg-opacity-50 divide-y divide-wellness-softGreen/20">
                        {userData.bmiHistory.map((record: BMIRecord) => (
                          <tr key={record.id} className="hover:bg-wellness-softGreen/10">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {record.height}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                              {record.weight}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-wellness-darkGreen">
                              {record.bmi.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.category === 'Normal weight' 
                                  ? 'bg-green-100 text-green-800' 
                                  : record.category === 'Underweight' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : record.category === 'Overweight' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-70 rounded-xl p-8 text-center border border-wellness-softGreen/30">
                    <Heart className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                    <h3 className="text-lg font-medium text-wellness-darkGreen mb-2">No BMI records yet</h3>
                    <p className="text-wellness-charcoal mb-4">
                      Use our BMI Calculator to start tracking your body mass index
                    </p>
                    <Link 
                      to="/bmi-calculator" 
                      className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Calculate BMI
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Food Comparison Tab */}
            {activeTab === 'food' && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Food Comparison History</h2>
                
                {userData?.foodComparisons && userData.foodComparisons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.foodComparisons.map((comparison: FoodComparison) => (
                      <div key={comparison.id} className="bg-white bg-opacity-70 rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-wellness-darkGreen">
                            {comparison.food1.name} vs {comparison.food2.name}
                          </h3>
                          <span className="text-xs text-wellness-charcoal">
                            {new Date(comparison.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-green-50 rounded-lg p-3">
                            <h4 className="font-medium text-wellness-darkGreen mb-2">{comparison.food1.name}</h4>
                            <ul className="space-y-1 text-sm">
                              <li className="flex justify-between">
                                <span>Calories:</span>
                                <span className="font-medium">{comparison.food1.calories} kcal</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Protein:</span>
                                <span className="font-medium">{comparison.food1.protein}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Carbs:</span>
                                <span className="font-medium">{comparison.food1.carbs}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Fats:</span>
                                <span className="font-medium">{comparison.food1.fats}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Fiber:</span>
                                <span className="font-medium">{comparison.food1.fiber}g</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="font-medium text-wellness-darkGreen mb-2">{comparison.food2.name}</h4>
                            <ul className="space-y-1 text-sm">
                              <li className="flex justify-between">
                                <span>Calories:</span>
                                <span className="font-medium">{comparison.food2.calories} kcal</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Protein:</span>
                                <span className="font-medium">{comparison.food2.protein}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Carbs:</span>
                                <span className="font-medium">{comparison.food2.carbs}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Fats:</span>
                                <span className="font-medium">{comparison.food2.fats}g</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Fiber:</span>
                                <span className="font-medium">{comparison.food2.fiber}g</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-70 rounded-xl p-8 text-center border border-wellness-softGreen/30">
                    <Apple className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                    <h3 className="text-lg font-medium text-wellness-darkGreen mb-2">No food comparisons yet</h3>
                    <p className="text-wellness-charcoal mb-4">
                      Compare different foods to make informed dietary choices
                    </p>
                    <Link 
                      to="/food-compare" 
                      className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Compare Foods
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Meal Recognition Tab */}
            {activeTab === 'meals' && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Meal Recognition History</h2>
                
                {userData?.mealRecognitions && userData.mealRecognitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.mealRecognitions.map((meal: MealRecord) => (
                      <div key={meal.id} className="bg-white bg-opacity-70 rounded-xl overflow-hidden border border-wellness-softGreen/30 shadow-sm">
                        {meal.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={meal.imageUrl} 
                              alt={meal.foodIdentified} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium text-wellness-darkGreen">
                              {meal.foodIdentified}
                            </h3>
                            <span className="text-xs text-wellness-charcoal">
                              {new Date(meal.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-amber-50 rounded-lg p-2">
                              <span className="block text-xs text-wellness-charcoal">Calories</span>
                              <span className="block font-medium text-wellness-darkGreen">{meal.nutritionInfo.calories}</span>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <span className="block text-xs text-wellness-charcoal">Protein</span>
                              <span className="block font-medium text-wellness-darkGreen">{meal.nutritionInfo.protein}g</span>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-2">
                              <span className="block text-xs text-wellness-charcoal">Carbs</span>
                              <span className="block font-medium text-wellness-darkGreen">{meal.nutritionInfo.carbs}g</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-red-50 rounded-lg p-2">
                              <span className="block text-xs text-wellness-charcoal">Fats</span>
                              <span className="block font-medium text-wellness-darkGreen">{meal.nutritionInfo.fats}g</span>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                              <span className="block text-xs text-wellness-charcoal">Fiber</span>
                              <span className="block font-medium text-wellness-darkGreen">{meal.nutritionInfo.fiber}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-70 rounded-xl p-8 text-center border border-wellness-softGreen/30">
                    <Camera className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                    <h3 className="text-lg font-medium text-wellness-darkGreen mb-2">No meal records yet</h3>
                    <p className="text-wellness-charcoal mb-4">
                      Upload photos of your meals to analyze their nutritional content
                    </p>
                    <Link 
                      to="/meal-recognition" 
                      className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Analyze a Meal
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Sleep Tracking Tab */}
            {activeTab === 'sleep' && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Sleep Tracking History</h2>
                
                {userData?.sleepData && userData.sleepData.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                        <div className="flex items-center">
                          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-wellness-darkGreen font-medium">Average Sleep</h3>
                            <p className="text-2xl font-bold text-wellness-charcoal">
                              {(() => {
                                const totalMinutes = userData.sleepData.reduce((sum, record) => sum + record.duration, 0);
                                const avgMinutes = totalMinutes / userData.sleepData.length;
                                const hours = Math.floor(avgMinutes / 60);
                                const minutes = Math.round(avgMinutes % 60);
                                return `${hours}h ${minutes}m`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                        <div className="flex items-center">
                          <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center">
                            <Moon className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-wellness-darkGreen font-medium">Sleep Entries</h3>
                            <p className="text-2xl font-bold text-wellness-charcoal">
                              {userData.sleepData.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                        <div className="flex items-center">
                          <div className="bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-wellness-darkGreen font-medium">Most Common Quality</h3>
                            <p className="text-2xl font-bold text-wellness-charcoal">
                              {(() => {
                                const qualityCounts: Record<string, number> = {};
                                userData.sleepData.forEach(record => {
                                  qualityCounts[record.quality] = (qualityCounts[record.quality] || 0) + 1;
                                });
                                const sortedQualities = Object.entries(qualityCounts).sort((a, b) => b[1] - a[1]);
                                return sortedQualities.length > 0 ? sortedQualities[0][0] : 'N/A';
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
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
                              Factors
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white bg-opacity-50 divide-y divide-wellness-softGreen/20">
                          {userData.sleepData.map((record: SleepRecord) => (
                            <tr key={record.id} className="hover:bg-wellness-softGreen/10">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                                {record.bedTime} - {record.wakeTime}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-wellness-darkGreen">
                                {(() => {
                                  const hours = Math.floor(record.duration / 60);
                                  const minutes = record.duration % 60;
                                  return `${hours}h ${minutes}m`;
                                })()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  record.quality === 'Restful' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.quality === 'Good' 
                                    ? 'bg-teal-100 text-teal-800'
                                    : record.quality === 'Average' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : record.quality === 'Light' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : record.quality === 'Disturbed' 
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.quality}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-wellness-darkGreen">
                                <div className="flex flex-wrap gap-1">
                                  {record.factors.map(factor => (
                                    <span key={factor} className="px-2 py-0.5 bg-wellness-softGreen/30 rounded-full text-xs">
                                      {factor}
                                    </span>
                                  ))}
                                  {record.factors.length === 0 && <span className="text-wellness-charcoal">None</span>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-70 rounded-xl p-8 text-center border border-wellness-softGreen/30">
                    <Moon className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                    <h3 className="text-lg font-medium text-wellness-darkGreen mb-2">No sleep data yet</h3>
                    <p className="text-wellness-charcoal mb-4">
                      Track your sleep patterns to get personalized insights
                    </p>
                    <Link 
                      to="/sleep-tracker" 
                      className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Track Your Sleep
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Timetable History Tab */}
            {activeTab === 'timetable' && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
                <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Timetable History</h2>
                
                {timetables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {timetables.map((timetable) => (
                      <div 
                        key={timetable.id} 
                        className="bg-white bg-opacity-70 rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm hover:border-wellness-mediumGreen/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-wellness-darkGreen">
                            {timetable.name}
                          </h3>
                          <span className="text-xs text-wellness-charcoal">
                            {new Date(timetable.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {timetable.description && (
                          <p className="text-sm text-wellness-charcoal mb-4">{timetable.description}</p>
                        )}
                        
                        <div className="mb-4">
                          <div className="h-1.5 w-full bg-wellness-softGreen/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-wellness-mediumGreen rounded-full" 
                              style={{ width: `${Object.keys(timetable.schedule).length > 0 ? 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-wellness-charcoal">
                              {Object.keys(timetable.schedule).length} activities
                            </span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/timetable-generator?id=${timetable.id}`}
                          className="w-full inline-flex items-center justify-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          View Timetable
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-70 rounded-xl p-8 text-center border border-wellness-softGreen/30">
                    <Calendar className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
                    <h3 className="text-lg font-medium text-wellness-darkGreen mb-2">No timetables yet</h3>
                    <p className="text-wellness-charcoal mb-4">
                      Create personalized timetables to optimize your daily routine
                    </p>
                    <Link 
                      to="/timetable-generator" 
                      className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Timetable
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
