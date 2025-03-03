
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Scale } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import BMICalculator from './wellness/BMICalculator';
import GoalSelector from './wellness/GoalSelector';
import PreferencesForm from './wellness/PreferencesForm';
import WellnessPlan from './wellness/WellnessPlan';
import JourneyProgress from './wellness/JourneyProgress';

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
  
  const initialState: WellnessState = {
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
  };
  
  const [state, setState] = useState<WellnessState>(initialState);
  const [activeStep, setActiveStep] = useState<JourneyStep>('goals');
  const [showBmiInfo, setShowBmiInfo] = useState(false);
  
  // Load saved state on component mount
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
  
  // Save state changes to localStorage
  // Using useCallback to prevent recreation on each render
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
  
  // Call saveState when state changes
  useEffect(() => {
    saveState();
  }, [saveState]);
  
  const getSelectedGoals = () => {
    return state.goals.filter(goal => goal.selected).map(goal => goal.text);
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
        <JourneyProgress 
          activeStep={activeStep} 
          setActiveStep={setActiveStep} 
        />
        
        {activeStep === 'goals' && (
          <GoalSelector
            goals={state.goals}
            toggleGoal={(id) => {
              setState(prevState => ({
                ...prevState,
                goals: prevState.goals.map(goal => 
                  goal.id === id ? { ...goal, selected: !goal.selected } : goal
                )
              }));
            }}
            loading={state.loading}
            getSelectedGoals={getSelectedGoals}
            handleContinue={async () => {
              // Logic moved to GoalSelector component
            }}
          />
        )}
        
        {activeStep === 'bmi' && (
          <BMICalculator
            height={state.height}
            weight={state.weight}
            setHeight={(height) => setState(prevState => ({...prevState, height}))}
            setWeight={(weight) => setState(prevState => ({...prevState, weight}))}
            loading={state.loading}
            calculateBMI={async () => {
              // Logic moved to BMICalculator component
            }}
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
            generateFinalPlan={() => {
              // Logic moved to PreferencesForm component
            }}
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
