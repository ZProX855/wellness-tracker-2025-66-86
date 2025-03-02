
import React, { useState } from 'react';
import { getWellnessInsights, calculateBMI } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, Droplets, Dumbbell, Apple, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Define journey steps
type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

interface WellnessState {
  goals: { id: number; text: string; selected: boolean }[];
  bmi: {
    height: number | '';
    weight: number | '';
    result: {
      bmi: string;
      category: string;
      advice: string;
    } | null;
  };
  preferences: {
    dietaryPreferences: string[];
    waterIntakeGoal: number;
    exerciseFrequency: number;
    sleepGoal: number;
    selectedDietaryPreferences: string[];
    selectedExerciseTypes: string[];
  };
  recommendations: string[];
  milestones: string[];
  dietPlan: string[];
  waterPlan: string[];
  workoutPlan: string[];
  loading: boolean;
}

// Define an interface for the API response
interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
  dietPlan?: string[];
  waterPlan?: string[];
  workoutPlan?: string[];
}

const WellnessJourney: React.FC = () => {
  const [state, setState] = useState<WellnessState>({
    goals: [
      { id: 1, text: 'Eat healthier meals', selected: false },
      { id: 2, text: 'Improve fitness level', selected: false },
      { id: 3, text: 'Lose weight', selected: false },
      { id: 4, text: 'Gain muscle', selected: false },
      { id: 5, text: 'Get better sleep', selected: false },
      { id: 6, text: 'Reduce stress', selected: false },
    ],
    bmi: {
      height: '',
      weight: '',
      result: null
    },
    preferences: {
      dietaryPreferences: [
        'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 
        'Mediterranean', 'Low-carb', 'Low-fat', 'Gluten-free', 'Dairy-free'
      ],
      waterIntakeGoal: 8,
      exerciseFrequency: 3,
      sleepGoal: 8,
      selectedDietaryPreferences: [],
      selectedExerciseTypes: []
    },
    recommendations: [],
    milestones: [],
    dietPlan: [],
    waterPlan: [],
    workoutPlan: [],
    loading: false
  });
  
  const [activeStep, setActiveStep] = useState<JourneyStep>('goals');
  
  // Toggle goal selection
  const toggleGoal = (id: number) => {
    setState({
      ...state,
      goals: state.goals.map(goal => 
        goal.id === id ? { ...goal, selected: !goal.selected } : goal
      )
    });
  };
  
  // Get selected goals
  const getSelectedGoals = () => {
    return state.goals.filter(goal => goal.selected).map(goal => goal.text);
  };
  
  // Handle BMI calculator inputs
  const handleBMIInput = (field: 'height' | 'weight', value: number | '') => {
    setState({
      ...state,
      bmi: {
        ...state.bmi,
        [field]: value
      }
    });
  };
  
  // Calculate BMI
  const handleCalculateBMI = async () => {
    const { height, weight } = state.bmi;
    
    if (height === '' || weight === '') {
      toast.error('Please enter both height and weight');
      return;
    }
    
    if (typeof height === 'number' && typeof weight === 'number') {
      if (height <= 0 || weight <= 0) {
        toast.error('Height and weight must be positive values');
        return;
      }
      
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        // Call the API to get BMI calculation and AI-generated advice
        const bmiResult = await calculateBMI(height, weight);
        
        setState(prev => ({
          ...prev,
          bmi: {
            ...prev.bmi,
            result: bmiResult
          },
          loading: false
        }));
        
        toast.success('BMI calculated successfully');
      } catch (error) {
        console.error("BMI calculation error:", error);
        toast.error("Failed to calculate BMI. Please try again.");
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  };
  
  // Handle preferences changes
  const toggleDietaryPreference = (preference: string) => {
    const currentPreferences = state.preferences.selectedDietaryPreferences;
    
    setState({
      ...state,
      preferences: {
        ...state.preferences,
        selectedDietaryPreferences: currentPreferences.includes(preference)
          ? currentPreferences.filter(p => p !== preference)
          : [...currentPreferences, preference]
      }
    });
  };
  
  const toggleExerciseType = (exerciseType: string) => {
    const currentTypes = state.preferences.selectedExerciseTypes;
    
    setState({
      ...state,
      preferences: {
        ...state.preferences,
        selectedExerciseTypes: currentTypes.includes(exerciseType)
          ? currentTypes.filter(t => t !== exerciseType)
          : [...currentTypes, exerciseType]
      }
    });
  };
  
  const updatePreference = (
    field: 'waterIntakeGoal' | 'exerciseFrequency' | 'sleepGoal', 
    value: number
  ) => {
    setState({
      ...state,
      preferences: {
        ...state.preferences,
        [field]: value
      }
    });
  };
  
  // Generate comprehensive wellness plan
  const generatePlan = async () => {
    const selectedGoals = getSelectedGoals();
    
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one wellness goal');
      return;
    }
    
    if (!state.bmi.result) {
      toast.error('Please calculate your BMI first');
      return;
    }
    
    setState({ ...state, loading: true });
    
    try {
      // Prepare payload with all user data
      const userData = {
        goals: selectedGoals,
        bmi: state.bmi.result,
        preferences: {
          dietaryPreferences: state.preferences.selectedDietaryPreferences,
          exerciseTypes: state.preferences.selectedExerciseTypes,
          waterIntakeGoal: state.preferences.waterIntakeGoal,
          exerciseFrequency: state.preferences.exerciseFrequency,
          sleepGoal: state.preferences.sleepGoal
        }
      };
      
      // Get personalized wellness insights
      const insights = await getWellnessInsights(selectedGoals, userData) as WellnessInsights;
      
      if (!insights || (!insights.recommendations && !insights.milestones)) {
        throw new Error('Failed to generate wellness plan');
      }
      
      setState({
        ...state,
        recommendations: insights.recommendations || [],
        milestones: insights.milestones || [],
        dietPlan: insights.dietPlan || [],
        waterPlan: insights.waterPlan || [],
        workoutPlan: insights.workoutPlan || [],
        loading: false
      });
      
      setActiveStep('plan');
      toast.success('Your personalized wellness plan is ready!');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState({ ...state, loading: false });
      toast.error('Failed to generate wellness plan. Please try again.');
    }
  };
  
  // Navigation functions
  const goToNextStep = () => {
    if (activeStep === 'goals') {
      if (getSelectedGoals().length === 0) {
        toast.error('Please select at least one wellness goal');
        return;
      }
      setActiveStep('bmi');
    } else if (activeStep === 'bmi') {
      if (!state.bmi.result) {
        toast.error('Please calculate your BMI first');
        return;
      }
      setActiveStep('preferences');
    } else if (activeStep === 'preferences') {
      generatePlan();
    }
  };
  
  const goToPreviousStep = () => {
    if (activeStep === 'bmi') {
      setActiveStep('goals');
    } else if (activeStep === 'preferences') {
      setActiveStep('bmi');
    } else if (activeStep === 'plan') {
      setActiveStep('preferences');
    }
  };
  
  // Helper function to get BMI category color
  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'text-amber-500';
      case 'Normal weight':
        return 'text-green-500';
      case 'Overweight':
        return 'text-amber-600';
      case 'Obese':
        return 'text-red-500';
      default:
        return 'text-wellness-darkGreen';
    }
  };
  
  // Step 1: Goals Selection
  const renderGoalsSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'goals' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-8 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Step 1: Set Your Wellness Goals</h3>
          <p className="text-wellness-charcoal">Select all the goals that apply to you to create your personalized wellness journey.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {state.goals.map((goal, index) => (
            <div 
              key={goal.id}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer opacity-0 animate-fade-in ${ 
                goal.selected 
                  ? 'bg-wellness-darkGreen border-wellness-darkGreen text-white' 
                  : 'bg-white bg-opacity-60 border-wellness-softGreen hover:border-wellness-mediumGreen'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="flex items-center">
                {goal.selected ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : (
                  <div className="h-5 w-5 border border-wellness-mediumGreen rounded-full mr-2"></div>
                )}
                <span className={goal.selected ? 'font-medium' : ''}>{goal.text}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={goToNextStep}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            Continue to BMI Calculator
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };
  
  // Step 2: BMI Calculator
  const renderBMISection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'bmi' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Step 2: Calculate Your BMI</h3>
          <p className="text-wellness-charcoal">Knowing your Body Mass Index helps us create a more personalized plan for you.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              value={state.bmi.height}
              onChange={(e) => handleBMIInput('height', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter height in cm"
              className="input-field w-full"
              min="0"
              disabled={state.loading}
            />
          </div>
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              value={state.bmi.weight}
              onChange={(e) => handleBMIInput('weight', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter weight in kg"
              className="input-field w-full"
              min="0"
              disabled={state.loading}
            />
          </div>
        </div>
        
        <button
          onClick={handleCalculateBMI}
          disabled={state.loading}
          className="btn-secondary rounded-lg w-full mb-6 flex items-center justify-center gap-2"
        >
          {state.loading ? (
            <>
              <div className="w-5 h-5 border-2 border-wellness-darkGreen border-t-transparent rounded-full animate-spin"></div>
              Calculating...
            </>
          ) : (
            <>
              Calculate BMI
            </>
          )}
        </button>
        
        {state.bmi.result && (
          <div className="my-6 overflow-hidden animate-fade-in">
            <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-wellness-darkGreen">{state.bmi.result.bmi}</div>
                <div className={`text-xl font-medium ${getBMICategoryColor(state.bmi.result.category)}`}>
                  {state.bmi.result.category}
                </div>
              </div>
              
              <div className="p-4 bg-wellness-softGreen/30 rounded-lg">
                <h4 className="font-medium text-wellness-darkGreen mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Personalized Advice
                </h4>
                <p className="text-wellness-charcoal whitespace-pre-line text-sm">{state.bmi.result.advice}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={goToPreviousStep}
            className="btn-outline rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
            Back to Goals
          </button>
          
          <button
            onClick={goToNextStep}
            disabled={!state.bmi.result}
            className={`btn-primary rounded-lg flex items-center gap-2 ${
              !state.bmi.result ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Continue to Preferences
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };
  
  // Step 3: Additional Preferences
  const renderPreferencesSection = () => {
    const exerciseTypes = [
      'Walking', 'Running', 'Swimming', 'Cycling', 'Weight Training', 
      'Yoga', 'HIIT', 'Pilates', 'Dance', 'Sports'
    ];
    
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'preferences' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Step 3: Your Preferences</h3>
          <p className="text-wellness-charcoal">Tell us more about what works for you to further personalize your plan.</p>
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg text-wellness-darkGreen font-medium mb-3 flex items-center">
            <Apple className="h-5 w-5 mr-2" />
            Dietary Preferences
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {state.preferences.dietaryPreferences.map((preference, index) => (
              <div 
                key={index}
                onClick={() => toggleDietaryPreference(preference)}
                className={`p-3 rounded-lg border text-center cursor-pointer text-sm transition-all ${
                  state.preferences.selectedDietaryPreferences.includes(preference)
                    ? 'bg-wellness-darkGreen text-white border-wellness-darkGreen'
                    : 'bg-white bg-opacity-70 border-wellness-softGreen hover:border-wellness-mediumGreen'
                }`}
              >
                {preference}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg text-wellness-darkGreen font-medium mb-3 flex items-center">
            <Dumbbell className="h-5 w-5 mr-2" />
            Exercise Preferences
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {exerciseTypes.map((type, index) => (
              <div 
                key={index}
                onClick={() => toggleExerciseType(type)}
                className={`p-3 rounded-lg border text-center cursor-pointer text-sm transition-all ${
                  state.preferences.selectedExerciseTypes.includes(type)
                    ? 'bg-wellness-darkGreen text-white border-wellness-darkGreen'
                    : 'bg-white bg-opacity-70 border-wellness-softGreen hover:border-wellness-mediumGreen'
                }`}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h4 className="text-lg text-wellness-darkGreen font-medium mb-3 flex items-center">
              <Droplets className="h-5 w-5 mr-2" />
              Water Intake Goal
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="4"
                max="16"
                step="1"
                value={state.preferences.waterIntakeGoal}
                onChange={(e) => updatePreference('waterIntakeGoal', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-wellness-darkGreen font-medium">{state.preferences.waterIntakeGoal} glasses</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-wellness-darkGreen font-medium mb-3 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Weekly Exercise
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={state.preferences.exerciseFrequency}
                onChange={(e) => updatePreference('exerciseFrequency', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-wellness-darkGreen font-medium">{state.preferences.exerciseFrequency} days/week</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-wellness-darkGreen font-medium mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Sleep Goal
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="10"
                step="0.5"
                value={state.preferences.sleepGoal}
                onChange={(e) => updatePreference('sleepGoal', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-wellness-darkGreen font-medium">{state.preferences.sleepGoal} hours</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={goToPreviousStep}
            className="btn-outline rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
            Back to BMI
          </button>
          
          <button
            onClick={generatePlan}
            disabled={state.loading}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Your Plan...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Generate My Wellness Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Step 4: Personalized Plan
  const renderPlanSection = () => {
    if (state.recommendations.length === 0 && state.milestones.length === 0) {
      return null;
    }
    
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'plan' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Personalized Wellness Journey</h3>
          <p className="text-wellness-charcoal">
            Based on your BMI ({state.bmi.result?.bmi} - {state.bmi.result?.category}) 
            and your goals: {getSelectedGoals().join(', ')}
          </p>
        </div>
        
        {/* Diet Plan Section */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Apple className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Nutrition Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.dietPlan.length > 0 ? (
                state.dietPlan.map((item, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                    <p className="text-wellness-charcoal">{item}</p>
                  </li>
                ))
              ) : (
                <li className="text-wellness-charcoal italic">No specific diet plan available</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Water Plan Section */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Droplets className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Hydration Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.waterPlan.length > 0 ? (
                state.waterPlan.map((item, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                    <p className="text-wellness-charcoal">{item}</p>
                  </li>
                ))
              ) : (
                <li className="text-wellness-charcoal italic">No specific hydration plan available</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Workout Plan Section */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Workout Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.workoutPlan.length > 0 ? (
                state.workoutPlan.map((item, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                    <p className="text-wellness-charcoal">{item}</p>
                  </li>
                ))
              ) : (
                <li className="text-wellness-charcoal italic">No specific workout plan available</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* General Recommendations */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Leaf className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">General Recommendations</h4>
            </div>
            
            <ul className="space-y-3">
              {state.recommendations.map((recommendation, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Milestones */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Activity className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Milestones to Expect</h4>
            </div>
            
            <ul className="space-y-3">
              {state.milestones.map((milestone, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(index + state.recommendations.length) * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{milestone}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setActiveStep('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Start a New Journey
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      <div className="flex justify-between mb-8">
        <div 
          className={`flex items-center cursor-pointer ${activeStep === 'goals' ? 'text-wellness-darkGreen font-medium' : 'text-wellness-charcoal/70'}`}
          onClick={() => activeStep !== 'goals' && setActiveStep('goals')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep === 'goals' ? 'bg-wellness-darkGreen text-white' : 'bg-gray-100'}`}>1</div>
          <span className="hidden sm:inline">Goals</span>
        </div>
        <div className="w-full max-w-[50px] h-[2px] bg-gray-200 self-center mx-1"></div>
        <div 
          className={`flex items-center cursor-pointer ${activeStep === 'bmi' ? 'text-wellness-darkGreen font-medium' : 'text-wellness-charcoal/70'}`}
          onClick={() => getSelectedGoals().length > 0 && activeStep !== 'bmi' && setActiveStep('bmi')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep === 'bmi' ? 'bg-wellness-darkGreen text-white' : 'bg-gray-100'}`}>2</div>
          <span className="hidden sm:inline">BMI</span>
        </div>
        <div className="w-full max-w-[50px] h-[2px] bg-gray-200 self-center mx-1"></div>
        <div 
          className={`flex items-center cursor-pointer ${activeStep === 'preferences' ? 'text-wellness-darkGreen font-medium' : 'text-wellness-charcoal/70'}`}
          onClick={() => state.bmi.result && activeStep !== 'preferences' && setActiveStep('preferences')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep === 'preferences' ? 'bg-wellness-darkGreen text-white' : 'bg-gray-100'}`}>3</div>
          <span className="hidden sm:inline">Preferences</span>
        </div>
        <div className="w-full max-w-[50px] h-[2px] bg-gray-200 self-center mx-1"></div>
        <div 
          className={`flex items-center cursor-pointer ${activeStep === 'plan' ? 'text-wellness-darkGreen font-medium' : 'text-wellness-charcoal/70'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep === 'plan' ? 'bg-wellness-darkGreen text-white' : 'bg-gray-100'}`}>4</div>
          <span className="hidden sm:inline">Plan</span>
        </div>
      </div>
      
      {renderGoalsSection()}
      {renderBMISection()}
      {renderPreferencesSection()}
      {renderPlanSection()}
    </div>
  );
};

export default WellnessJourney;
