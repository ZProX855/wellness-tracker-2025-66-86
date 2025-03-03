import React, { useState, useEffect, useCallback } from 'react';
import { getWellnessInsights, calculateBMI } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, Droplets, Dumbbell, Apple, ArrowRight, Calendar, Salad, AlarmClock, Brain, Heart, Scale, Sun, Award, Utensils, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import useLocalStorage from '../hooks/useLocalStorage';
import BMICalculator from './wellness/BMICalculator';
import GoalSelector from './wellness/GoalSelector';
import PreferencesForm from './wellness/PreferencesForm';
import WellnessPlan from './wellness/WellnessPlan';

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

interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
}

type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

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
      setState(prevState => {
        const updatedGoals = prevState.goals.map(goal => ({
          ...goal,
          selected: savedState.goals?.find(g => g.id === goal.id)?.selected || false
        }));
        
        return {
          ...prevState,
          ...savedState,
          goals: updatedGoals
        };
      });
      
      if (savedState.finalPlan) {
        setActiveStep('plan');
      } else if (savedState.bmiResult) {
        setActiveStep('preferences');
      } else if (savedState.recommendations && savedState.recommendations.length > 0) {
        setActiveStep('bmi');
      }
    }
  }, [savedState]);
  
  const saveState = useCallback(() => {
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
  
  useEffect(() => {
    saveState();
  }, [saveState]);
  
  const toggleGoal = (id: number) => {
    setState(prevState => ({
      ...prevState,
      goals: prevState.goals.map(goal => 
        goal.id === id ? { ...goal, selected: !goal.selected } : goal
      )
    }));
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
    
    setState(prevState => ({ ...prevState, loading: true }));
    
    try {
      const insights = await getWellnessInsights(selectedGoals) as WellnessInsights;
      
      if (insights.recommendations.length === 0 && insights.milestones.length === 0) {
        throw new Error('Failed to generate wellness plan');
      }
      
      setState(prevState => ({
        ...prevState,
        recommendations: insights.recommendations,
        milestones: insights.milestones,
        loading: false
      }));
      
      setActiveStep('bmi');
      toast.success('Your initial wellness insights are ready!');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState(prevState => ({ ...prevState, loading: false }));
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
      
      setState(prevState => ({ ...prevState, loading: true }));
      
      try {
        const bmiResult = await calculateBMI(state.height, state.weight);
        
        setState(prevState => ({
          ...prevState,
          bmiResult: bmiResult,
          loading: false
        }));
        
        setActiveStep('preferences');
        toast.success('BMI calculated successfully!');
      } catch (error) {
        console.error("BMI calculation error:", error);
        setState(prevState => ({ ...prevState, loading: false }));
        toast.error("Failed to calculate BMI. Please try again.");
      }
    }
  };

  const generateFinalPlan = () => {
    setState(prevState => ({ ...prevState, loading: true }));
    
    setTimeout(() => {
      const selectedGoals = getSelectedGoals();
      const bmiCategory = state.bmiResult?.category || 'Normal weight';
      
      const dietPlan = generateDietPlan(state.dietPreference, bmiCategory);
      const waterPlan = generateWaterPlan(state.waterIntake, state.weight);
      const trainingPlan = generateTrainingPlan(state.trainingPreference, state.trainingDays, bmiCategory);
      
      setState(prevState => ({
        ...prevState,
        finalPlan: {
          diet: dietPlan,
          water: waterPlan,
          training: trainingPlan
        },
        loading: false
      }));
      
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

  return (
    <>
      <div className="space-y-8">
        <div className="mb-8">
          <div className="flex justify-between">
            {['goals', 'bmi', 'preferences', 'plan'].map((step, index) => (
              <div 
                key={step} 
                className="flex flex-col items-center"
                onClick={() => {
                  const stepIndex = ['goals', 'bmi', 'preferences', 'plan'].indexOf(activeStep);
                  if (index <= stepIndex) {
                    setActiveStep(step as JourneyStep);
                  }
                }}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all 
                    ${activeStep === step 
                      ? 'bg-wellness-darkGreen text-white' 
                      : index < ['goals', 'bmi', 'preferences', 'plan'].indexOf(activeStep)
                        ? 'bg-wellness-mediumGreen text-white' 
                        : 'bg-wellness-softGreen/50 text-wellness-darkGreen'
                    } 
                    ${index <= ['goals', 'bmi', 'preferences', 'plan'].indexOf(activeStep) 
                      ? 'cursor-pointer hover:shadow-md' 
                      : 'opacity-60 cursor-not-allowed'
                    }`}
                >
                  {index + 1}
                </div>
                <div 
                  className={`text-xs mt-2 font-medium 
                    ${activeStep === step 
                      ? 'text-wellness-darkGreen' 
                      : 'text-wellness-charcoal'
                    }`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-5">
            <div className="absolute top-0 h-1 bg-wellness-softGreen/30 w-full rounded-full"></div>
            <div 
              className="absolute top-0 h-1 bg-wellness-mediumGreen rounded-full transition-all duration-500"
              style={{ 
                width: `${
                  activeStep === 'goals' ? '25%' : 
                  activeStep === 'bmi' ? '50%' : 
                  activeStep === 'preferences' ? '75%' : '100%'
                }` 
              }}
            ></div>
          </div>
        </div>
        
        {activeStep === 'goals' && (
          <GoalSelector
            goals={state.goals}
            toggleGoal={toggleGoal}
            loading={state.loading}
            getSelectedGoals={getSelectedGoals}
            handleContinue={handleContinue}
          />
        )}
        
        {activeStep === 'bmi' && (
          <BMICalculator
            height={state.height}
            weight={state.weight}
            setHeight={(height) => setState({...state, height})}
            setWeight={(weight) => setState({...state, weight})}
            loading={state.loading}
            calculateBMI={calculateUserBMI}
            showBmiInfo={showBmiInfo}
            setShowBmiInfo={setShowBmiInfo}
            goBack={() => setActiveStep('goals')}
          />
        )}
        
        {activeStep === 'preferences' && (
          <PreferencesForm
            state={state}
            setState={setState}
            bmiResult={state.bmiResult}
            loading={state.loading}
            generateFinalPlan={generateFinalPlan}
            getBMICategoryColor={getBMICategoryColor}
            getBMICategoryBackground={getBMICategoryBackground}
            goBack={() => setActiveStep('bmi')}
          />
        )}
        
        {activeStep === 'plan' && state.finalPlan && (
          <WellnessPlan
            finalPlan={state.finalPlan}
            recommendations={state.recommendations}
            milestones={state.milestones}
            goBack={() => setActiveStep('preferences')}
          />
        )}
      </div>
      
      <Dialog open={showBmiInfo} onOpenChange={setShowBmiInfo}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-wellness-darkGreen flex items-center gap-2">
              <Scale className="h-5 w-5" /> What is BMI?
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-wellness-charcoal">
            <p className="mb-3">Body Mass Index (BMI) is a numerical value calculated from a person's weight and height. It provides a simple measure to categorize a person's weight status.</p>
            <h4 className="font-medium text-wellness-darkGreen mb-2">BMI Categories:</h4>
            <ul className="space-y-2">
              <li><span className="font-medium text-amber-500">Underweight:</span> BMI less than 18.5</li>
              <li><span className="font-medium text-green-500">Normal weight:</span> BMI 18.5 to 24.9</li>
              <li><span className="font-medium text-amber-600">Overweight:</span> BMI 25 to 29.9</li>
              <li><span className="font-medium text-red-500">Obesity:</span> BMI 30 or greater</li>
            </ul>
            <p className="mt-3 text-sm italic">Note: BMI is a general indicator and doesn't account for factors like muscle mass, bone density, or overall body composition.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WellnessJourney;
