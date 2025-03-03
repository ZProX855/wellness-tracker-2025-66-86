
import React from 'react';
import { ChevronDown, Target, Apple, Droplets, Dumbbell, Calendar, Scale } from 'lucide-react';
import { toast } from 'sonner';

interface BMIResult {
  bmi: string;
  category: string;
  advice: string;
}

interface PreferencesFormProps {
  state: any;
  setState: (state: any) => void;
  bmiResult: BMIResult | null;
  loading: boolean;
  generateFinalPlan: () => void;
  getBMICategoryColor: (category: string) => string;
  getBMICategoryBackground: (category: string) => string;
  goBack: () => void;
}

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

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  state,
  setState,
  bmiResult,
  loading,
  generateFinalPlan: externalGenerateFinalPlan,
  getBMICategoryColor,
  getBMICategoryBackground,
  goBack
}) => {
  const generateFinalPlan = () => {
    setState(prevState => ({ ...prevState, loading: true }));
    
    setTimeout(() => {
      try {
        externalGenerateFinalPlan();
        toast.success('Your complete wellness plan is ready!');
      } catch (error) {
        console.error('Error generating final plan:', error);
        toast.error('Failed to generate your wellness plan. Please try again.');
        setState(prevState => ({ ...prevState, loading: false }));
      }
    }, 1500);
  };

  return (
    <div className="transition-all duration-500 animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Preferences</h3>
        <p className="text-wellness-charcoal max-w-xl mx-auto">Customize your wellness plan by providing your preferences.</p>
      </div>
      
      {bmiResult && (
        <div className="mb-8 p-5 glass-panel">
          <div className="text-center mb-2">
            <div className="text-3xl font-bold text-wellness-darkGreen">{bmiResult.bmi}</div>
            <div className={`text-lg font-medium ${getBMICategoryColor(bmiResult.category)}`}>
              {bmiResult.category}
            </div>
          </div>
          <div className={`mt-2 p-3 rounded-lg text-sm ${getBMICategoryBackground(bmiResult.category)}`}>
            <p className="text-wellness-charcoal">
              {bmiResult.advice || "Based on your BMI, we'll tailor recommendations specific to your body composition."}
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-6 mb-8 glass-panel p-6">
        <div>
          <label className="block text-wellness-darkGreen font-medium mb-2">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Diet Preference
            </div>
          </label>
          <select 
            value={state.dietPreference}
            onChange={(e) => setState(prevState => ({...prevState, dietPreference: e.target.value}))}
            className="input-field w-full focus:ring-wellness-mediumGreen"
            disabled={loading}
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
              onChange={(e) => setState(prevState => ({...prevState, waterIntake: Number(e.target.value)}))}
              className="flex-1 h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer accent-wellness-darkGreen"
              disabled={loading}
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
            onChange={(e) => setState(prevState => ({...prevState, trainingPreference: e.target.value}))}
            className="input-field w-full focus:ring-wellness-mediumGreen"
            disabled={loading}
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
              onChange={(e) => setState(prevState => ({...prevState, trainingDays: Number(e.target.value)}))}
              className="flex-1 h-2 bg-wellness-softGreen rounded-lg appearance-none cursor-pointer accent-wellness-darkGreen"
              disabled={loading}
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
          onClick={goBack}
          className="btn-secondary rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:bg-wellness-softGreen/70"
        >
          <ChevronDown className="h-5 w-5" />
          Back to BMI
        </button>
        
        <button
          onClick={generateFinalPlan}
          disabled={loading}
          className="btn-primary rounded-full px-6 py-3 shadow-sm hover:shadow-md flex items-center gap-2 transition-all duration-300 hover:translate-y-[-2px]"
        >
          {loading ? (
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

export default PreferencesForm;
