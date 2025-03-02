
import React, { useState, useEffect } from 'react';
import { getWellnessInsights, calculateBMI } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, Droplets, Dumbbell, Apple, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface WellnessState {
  goals: { id: number; text: string; selected: boolean }[];
  recommendations: string[];
  milestones: string[];
  loading: boolean;
  height: number | '';
  weight: number | '';
  bmiResult: BMIResult | null;
  waterIntake: number;
  dietPreference: string;
  trainingPreference: string;
  trainingDays: number;
  finalPlan: {
    diet: string[];
    water: string;
    training: string[];
  } | null;
}

interface BMIResult {
  bmi: string;
  category: string;
  advice: string;
}

// Define an interface for the API response
interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
}

type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

const dietOptions = [
  { value: 'balanced', label: 'Balanced Diet' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'high-protein', label: 'High Protein' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'mediterranean', label: 'Mediterranean' }
];

const trainingOptions = [
  { value: 'cardio', label: 'Cardio Focus' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'flexibility', label: 'Flexibility & Yoga' },
  { value: 'mixed', label: 'Mixed Workouts' },
  { value: 'hiit', label: 'HIIT Workouts' },
  { value: 'lowImpact', label: 'Low Impact' }
];

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
    recommendations: [],
    milestones: [],
    loading: false,
    height: '',
    weight: '',
    bmiResult: null,
    waterIntake: 8,
    dietPreference: 'balanced',
    trainingPreference: 'mixed',
    trainingDays: 3,
    finalPlan: null
  });
  
  const [activeStep, setActiveStep] = useState<JourneyStep>('goals');
  const [showBmiInfo, setShowBmiInfo] = useState(false);
  
  const toggleGoal = (id: number) => {
    setState({
      ...state,
      goals: state.goals.map(goal => 
        goal.id === id ? { ...goal, selected: !goal.selected } : goal
      )
    });
  };
  
  const getSelectedGoals = () => {
    return state.goals.filter(goal => goal.selected).map(goal => goal.text);
  };
  
  const handleContinue = async () => {
    const selectedGoals = getSelectedGoals();
    
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one wellness goal');
      return;
    }
    
    setState({ ...state, loading: true });
    
    try {
      // Explicitly type the result from getWellnessInsights
      const insights = await getWellnessInsights(selectedGoals) as WellnessInsights;
      
      if (insights.recommendations.length === 0 && insights.milestones.length === 0) {
        throw new Error('Failed to generate wellness plan');
      }
      
      setState({
        ...state,
        recommendations: insights.recommendations,
        milestones: insights.milestones,
        loading: false
      });
      
      setActiveStep('bmi');
      toast.success('Your initial wellness insights are ready!');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState({ ...state, loading: false });
      toast.error('Failed to generate wellness plan. Please try again.');
    }
  };

  const calculateUserBMI = async () => {
    if (state.height === '' || state.weight === '') {
      toast.error('Please enter both height and weight');
      return;
    }
    
    if (typeof state.height === 'number' && typeof state.weight === 'number') {
      if (state.height <= 0 || state.weight <= 0) {
        toast.error('Height and weight must be positive values');
        return;
      }
      
      setState({ ...state, loading: true });
      
      try {
        // Call the API to get BMI calculation and AI-generated advice
        const bmiResult = await calculateBMI(state.height, state.weight);
        
        setState({
          ...state,
          bmiResult: bmiResult,
          loading: false
        });
        
        setActiveStep('preferences');
        toast.success('BMI calculated successfully!');
      } catch (error) {
        console.error("BMI calculation error:", error);
        setState({ ...state, loading: false });
        toast.error("Failed to calculate BMI. Please try again.");
      }
    }
  };

  const generateFinalPlan = () => {
    setState({ ...state, loading: true });
    
    // Simulate API call with timeout
    setTimeout(() => {
      const selectedGoals = getSelectedGoals();
      const bmiCategory = state.bmiResult?.category || 'Normal weight';
      
      // Generate personalized plan based on goals, BMI and preferences
      const dietPlan = generateDietPlan(state.dietPreference, bmiCategory);
      const waterPlan = generateWaterPlan(state.waterIntake, state.weight);
      const trainingPlan = generateTrainingPlan(state.trainingPreference, state.trainingDays, bmiCategory);
      
      setState({
        ...state,
        finalPlan: {
          diet: dietPlan,
          water: waterPlan,
          training: trainingPlan
        },
        loading: false
      });
      
      setActiveStep('plan');
      toast.success('Your complete wellness plan is ready!');
    }, 1500);
  };
  
  const generateDietPlan = (preference: string, bmiCategory: string): string[] => {
    const basePlan = [
      "Eat 3-5 servings of vegetables daily",
      "Include lean protein with every meal",
      "Limit processed foods and added sugars",
      "Aim for regular meal times"
    ];
    
    const specificPlans: Record<string, string[]> = {
      'balanced': [
        "Follow a 40/30/30 ratio of carbs/protein/fat",
        "Include a variety of foods from all food groups",
        "Aim for 2-3 servings of fruits daily"
      ],
      'low-carb': [
        "Limit carbohydrates to 50-100g per day",
        "Increase healthy fat intake (avocados, nuts, olive oil)",
        "Focus on non-starchy vegetables"
      ],
      'high-protein': [
        "Consume 1.6-2g of protein per kg of body weight",
        "Include protein source with every meal and snack",
        "Time protein intake around workouts for optimal recovery"
      ],
      'vegetarian': [
        "Ensure adequate protein from eggs, dairy, legumes",
        "Monitor B12 intake and consider supplements",
        "Include a variety of plant proteins"
      ],
      'vegan': [
        "Combine protein sources for complete amino acids",
        "Supplement with B12 and consider vitamin D",
        "Include fortified foods in your diet"
      ],
      'mediterranean': [
        "Base meals on vegetables, fruits, whole grains",
        "Use olive oil as primary fat source",
        "Include fish 2-3 times weekly"
      ]
    };
    
    // Add BMI-specific recommendations
    let bmiRecommendations: string[] = [];
    
    if (bmiCategory === 'Underweight') {
      bmiRecommendations = [
        "Add extra healthy fats for calorie density",
        "Include additional snacks between meals",
        "Consider calorie-dense smoothies"
      ];
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      bmiRecommendations = [
        "Practice portion control using smaller plates",
        "Focus on foods with high water and fiber content",
        "Consider intermittent fasting (consult healthcare provider)"
      ];
    }
    
    return [...basePlan, ...(specificPlans[preference] || []), ...bmiRecommendations];
  };
  
  const generateWaterPlan = (baseIntake: number, weight: number | ''): string => {
    if (typeof weight !== 'number') return `Aim to drink ${baseIntake} glasses (2L) of water daily`;
    
    // Calculate based on weight (30ml per kg)
    const weightBasedLiters = Math.round((weight * 30) / 1000 * 10) / 10;
    const glasses = Math.round(weightBasedLiters * 4); // Assuming 250ml glass
    
    return `Aim to drink ${glasses} glasses (${weightBasedLiters}L) of water daily. Consider using a water tracking app.`;
  };
  
  const generateTrainingPlan = (preference: string, days: number, bmiCategory: string): string[] => {
    const frequencyGuide = `Exercise ${days} days per week, allowing for recovery days between strength sessions.`;
    
    const specificPlans: Record<string, string[]> = {
      'cardio': [
        "30-45 minutes of moderate cardio per session",
        "Mix between running, cycling, swimming, or brisk walking",
        "Include 1 HIIT session weekly for cardiovascular health"
      ],
      'strength': [
        "Full-body strength training 3x per week",
        "Focus on compound movements (squats, deadlifts, presses)",
        "Aim for progressive overload by increasing weights gradually"
      ],
      'flexibility': [
        "Daily 15-minute mobility routine",
        "2-3 full yoga sessions weekly",
        "Include stretching after all workouts"
      ],
      'mixed': [
        "Alternate between cardio and strength days",
        "Include one flexibility-focused day weekly",
        "Vary intensity throughout the week"
      ],
      'hiit': [
        "20-30 minute HIIT sessions 3-4x weekly",
        "Keep rest periods short (30-60 seconds)",
        "Include a mix of bodyweight and weighted exercises"
      ],
      'lowImpact': [
        "Focus on swimming, cycling, or elliptical training",
        "Include resistance band work for strength",
        "Prioritize walking and gentle yoga"
      ]
    };
    
    // Add BMI-specific recommendations
    let bmiRecommendations: string[] = [];
    
    if (bmiCategory === 'Underweight') {
      bmiRecommendations = [
        "Focus more on strength training than cardio",
        "Ensure adequate nutrition before and after workouts",
        "Start with lighter weights and focus on form"
      ];
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      bmiRecommendations = [
        "Start with low-impact activities to protect joints",
        "Gradually increase duration before increasing intensity",
        "Consider working with a fitness professional initially"
      ];
    }
    
    return [frequencyGuide, ...(specificPlans[preference] || []), ...bmiRecommendations];
  };
  
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

  const renderGoalsSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'goals' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-8 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Set Your Wellness Goals</h3>
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
            onClick={handleContinue}
            disabled={getSelectedGoals().length === 0 || state.loading}
            className={`btn-primary rounded-lg flex items-center gap-2 ${
              getSelectedGoals().length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Getting Initial Insights...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Continue to Next Step
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderBMISection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'bmi' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Calculate Your BMI</h3>
          <p className="text-wellness-charcoal">To personalize your plan further, we need to calculate your Body Mass Index (BMI).</p>
          <button 
            onClick={() => setShowBmiInfo(true)}
            className="text-sm text-wellness-mediumGreen underline mt-1 inline-flex items-center"
          >
            <span>What is BMI?</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              value={state.height}
              onChange={(e) => setState({...state, height: e.target.value === '' ? '' : Number(e.target.value)})}
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
              value={state.weight}
              onChange={(e) => setState({...state, weight: e.target.value === '' ? '' : Number(e.target.value)})}
              placeholder="Enter weight in kg"
              className="input-field w-full"
              min="0"
              disabled={state.loading}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-xl border border-wellness-softGreen/30 mb-6">
          <h3 className="text-wellness-darkGreen font-medium mb-3">BMI Categories</h3>
          <div className="flex h-6 rounded-full overflow-hidden mb-2">
            <div className="bg-amber-500 flex-1"></div>
            <div className="bg-green-500 flex-1"></div>
            <div className="bg-amber-600 flex-1"></div>
            <div className="bg-red-500 flex-1"></div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
              <div>Underweight</div>
              <div className="font-medium">{"< 18.5"}</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-green-500 rounded-full mx-auto mb-1"></div>
              <div>Normal</div>
              <div className="font-medium">18.5 - 24.9</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-amber-600 rounded-full mx-auto mb-1"></div>
              <div>Overweight</div>
              <div className="font-medium">25 - 29.9</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-red-500 rounded-full mx-auto mb-1"></div>
              <div>Obese</div>
              <div className="font-medium">≥ 30</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setActiveStep('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Back to Goals
          </button>
          
          <button
            onClick={calculateUserBMI}
            disabled={state.height === '' || state.weight === '' || state.loading}
            className={`btn-primary rounded-lg flex items-center gap-2 ${
              state.height === '' || state.weight === '' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Calculating...
              </>
            ) : (
              <>
                <ArrowRight className="h-5 w-5" />
                Continue
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderPreferencesSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'preferences' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Preferences</h3>
          <p className="text-wellness-charcoal">Customize your wellness plan by providing your preferences.</p>
        </div>
        
        {state.bmiResult && (
          <div className="mb-8 p-5 bg-white bg-opacity-80 rounded-xl border border-wellness-softGreen/30">
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-wellness-darkGreen">{state.bmiResult.bmi}</div>
              <div className={`text-lg font-medium ${getBMICategoryColor(state.bmiResult.category)}`}>
                {state.bmiResult.category}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Diet Preference
              </div>
            </label>
            <select 
              value={state.dietPreference}
              onChange={(e) => setState({...state, dietPreference: e.target.value})}
              className="input-field w-full"
              disabled={state.loading}
            >
              {dietOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Daily Water Intake Goal (glasses)
              </div>
            </label>
            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={state.waterIntake}
              onChange={(e) => setState({...state, waterIntake: Number(e.target.value)})}
              className="w-full h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer"
              disabled={state.loading}
            />
            <div className="flex justify-between text-sm text-wellness-charcoal mt-1">
              <span>4 glasses (1L)</span>
              <span>{state.waterIntake} glasses ({state.waterIntake / 4}L)</span>
              <span>16 glasses (4L)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Training Preference
              </div>
            </label>
            <select 
              value={state.trainingPreference}
              onChange={(e) => setState({...state, trainingPreference: e.target.value})}
              className="input-field w-full"
              disabled={state.loading}
            >
              {trainingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Training Days Per Week
              </div>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={state.trainingDays}
              onChange={(e) => setState({...state, trainingDays: Number(e.target.value)})}
              className="w-full h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer"
              disabled={state.loading}
            />
            <div className="flex justify-between text-sm text-wellness-charcoal mt-1">
              <span>1 day</span>
              <span>{state.trainingDays} days</span>
              <span>6 days</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setActiveStep('bmi')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Back to BMI
          </button>
          
          <button
            onClick={generateFinalPlan}
            disabled={state.loading}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Create My Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderPlanSection = () => {
    if (!state.finalPlan) {
      return null;
    }
    
    return (
      <div className={`transition-opacity duration-500 ${activeStep === 'plan' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Complete Wellness Plan</h3>
          <p className="text-wellness-charcoal">Based on your goals, BMI, and preferences</p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Apple className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Nutrition Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.finalPlan.diet.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Droplets className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Hydration Plan</h4>
            </div>
            
            <div className="p-3 bg-wellness-softGreen/20 rounded-lg">
              <p className="text-wellness-charcoal">{state.finalPlan.water}</p>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Training Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.finalPlan.training.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(index + state.finalPlan.diet.length) * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Leaf className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Wellness Milestones</h4>
            </div>
            
            <ul className="space-y-3">
              {state.milestones.map((milestone, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(index + state.finalPlan.diet.length + state.finalPlan.training.length) * 150}ms` }}
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
            onClick={() => setActiveStep('preferences')}
            className="btn-secondary rounded-lg flex items-center gap-2 mr-4"
          >
            <ChevronDown className="h-5 w-5" />
            Adjust Preferences
          </button>
          
          <button
            onClick={() => window.print()}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            <Activity className="h-5 w-5" />
            Print My Plan
          </button>
        </div>
      </div>
    );
  };
  
  // BMI Info Dialog
  const renderBMIInfoDialog = () => {
    return (
      <Dialog open={showBmiInfo} onOpenChange={setShowBmiInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Body Mass Index (BMI)</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p>
              BMI is a numerical value of your weight in relation to your height. It provides a simple way to classify weight categories that may lead to health problems.
            </p>
            <div className="space-y-2">
              <p className="font-medium">BMI Categories:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <div className="h-3 w-3 bg-amber-500 rounded-full mr-2"></div>
                  <span><strong>Underweight:</strong> BMI less than 18.5</span>
                </li>
                <li className="flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                  <span><strong>Normal weight:</strong> BMI 18.5 to 24.9</span>
                </li>
                <li className="flex items-center">
                  <div className="h-3 w-3 bg-amber-600 rounded-full mr-2"></div>
                  <span><strong>Overweight:</strong> BMI 25 to 29.9</span>
                </li>
                <li className="flex items-center">
                  <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                  <span><strong>Obesity:</strong> BMI 30 or greater</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-wellness-charcoal/80">
              Note: BMI is a useful indicator but doesn't diagnose body fatness or health. Factors like muscle mass, age, and ethnicity can influence its accuracy. Always consult healthcare professionals for comprehensive health assessments.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {/* Progress bar */}
          <div className="absolute h-1 bg-wellness-softGreen/30 w-full top-4 z-0"></div>
          <div 
            className="absolute h-1 bg-wellness-darkGreen transition-all duration-500 top-4 z-0"
            style={{ 
              width: 
                activeStep === 'goals' ? '0%' : 
                activeStep === 'bmi' ? '33%' :
                activeStep === 'preferences' ? '66%' : '100%'
            }}
          ></div>
          
          {/* Step indicators */}
          <div 
            className={`z-10 flex flex-col items-center cursor-pointer ${activeStep === 'goals' ? 'text-wellness-darkGreen' : 'text-wellness-mediumGreen'}`}
            onClick={() => activeStep !== 'goals' && setActiveStep('goals')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 ${activeStep === 'goals' ? 'bg-wellness-darkGreen' : 'bg-wellness-mediumGreen'}`}>
              1
            </div>
            <span className="text-xs font-medium">Goals</span>
          </div>
          
          <div 
            className={`z-10 flex flex-col items-center ${state.recommendations.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${activeStep === 'bmi' ? 'text-wellness-darkGreen' : 'text-wellness-mediumGreen'}`}
            onClick={() => state.recommendations.length > 0 && setActiveStep('bmi')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 ${activeStep === 'bmi' ? 'bg-wellness-darkGreen' : (state.recommendations.length > 0 ? 'bg-wellness-mediumGreen' : 'bg-wellness-softGreen')}`}>
              2
            </div>
            <span className="text-xs font-medium">BMI</span>
          </div>
          
          <div 
            className={`z-10 flex flex-col items-center ${state.bmiResult ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${activeStep === 'preferences' ? 'text-wellness-darkGreen' : 'text-wellness-mediumGreen'}`}
            onClick={() => state.bmiResult && setActiveStep('preferences')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 ${activeStep === 'preferences' ? 'bg-wellness-darkGreen' : (state.bmiResult ? 'bg-wellness-mediumGreen' : 'bg-wellness-softGreen')}`}>
              3
            </div>
            <span className="text-xs font-medium">Preferences</span>
          </div>
          
          <div 
            className={`z-10 flex flex-col items-center ${state.finalPlan ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${activeStep === 'plan' ? 'text-wellness-darkGreen' : 'text-wellness-mediumGreen'}`}
            onClick={() => state.finalPlan && setActiveStep('plan')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 ${activeStep === 'plan' ? 'bg-wellness-darkGreen' : (state.finalPlan ? 'bg-wellness-mediumGreen' : 'bg-wellness-softGreen')}`}>
              4
            </div>
            <span className="text-xs font-medium">Plan</span>
          </div>
        </div>
      </div>
      
      {renderGoalsSection()}
      {renderBMISection()}
      {renderPreferencesSection()}
      {renderPlanSection()}
      {renderBMIInfoDialog()}
    </div>
  );
};

export default WellnessJourney;
