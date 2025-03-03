import React, { useState, useEffect } from 'react';
import { getWellnessInsights, calculateBMI } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, Droplets, Dumbbell, Apple, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface WellnessState {
  goals: { id: number; text: string; selected: boolean }[];
  recommendations: string[];
  milestones: string[];
  bmiData: BMIData | null;
  height: number | '';
  weight: number | '';
  activityLevel: string;
  dietaryPreference: string;
  hydrationGoal: string;
  personalizedPlan: PersonalizedPlan | null;
  loading: boolean;
}

interface BMIData {
  bmi: string;
  category: string;
  advice: string;
}

interface PersonalizedPlan {
  diet: string[];
  hydration: string[];
  workout: string[];
}

// Define an interface for the API response
interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
}

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)' },
  { value: 'active', label: 'Very active (hard exercise 6-7 days/week)' },
  { value: 'extra_active', label: 'Extra active (very hard exercise & physical job)' }
];

const dietaryPreferences = [
  { value: 'no_restriction', label: 'No dietary restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'gluten_free', label: 'Gluten-free' },
  { value: 'dairy_free', label: 'Dairy-free' }
];

// Emoji mapping for recommendations and milestones
const getEmojiForRecommendation = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('meal') || lowerText.includes('eat') || lowerText.includes('food') || lowerText.includes('plate')) {
    return '🍽️';
  } else if (lowerText.includes('sleep') || lowerText.includes('bed') || lowerText.includes('rest')) {
    return '😴';
  } else if (lowerText.includes('water') || lowerText.includes('hydrat')) {
    return '💧';
  } else if (lowerText.includes('exercise') || lowerText.includes('workout') || lowerText.includes('active')) {
    return '🏃‍♀️';
  } else if (lowerText.includes('stress') || lowerText.includes('relax') || lowerText.includes('meditat')) {
    return '🧘‍♀️';
  } else if (lowerText.includes('habit') || lowerText.includes('routine')) {
    return '📆';
  } else if (lowerText.includes('snack')) {
    return '🥕';
  } else {
    return '✨';
  }
};

const getEmojiForMilestone = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('energy')) {
    return '⚡';
  } else if (lowerText.includes('sleep')) {
    return '💤';
  } else if (lowerText.includes('craving')) {
    return '🍫';
  } else if (lowerText.includes('weight')) {
    return '⚖️';
  } else if (lowerText.includes('mood') || lowerText.includes('stress')) {
    return '😊';
  } else if (lowerText.includes('fitness') || lowerText.includes('strength')) {
    return '💪';
  } else {
    return '🎯';
  }
};

// Function to format text with emojis and bullet points
const formatTextWithEmojis = (text: string, type: 'recommendation' | 'milestone'): string => {
  // Get appropriate emoji based on content
  const emoji = type === 'recommendation' 
    ? getEmojiForRecommendation(text) 
    : getEmojiForMilestone(text);
    
  // Format text to be more concise and friendly
  // Simplify academic language and remove unnecessarily complex sentences
  let formattedText = text
    .replace(/studies show that|research indicates that|according to research/gi, '')
    .replace(/it is recommended to|it is advised to/gi, 'try to')
    .replace(/in order to/gi, 'to')
    .replace(/individuals should/gi, 'try to')
    .replace(/significantly/gi, '')
    .replace(/furthermore|moreover|additionally/gi, 'Also,')
    .trim();
  
  // Capitalize first letter
  formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
  
  return `${emoji} ${formattedText}`;
};

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
    bmiData: null,
    height: '',
    weight: '',
    activityLevel: 'moderate',
    dietaryPreference: 'no_restriction',
    hydrationGoal: '',
    personalizedPlan: null,
    loading: false
  });
  
  const [activeSection, setActiveSection] = useState<'goals' | 'bmi' | 'preferences' | 'plan'>('goals');
  const [progress, setProgress] = useState<number>(25);
  
  // Update progress based on active section
  useEffect(() => {
    switch(activeSection) {
      case 'goals':
        setProgress(25);
        break;
      case 'bmi':
        setProgress(50);
        break;
      case 'preferences':
        setProgress(75);
        break;
      case 'plan':
        setProgress(100);
        break;
      default:
        setProgress(25);
    }
  }, [activeSection]);
  
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
  
  const handleBMICalculate = async () => {
    const { height, weight } = state;
    
    if (height === '' || weight === '') {
      toast.error('Please enter both height and weight');
      return;
    }
    
    if (typeof height === 'number' && typeof weight === 'number') {
      if (height <= 0 || weight <= 0) {
        toast.error('Height and weight must be positive values');
        return;
      }
      
      setState({ ...state, loading: true });
      
      try {
        // Call the API to get BMI calculation and AI-generated advice
        const bmiResult = await calculateBMI(height, weight);
        
        // Format the BMI advice to be more friendly and concise
        const formattedBMIData = {
          ...bmiResult,
          advice: bmiResult.advice
            .replace(/it is recommended that you|it is advised that you/gi, 'Try to')
            .replace(/individuals in your BMI category/gi, 'you')
            .replace(/should consider/gi, 'consider')
            .trim()
        };
        
        setState(prevState => ({
          ...prevState,
          bmiData: formattedBMIData,
          loading: false
        }));
        
        // Auto-advance to preferences after BMI calculation
        setTimeout(() => {
          setActiveSection('preferences');
        }, 1500);
        
      } catch (error) {
        console.error("BMI calculation error:", error);
        toast.error("Failed to calculate BMI. Please try again.");
        setState(prevState => ({ ...prevState, loading: false }));
      }
    }
  };
  
  const generatePlan = async () => {
    const selectedGoals = getSelectedGoals();
    
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one wellness goal');
      return;
    }
    
    setState({ ...state, loading: true });
    
    try {
      // Get wellness insights based on goals
      const insights = await getWellnessInsights(selectedGoals) as WellnessInsights;
      
      if (insights.recommendations.length === 0 && insights.milestones.length === 0) {
        throw new Error('Failed to generate wellness plan');
      }
      
      // Format the recommendations and milestones to be more friendly
      const formattedRecommendations = insights.recommendations.map(rec => 
        formatTextWithEmojis(rec, 'recommendation')
      );
      
      const formattedMilestones = insights.milestones.map(milestone => 
        formatTextWithEmojis(milestone, 'milestone')
      );
      
      // Calculate hydration goal based on weight and activity level
      let hydrationGoal = "";
      if (typeof state.weight === 'number') {
        // Base hydration is 30ml per kg of body weight
        let baseHydration = state.weight * 30;
        
        // Adjust based on activity level
        switch(state.activityLevel) {
          case 'sedentary':
            baseHydration *= 1.0;
            break;
          case 'light':
            baseHydration *= 1.1;
            break;
          case 'moderate':
            baseHydration *= 1.2;
            break;
          case 'active':
            baseHydration *= 1.3;
            break;
          case 'extra_active':
            baseHydration *= 1.4;
            break;
        }
        
        // Convert to liters and round to 1 decimal place
        const liters = (baseHydration / 1000).toFixed(1);
        hydrationGoal = `${liters} liters`;
      }
      
      // Generate personalized plan based on BMI, goals, and preferences
      const personalizedPlan = generatePersonalizedPlan(
        state.bmiData?.category || 'Normal weight',
        selectedGoals,
        state.dietaryPreference,
        state.activityLevel
      );
      
      setState({
        ...state,
        recommendations: formattedRecommendations,
        milestones: formattedMilestones,
        hydrationGoal,
        personalizedPlan,
        loading: false
      });
      
      setActiveSection('plan');
      toast.success('Your wellness plan is ready!');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState({ ...state, loading: false });
      toast.error('Failed to generate wellness plan. Please try again.');
    }
  };
  
  const generatePersonalizedPlan = (
    bmiCategory: string,
    goals: string[],
    dietaryPreference: string,
    activityLevel: string
  ): PersonalizedPlan => {
    // Diet recommendations based on BMI and dietary preference
    let dietRecs: string[] = [];
    
    // Base diet recommendations by BMI category with emojis
    if (bmiCategory === 'Underweight') {
      dietRecs = [
        "🥑 Focus on nutrient-rich foods like nuts, avocados, and whole grains",
        "🕒 Eat 3 main meals plus 2-3 snacks daily",
        "🥚 Include protein with every meal (eggs, lean meats, or plant-based options)",
        "🧀 Add healthy fats like olive oil, nut butters, and dairy to your meals"
      ];
    } else if (bmiCategory === 'Normal weight') {
      dietRecs = [
        "🥗 Balance your meals with proteins, complex carbs, and healthy fats",
        "🍎 Aim for 5+ servings of fruits and veggies daily",
        "🌾 Choose whole grains instead of refined carbs",
        "👀 Practice mindful eating - pay attention to hunger cues"
      ];
    } else if (bmiCategory === 'Overweight') {
      dietRecs = [
        "📉 Create a small calorie deficit (300-500 calories daily)",
        "🥦 Fill up on veggies and lean proteins",
        "🚫 Cut back on added sugars and processed foods",
        "🥄 Use measuring cups to control portions at first"
      ];
    } else { // Obese
      dietRecs = [
        "👨‍⚕️ Check with your doctor about a sustainable eating plan",
        "🥒 Focus on whole foods with lots of veggies and lean proteins",
        "🍭 Skip added sugars, refined carbs, and processed foods",
        "⏱️ Consider trying intermittent fasting (ask your doctor first)"
      ];
    }
    
    // Adjust based on dietary preference
    if (dietaryPreference === 'vegetarian') {
      dietRecs.push("🌱 Include plant proteins like lentils, beans, tofu, and tempeh");
      dietRecs.push("💊 Consider taking vitamin B12 supplements");
    } else if (dietaryPreference === 'vegan') {
      dietRecs.push("🌱 Mix proteins like beans with rice or quinoa for complete nutrition");
      dietRecs.push("💊 Take vitamin B12, D, and omega-3 supplements");
      dietRecs.push("🥛 Get calcium from fortified plant milks and leafy greens");
    } else if (dietaryPreference === 'keto') {
      dietRecs.push("🥦 Keep carbs under 50g daily - focus on non-starchy veggies");
      dietRecs.push("🥑 Eat plenty of healthy fats from avocados, olive oil, nuts, and seeds");
      dietRecs.push("🍗 Keep protein intake adequate for your activity level");
    } else if (dietaryPreference === 'paleo') {
      dietRecs.push("🥩 Choose grass-fed meats, wild-caught fish, and eggs");
      dietRecs.push("🥗 Load up on veggies, fruits, nuts, and seeds");
      dietRecs.push("🚫 Skip grains, legumes, dairy, and processed foods");
    }
    
    // Hydration recommendations with emojis
    const hydrationRecs = [
      "🌅 Drink a glass of water first thing in the morning",
      "🧴 Keep a water bottle with you all day",
      "⏰ Set drinking reminders every 1-2 hours",
      "💦 Drink more during and after exercise",
      "🍋 Add flavor with cucumber, lemon, or mint if plain water is boring",
    ];
    
    // Workout recommendations based on goals and activity level
    let workoutRecs: string[] = [];
    
    // Base workout frequency recommendation based on activity level
    if (activityLevel === 'sedentary' || activityLevel === 'light') {
      workoutRecs.push("🏁 Start with 2-3 workout days per week");
      workoutRecs.push("⏱️ Begin with short 15-20 minute sessions and build up");
    } else if (activityLevel === 'moderate') {
      workoutRecs.push("🏁 Aim for 3-4 workout days per week");
      workoutRecs.push("⏱️ Try for 30-45 minute sessions");
    } else {
      workoutRecs.push("🏁 Keep up 4-6 varied workout days weekly");
      workoutRecs.push("🛌 Include rest days to prevent burnout");
    }
    
    // Add specific workout recommendations based on goals
    if (goals.includes('Lose weight')) {
      workoutRecs.push("🔄 Mix cardio and strength training for best fat loss");
      workoutRecs.push("⚡ Try HIIT workouts for efficient calorie burning");
    }
    
    if (goals.includes('Gain muscle')) {
      workoutRecs.push("🏋️ Do resistance training 3-4 times weekly");
      workoutRecs.push("🥩 Eat protein before and after your workouts");
      workoutRecs.push("💪 Focus on compound exercises for major muscle groups");
    }
    
    if (goals.includes('Improve fitness level')) {
      workoutRecs.push("🔄 Include cardio, strength, and mobility exercises");
      workoutRecs.push("📈 Gradually increase intensity by about 10% weekly");
      workoutRecs.push("📊 Track your progress with fitness tests every 4-6 weeks");
    }
    
    if (goals.includes('Reduce stress')) {
      workoutRecs.push("🧘 Add yoga or meditation to your weekly routine");
      workoutRecs.push("🌳 Try walking in nature for stress relief");
      workoutRecs.push("📝 Schedule relaxation time - it's as important as exercise");
    }
    
    return {
      diet: dietRecs,
      hydration: hydrationRecs,
      workout: workoutRecs
    };
  };
  
  const continueToBMI = () => {
    const selectedGoals = getSelectedGoals();
    
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one wellness goal');
      return;
    }
    
    setActiveSection('bmi');
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
  
  const renderProgressBar = () => {
    return (
      <div className="w-full bg-wellness-softGreen/30 h-2 rounded-full mb-8">
        <div 
          className="h-full bg-wellness-darkGreen rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-8 text-sm text-wellness-charcoal">
        <div className={`flex flex-col items-center ${activeSection === 'goals' ? 'text-wellness-darkGreen font-medium' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
            activeSection === 'goals' ? 'bg-wellness-darkGreen text-white' : 
            progress >= 25 ? 'bg-wellness-mediumGreen/50 text-white' : 'bg-wellness-softGreen text-wellness-charcoal'
          }`}>
            1
          </div>
          <span>Goals</span>
        </div>
        
        <div className={`flex flex-col items-center ${activeSection === 'bmi' ? 'text-wellness-darkGreen font-medium' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
            activeSection === 'bmi' ? 'bg-wellness-darkGreen text-white' : 
            progress >= 50 ? 'bg-wellness-mediumGreen/50 text-white' : 'bg-wellness-softGreen text-wellness-charcoal'
          }`}>
            2
          </div>
          <span>BMI</span>
        </div>
        
        <div className={`flex flex-col items-center ${activeSection === 'preferences' ? 'text-wellness-darkGreen font-medium' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
            activeSection === 'preferences' ? 'bg-wellness-darkGreen text-white' : 
            progress >= 75 ? 'bg-wellness-mediumGreen/50 text-white' : 'bg-wellness-softGreen text-wellness-charcoal'
          }`}>
            3
          </div>
          <span>Preferences</span>
        </div>
        
        <div className={`flex flex-col items-center ${activeSection === 'plan' ? 'text-wellness-darkGreen font-medium' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
            activeSection === 'plan' ? 'bg-wellness-darkGreen text-white' : 
            progress >= 100 ? 'bg-wellness-mediumGreen/50 text-white' : 'bg-wellness-softGreen text-wellness-charcoal'
          }`}>
            4
          </div>
          <span>Your Plan</span>
        </div>
      </div>
    );
  };
  
  const renderGoalsSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'goals' ? 'opacity-100' : 'opacity-0 hidden'}`}>
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
            onClick={continueToBMI}
            disabled={getSelectedGoals().length === 0}
            className={`btn-primary rounded-lg flex items-center gap-2 ${
              getSelectedGoals().length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowRight className="h-5 w-5" />
            Continue
          </button>
        </div>
      </div>
    );
  };
  
  const renderBMISection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'bmi' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-8 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Calculate Your BMI</h3>
          <p className="text-wellness-charcoal">Your Body Mass Index helps us tailor recommendations to your specific needs.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              value={state.height}
              onChange={(e) => setState({
                ...state,
                height: e.target.value === '' ? '' : Number(e.target.value)
              })}
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
              onChange={(e) => setState({
                ...state,
                weight: e.target.value === '' ? '' : Number(e.target.value)
              })}
              placeholder="Enter weight in kg"
              className="input-field w-full"
              min="0"
              disabled={state.loading}
            />
          </div>
        </div>
        
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setActiveSection('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Back
          </button>
          
          <button
            onClick={handleBMICalculate}
            disabled={state.loading || state.height === '' || state.weight === ''}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Calculating...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Calculate BMI
              </>
            )}
          </button>
        </div>
        
        {state.bmiData && (
          <div className="mt-6 overflow-hidden animate-fade-in">
            <div className="bg-white bg-opacity-80 rounded-xl p-5 shadow-sm border border-wellness-softGreen">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-wellness-darkGreen">{state.bmiData.bmi}</div>
                <div className={`text-xl font-medium ${getBMICategoryColor(state.bmiData.category)}`}>
                  {state.bmiData.category}
                </div>
              </div>
              
              <div className="p-4 bg-wellness-softGreen/30 rounded-lg">
                <h4 className="font-medium text-wellness-darkGreen mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Personalized Advice
                </h4>
                <p className="text-wellness-charcoal whitespace-pre-line text-sm">{state.bmiData.advice}</p>
              </div>
              
              <div className="mt-4 text-xs text-wellness-charcoal/70 text-center">
                This is a general guideline. For personalized health advice, please consult a healthcare professional.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderPreferencesSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'preferences' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-8 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Preferences</h3>
          <p className="text-wellness-charcoal">Help us tailor your wellness plan to your specific lifestyle and preferences.</p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">Activity Level</label>
            <select 
              className="input-field w-full"
              value={state.activityLevel}
              onChange={(e) => setState({...state, activityLevel: e.target.value})}
            >
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-wellness-darkGreen font-medium mb-2">Dietary Preference</label>
            <select 
              className="input-field w-full"
              value={state.dietaryPreference}
              onChange={(e) => setState({...state, dietaryPreference: e.target.value})}
            >
              {dietaryPreferences.map((pref) => (
                <option key={pref.value} value={pref.value}>{pref.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setActiveSection('bmi')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Back
          </button>
          
          <button
            onClick={generatePlan}
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
                Generate My Wellness Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderPlanSection = () => {
    if (!state.personalizedPlan) {
      return null;
    }
    
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'plan' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Personalized Wellness Journey</h3>
          <p className="text-wellness-charcoal">Based on your goals: {getSelectedGoals().join(', ')}</p>
          {state.bmiData && (
            <div className="mt-2 flex justify-center items-center gap-2">
              <span className="px-3 py-1 bg-wellness-softGreen rounded-full text-sm font-medium">
                BMI: {state.bmiData.bmi} ({state.bmiData.category})
              </span>
              
              {state.hydrationGoal && (
                <span className="px-3 py-1 bg-wellness-softGreen rounded-full text-sm font-medium flex items-center">
                  <Droplets className="h-3.5 w-3.5 mr-1" />
                  {state.hydrationGoal}/day
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-6 mb-6">
          {/* Diet Recommendations */}
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Apple className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Diet Recommendations</h4>
            </div>
            
            <ul className="space-y-3">
              {state.personalizedPlan.diet.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="text-wellness-darkGreen mt-0.5 flex-shrink-0 font-bold">•</span>
                  <p className="text-wellness-charcoal">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Hydration Recommendations */}
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Droplets className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Hydration Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.personalizedPlan.hydration.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="text-wellness-darkGreen mt-0.5 flex-shrink-0 font-bold">•</span>
                  <p className="text-wellness-charcoal">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Workout Recommendations */}
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Workout Plan</h4>
            </div>
            
            <ul className="space-y-3">
              {state.personalizedPlan.workout.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="text-wellness-darkGreen mt-0.5 flex-shrink-0 font-bold">•</span>
                  <p className="text-wellness-charcoal">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          {/* General Recommendations */}
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
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
                  <span className="text-wellness-darkGreen mt-0.5 flex-shrink-0 font-bold">•</span>
                  <p className="text-wellness-charcoal">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Milestones */}
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
                  <span className="text-wellness-darkGreen mt-0.5 flex-shrink-0 font-bold">•</span>
                  <p className="text-wellness-charcoal">{milestone}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setActiveSection('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Start Over
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      {renderProgressBar()}
      {renderStepIndicator()}
      {renderGoalsSection()}
      {renderBMISection()}
      {renderPreferencesSection()}
      {renderPlanSection()}
    </div>
  );
};

export default WellnessJourney;
