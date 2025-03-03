
import React from 'react';
import { generateDietPlan, generateWaterPlan, generateTrainingPlan } from '../../utils/wellnessUtils';

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

const WellnessPlanner = {
  generateFinalPlan: (state: WellnessState, getSelectedGoals: () => string[]) => {
    const selectedGoals = getSelectedGoals();
    const bmiCategory = state.bmiResult?.category || 'Normal weight';
    
    const dietPlan = generateDietPlan(state.dietPreference, bmiCategory);
    const waterPlan = generateWaterPlan(state.waterIntake, state.weight);
    const trainingPlan = generateTrainingPlan(state.trainingPreference, state.trainingDays, bmiCategory);
    
    return {
      diet: dietPlan,
      water: waterPlan,
      training: trainingPlan
    };
  }
};

export default WellnessPlanner;
