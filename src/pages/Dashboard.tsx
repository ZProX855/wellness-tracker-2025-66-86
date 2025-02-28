
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { 
  ArrowLeft, 
  User, 
  BarChart3, 
  FileDown, 
  Trash2, 
  Flame, 
  Apple, 
  Camera, 
  Heart, 
  Moon, 
  Calendar, 
  Clock
} from 'lucide-react';
import { BMIRecord, FoodComparison, MealRecord, SleepRecord, UserData } from '../types/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Dashboard: React.FC = () => {
  const { user, getUserData, resetUserProgress } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bmi' | 'food' | 'meals' | 'sleep'>('overview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const data = await getUserData();
          setUserData(data);
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
      } catch (error) {
        console.error('Error resetting progress:', error);
      }
    }
  };
  
  const generatePDF = async () => {
    if (!userData) return;
    
    try {
      setIsGeneratingPdf(true);
      
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
    } catch (error) {
      console.error('Error generating PDF:', error);
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2">My Wellness Dashboard</h1>
              <p className="text-wellness-charcoal">
                Track your progress and view your wellness history
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={generatePDF}
                className="inline-flex items-center justify-center bg-wellness-softGreen hover:bg-wellness-mediumGreen text-wellness-darkGreen px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
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
                    Download Report
                  </>
                )}
              </button>
              
              <button 
                onClick={handleResetProgress}
                className="inline-flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Progress
              </button>
              
              <Link 
                to="/dashboard/profile"
                className="inline-flex items-center justify-center bg-white border border-wellness-softGreen/40 hover:bg-wellness-softGreen/20 text-wellness-darkGreen px-4 py-2 rounded-lg transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="border-b border-wellness-softGreen/30 mb-8">
            <div className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-wellness-darkGreen text-wellness-darkGreen'
                    : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline-block mr-2" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('bmi')}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'bmi'
                    ? 'border-wellness-darkGreen text-wellness-darkGreen'
                    : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                }`}
              >
                <Heart className="h-4 w-4 inline-block mr-2" />
                BMI History
              </button>
              
              <button
                onClick={() => setActiveTab('food')}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'food'
                    ? 'border-wellness-darkGreen text-wellness-darkGreen'
                    : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                }`}
              >
                <Apple className="h-4 w-4 inline-block mr-2" />
                Food Comparisons
              </button>
              
              <button
                onClick={() => setActiveTab('meals')}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'meals'
                    ? 'border-wellness-darkGreen text-wellness-darkGreen'
                    : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                }`}
              >
                <Camera className="h-4 w-4 inline-block mr-2" />
                Meal Records
              </button>
              
              <button
                onClick={() => setActiveTab('sleep')}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'sleep'
                    ? 'border-wellness-darkGreen text-wellness-darkGreen'
                    : 'border-transparent text-wellness-charcoal hover:text-wellness-darkGreen hover:border-wellness-softGreen'
                }`}
              >
                <Moon className="h-4 w-4 inline-block mr-2" />
                Sleep Tracker
              </button>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div id="dashboard-content">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                  <div className="flex items-center">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-wellness-darkGreen font-medium">BMI Records</h3>
                      <p className="text-2xl font-bold text-wellness-charcoal">
                        {userData?.bmiHistory.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                  <div className="flex items-center">
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center">
                      <Apple className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-wellness-darkGreen font-medium">Food Comparisons</h3>
                      <p className="text-2xl font-bold text-wellness-charcoal">
                        {userData?.foodComparisons.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
                  <div className="flex items-center">
                    <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-wellness-darkGreen font-medium">Meal Records</h3>
                      <p className="text-2xl font-bold text-wellness-charcoal">
                        {userData?.mealRecognitions.length || 0}
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
                        {userData?.sleepData.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'bmi' && (
              <div>
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
                              {record.bmi}
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
                      Try BMI Calculator
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'food' && (
              <div>
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
            
            {activeTab === 'meals' && (
              <div>
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
            
            {activeTab === 'sleep' && (
              <div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
