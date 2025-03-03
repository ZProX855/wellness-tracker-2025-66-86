
import React, { useState, useEffect } from 'react';
import { getWellnessInsights, calculateBMI } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, Droplets, Dumbbell, Apple, ArrowRight, Calendar, Salad, AlarmClock, Brain, Heart, Scale, Sun, Award, Utensils, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useLocalStorage from '../hooks/useLocalStorage';

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

// Define the journey step type
type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

const dietOptions = [
  { value: 'balanced', label: 'Balanced Diet 🍽️', description: 'Even distribution of macronutrients with moderate carbs, protein, and healthy fats' },
  { value: 'low-carb', label: 'Low Carb 🥩', description: 'Reduced carbohydrate intake with focus on proteins and healthy fats' },
  { value: 'high-protein', label: 'High Protein 🥚', description: 'Emphasis on protein sources to support muscle growth and recovery' },
  { value: 'vegetarian', label: 'Vegetarian 🥗', description: 'Plant-based diet that includes dairy and eggs but excludes meat' },
  { value: 'vegan', label: 'Vegan 🌱', description: '100% plant-based diet excluding all animal products' },
  { value: 'mediterranean', label: 'Mediterranean 🫒', description: 'Rich in vegetables, fruits, whole grains, olive oil, and moderate fish' }
];

const trainingOptions = [
  { value: 'cardio', label: 'Cardio Focus 🏃‍♀️', description: 'Emphasizes heart rate-elevating activities like running, cycling, or swimming' },
  { value: 'strength', label: 'Strength Training 🏋️‍♂️', description: 'Focuses on resistance exercises to build muscle and increase strength' },
  { value: 'flexibility', label: 'Flexibility & Yoga 🧘‍♀️', description: 'Prioritizes stretching, mobility work, and mind-body practices' },
  { value: 'mixed', label: 'Mixed Workouts 🤸‍♂️', description: 'Balanced approach combining cardio, strength, and flexibility elements' },
  { value: 'hiit', label: 'HIIT Workouts ⚡', description: 'High-intensity interval training for maximum efficiency in shorter timeframes' },
  { value: 'lowImpact', label: 'Low Impact 🚶‍♀️', description: 'Gentler exercises that minimize stress on joints while providing benefits' }
];

const WellnessJourney: React.FC = () => {
  const [savedState, setSavedState] = useLocalStorage<Partial<WellnessState>>("wellness-journey-state", {});
  
  const [state, setState] = useState<WellnessState>({
    goals: [
      { id: 1, text: 'Eat healthier meals', selected: false },
      { id: 2, text: 'Improve fitness level', selected: false },
      { id: 3, text: 'Lose weight', selected: false },
      { id: 4, text: 'Gain muscle', selected: false },
      { id: 5, text: 'Get better sleep', selected: false },
      { id: 6, text: 'Reduce stress', selected: false },
      { id: 7, text: 'Increase energy levels', selected: false },
      { id: 8, text: 'Improve posture', selected: false },
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
  
  useEffect(() => {
    if (Object.keys(savedState).length > 0) {
      setState(prevState => ({
        ...prevState,
        ...savedState,
        goals: prevState.goals.map(goal => ({
          ...goal,
          selected: savedState.goals?.find(g => g.id === goal.id)?.selected || false
        }))
      }));
      
      if (savedState.finalPlan) {
        setActiveStep('plan');
      } else if (savedState.bmiResult) {
        setActiveStep('preferences');
      } else if (savedState.recommendations && savedState.recommendations.length > 0) {
        setActiveStep('bmi');
      }
    }
  }, [savedState]);
  
  useEffect(() => {
    const stateToSave = {
      goals: state.goals,
      recommendations: state.recommendations,
      milestones: state.milestones,
      height: state.height,
      weight: state.weight,
      bmiResult: state.bmiResult,
      waterIntake: state.waterIntake,
      dietPreference: state.dietPreference,
      trainingPreference: state.trainingPreference,
      trainingDays: state.trainingDays,
      finalPlan: state.finalPlan
    };
    
    setSavedState(stateToSave);
  }, [state, setSavedState]);
  
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
    
    setTimeout(() => {
      const selectedGoals = getSelectedGoals();
      const bmiCategory = state.bmiResult?.category || 'Normal weight';
      
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
      "🥦 Eat 3-5 servings of vegetables daily for essential vitamins and fiber",
      "🍗 Include lean protein with every meal to support muscle maintenance",
      "🚫 Limit processed foods and added sugars to reduce inflammation",
      "⏰ Aim for regular meal times to stabilize your metabolism"
    ];
    
    const specificPlans: Record<string, string[]> = {
      'balanced': [
        "⚖️ Follow a 40/30/30 ratio of carbs/protein/fat for balanced nutrition",
        "🌈 Include a variety of foods from all food groups for complete nutrition",
        "🍎 Aim for 2-3 servings of fruits daily for antioxidants and vitamins"
      ],
      'low-carb': [
        "📉 Limit carbohydrates to 50-100g per day to promote fat utilization",
        "🥑 Increase healthy fat intake (avocados, nuts, olive oil) for energy",
        "🥒 Focus on non-starchy vegetables as your primary carb source"
      ],
      'high-protein': [
        "💪 Consume 1.6-2g of protein per kg of body weight to support muscle growth",
        "🍳 Include protein source with every meal and snack for consistent supply",
        "⏱️ Time protein intake around workouts for optimal recovery and synthesis"
      ],
      'vegetarian': [
        "🧀 Ensure adequate protein from eggs, dairy, legumes, and plant sources",
        "💊 Monitor B12 intake and consider supplements to prevent deficiency",
        "🌱 Include a variety of plant proteins to get all essential amino acids"
      ],
      'vegan': [
        "🍲 Combine protein sources for complete amino acid profiles (beans+rice)",
        "💊 Supplement with B12 and consider vitamin D to prevent deficiencies",
        "🥛 Include fortified foods like plant milks and nutritional yeast regularly"
      ],
      'mediterranean': [
        "🫒 Base meals on vegetables, fruits, whole grains, and healthy fats",
        "🫒 Use olive oil as primary fat source for heart-healthy monounsaturated fats",
        "🐟 Include fish 2-3 times weekly for omega-3 fatty acids"
      ]
    };
    
    let bmiRecommendations: string[] = [];
    
    if (bmiCategory === 'Underweight') {
      bmiRecommendations = [
        "🥜 Add extra healthy fats like nuts, seeds, and oils for calorie density",
        "🥪 Include additional nutrient-dense snacks between meals for extra calories",
        "🥤 Consider calorie-dense smoothies with nut butters, avocado, and full-fat dairy"
      ];
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      bmiRecommendations = [
        "🍽️ Practice portion control using smaller plates and mindful eating techniques",
        "💧 Focus on foods with high water and fiber content that increase satiety",
        "⏱️ Consider intermittent fasting after consulting with your healthcare provider"
      ];
    }
    
    return [...basePlan, ...(specificPlans[preference] || []), ...bmiRecommendations];
  };
  
  const generateWaterPlan = (baseIntake: number, weight: number | ''): string => {
    if (typeof weight !== 'number') return `🚰 Aim to drink ${baseIntake} glasses (2L) of water daily. Set reminders on your phone to stay consistent.`;
    
    const weightBasedLiters = Math.round((weight * 30) / 1000 * 10) / 10;
    const glasses = Math.round(weightBasedLiters * 4);
    
    return `🚰 Based on your weight, aim to drink ${glasses} glasses (${weightBasedLiters}L) of water daily. 💧 Increase intake during exercise or hot weather. 📱 Consider using a water tracking app or set reminders every 2 hours during waking hours.`;
  };
  
  const generateTrainingPlan = (preference: string, days: number, bmiCategory: string): string[] => {
    const frequencyGuide = `📅 Exercise ${days} days per week, allowing for recovery days between strength sessions. Consistency is more important than intensity when starting.`;
    
    const specificPlans: Record<string, string[]> = {
      'cardio': [
        "🏃‍♀️ 30-45 minutes of moderate cardio per session (60-70% max heart rate)",
        "🔄 Mix between running, cycling, swimming, or brisk walking for variety",
        "⚡ Include 1 HIIT session weekly for cardiovascular health and efficiency (e.g., 30 sec hard, 90 sec recovery × 10)"
      ],
      'strength': [
        "💪 Full-body strength training 3x per week targeting all major muscle groups",
        "🏋️‍♂️ Focus on compound movements (squats, deadlifts, presses) for efficiency",
        "📈 Aim for progressive overload by increasing weights gradually (5-10% when current weight becomes manageable)"
      ],
      'flexibility': [
        "🧘‍♀️ Daily 15-minute mobility routine focusing on problem areas",
        "🌿 2-3 full yoga sessions weekly (at least 30 minutes each)",
        "🧠 Include mindfulness practice with stretching for mental benefits"
      ],
      'mixed': [
        "🔄 Alternate between cardio and strength days for balanced fitness",
        "🧘‍♀️ Include one flexibility-focused day weekly for recovery and mobility",
        "🔄 Vary intensity throughout the week (2 harder days, 1-2 moderate, 1 light)"
      ],
      'hiit': [
        "⚡ 20-30 minute HIIT sessions 3-4x weekly (efficient for fat burning)",
        "⏱️ Keep rest periods short (30-60 seconds) to maintain elevated heart rate",
        "💪 Include a mix of bodyweight and weighted exercises in circuit format"
      ],
      'lowImpact': [
        "🏊‍♀️ Focus on swimming, cycling, or elliptical training to protect joints",
        "💪 Include resistance band work for strength without joint stress",
        "🚶‍♀️ Prioritize walking and gentle yoga for accessibility and sustainability"
      ]
    };
    
    let bmiRecommendations: string[] = [];
    
    if (bmiCategory === 'Underweight') {
      bmiRecommendations = [
        "💪 Focus more on strength training than cardio to build muscle mass",
        "🍽️ Ensure adequate nutrition before and after workouts to support gains",
        "🏋️‍♂️ Start with lighter weights and focus on form before increasing intensity"
      ];
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      bmiRecommendations = [
        "🦵 Start with low-impact activities to protect joints (swimming, cycling, walking)",
        "⏱️ Gradually increase duration before increasing intensity to build endurance safely",
        "👨‍⚕️ Consider working with a fitness professional initially to ensure proper form"
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
  
  const getBMICategoryBackground = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'bg-amber-50 border-amber-200';
      case 'Normal weight':
        return 'bg-green-50 border-green-200';
      case 'Overweight':
        return 'bg-amber-50 border-amber-200';
      case 'Obese':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
            className="text-sm text-wellness-mediumGreen underline mt-1 inline-flex items-center gap-1"
          >
            <Scale className="h-3 w-3" />
            <span>What is BMI?</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Height (cm)
            </label>
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
            <label className="block text-wellness-darkGreen font-medium mb-2 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Weight (kg)
            </label>
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

        <div className="mt-6 p-4 bg-white bg-opacity-80 rounded-xl border border-wellness-softGreen/40 mb-6">
          <h3 className="text-wellness-darkGreen font-medium mb-3">BMI Categories</h3>
          <div className="flex h-8 rounded-full overflow-hidden mb-3">
            <div className="bg-amber-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Underweight</div>
            <div className="bg-green-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Normal</div>
            <div className="bg-amber-600 flex-1 flex items-center justify-center text-xs text-white font-medium">Overweight</div>
            <div className="bg-red-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Obese</div>
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
          <div className="mb-8 p-5 bg-white bg-opacity-80 rounded-xl border border-wellness-softGreen/40">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-wellness-darkGreen">{state.bmiResult.bmi}</div>
              <div className={`text-lg font-medium ${getBMICategoryColor(state.bmiResult.category)}`}>
                {state.bmiResult.category}
              </div>
            </div>
            <div className={`mt-2 p-3 rounded-lg text-sm ${getBMICategoryBackground(state.bmiResult.category)}`}>
              <p className="text-wellness-charcoal">
                {state.bmiResult.advice || "Based on your BMI, we'll tailor recommendations specific to your body composition."}
              </p>
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
            <p className="text-xs text-wellness-charcoal mt-1 italic">
              {dietOptions.find(o => o.value === state.dietPreference)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Daily Water Intake Goal (glasses)
              </div>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">4</span>
              <input
                type="range"
                min="4"
                max="16"
                step="1"
                value={state.waterIntake}
                onChange={(e) => setState({...state, waterIntake: Number(e.target.value)})}
                className="flex-1 h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer"
                disabled={state.loading}
              />
              <span className="text-sm font-medium">16</span>
            </div>
            <div className="flex justify-between text-sm text-wellness-charcoal mt-1">
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />4 glasses (1L)
              </span>
              <span className="font-medium">
                {state.waterIntake} glasses ({state.waterIntake / 4}L)
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />16 glasses (4L)
              </span>
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
            <p className="text-xs text-wellness-charcoal mt-1 italic">
              {trainingOptions.find(o => o.value === state.trainingPreference)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Training Days Per Week
              </div>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">1</span>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={state.trainingDays}
                onChange={(e) => setState({...state, trainingDays: Number(e.target.value)})}
                className="flex-1 h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer"
                disabled={state.loading}
              />
              <span className="text-sm font-medium">6</span>
            </div>
            <div className="flex justify-between text-sm text-wellness-charcoal mt-1">
              <span>1 day</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {state.trainingDays} days
              </span>
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
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-2">Your Complete Wellness Plan</h3>
          <p className="text-wellness-charcoal flex items-center justify-center gap-1">
            <Award className="h-4 w-4 text-wellness-darkGreen" />
            <span>Based on your goals, BMI, and preferences</span>
          </p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen/40 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Utensils className="h-6 w-6 text-wellness-darkGreen" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-wellness-darkGreen">Nutrition Plan</h4>
                <p className="text-wellness-charcoal text-sm">Personalized dietary recommendations</p>
              </div>
            </div>
            <ul className="space-y-3">
              {state.finalPlan.diet.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-wellness-charcoal">
                  <div className="flex-shrink-0 w-6 text-center">
                    {item.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    {item.substring(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen/40 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Droplets className="h-6 w-6 text-wellness-darkGreen" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-wellness-darkGreen">Hydration Plan</h4>
                <p className="text-wellness-charcoal text-sm">Water intake recommendations</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-wellness-charcoal">
              {state.finalPlan.water}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen/40 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-wellness-darkGreen" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-wellness-darkGreen">Training Plan</h4>
                <p className="text-wellness-charcoal text-sm">{state.trainingDays} days per week, {trainingOptions.find(o => o.value === state.trainingPreference)?.label}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {state.finalPlan.training.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-wellness-charcoal">
                  <div className="flex-shrink-0 w-6 text-center">
                    {item.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    {item.substring(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen/40 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-wellness-darkGreen" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-wellness-darkGreen">Next Steps</h4>
                <p className="text-wellness-charcoal text-sm">How to implement your plan</p>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-wellness-charcoal">
                <div className="flex-shrink-0 w-6 text-center">
                  1️⃣
                </div>
                <div className="flex-1">
                  Start with small changes and gradually implement the full plan over 2 weeks
                </div>
              </li>
              <li className="flex items-start gap-2 text-wellness-charcoal">
                <div className="flex-shrink-0 w-6 text-center">
                  2️⃣
                </div>
                <div className="flex-1">
                  Track your progress with photos, measurements, or journaling to stay motivated
                </div>
              </li>
              <li className="flex items-start gap-2 text-wellness-charcoal">
                <div className="flex-shrink-0 w-6 text-center">
                  3️⃣
                </div>
                <div className="flex-1">
                  Reassess in 4-6 weeks and adjust based on your results and how you feel
                </div>
              </li>
              <li className="flex items-start gap-2 text-wellness-charcoal">
                <div className="flex-shrink-0 w-6 text-center">
                  4️⃣
                </div>
                <div className="flex-1">
                  Remember that consistency trumps perfection - aim for 80-90% adherence
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setActiveStep('preferences')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Adjust My Preferences
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      {renderGoalsSection()}
      {renderBMISection()}
      {renderPreferencesSection()}
      {renderPlanSection()}
      
      <Dialog open={showBmiInfo} onOpenChange={setShowBmiInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About BMI (Body Mass Index)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-wellness-charcoal">
            <p>
              BMI is a simple calculation using a person's height and weight. The formula is BMI = kg/m² where kg is a person's weight in kilograms and m² is their height in metres squared.
            </p>
            <div className="space-y-2">
              <p className="font-medium">BMI Categories:</p>
              <ul className="space-y-1 pl-4">
                <li className="text-amber-600">Underweight = Less than 18.5</li>
                <li className="text-green-600">Normal weight = 18.5–24.9</li>
                <li className="text-amber-600">Overweight = 25–29.9</li>
                <li className="text-red-600">Obesity = BMI of 30 or greater</li>
              </ul>
            </div>
            <p>
              <strong>Note:</strong> BMI is a screening tool but not diagnostic of body fatness or health. It doesn't account for muscle mass, bone density, or body composition. Athletes may have a high BMI due to increased muscle mass.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellnessJourney;
