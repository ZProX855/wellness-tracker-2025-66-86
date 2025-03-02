// src/services/api.ts

// Function to calculate BMI
export const calculateBMI = async (height: number, weight: number) => {
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  
  // Calculate BMI
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Determine BMI category
  let category = '';
  let advice = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    advice = `You are in the underweight range. It's important to ensure you're getting enough nutrients. Consider consulting with a healthcare professional or a registered dietitian to discuss a healthy eating plan to gain weight.`;
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal weight';
    advice = `Great job! You are in the normal weight range. Continue to maintain a balanced diet and regular exercise to stay healthy.`;
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    advice = `You are in the overweight range. It's advisable to make lifestyle changes including diet and exercise. Small changes can make a big difference.`;
  } else {
    category = 'Obese';
    advice = `You are in the obese range. It's important to address this for your long-term health. Please consult with a healthcare professional for a comprehensive health assessment and guidance.`;
  }

  // Return BMI result with category and AI-generated advice
  return {
    bmi: bmi.toFixed(2),
    category,
    advice
  };
};

// Function to simulate getting wellness insights from an AI
export const getWellnessInsights = async (goals: string[], userData: any) => {
  // Simulate delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 500));

  let recommendations = [];
  let milestones = [];
  let dietPlan = [];
  let waterPlan = [];
  let workoutPlan = [];

  // Generate recommendations based on user goals and BMI
  if (goals.includes('Eat healthier meals')) {
    recommendations.push("Focus on incorporating more fruits and vegetables into your daily diet.");
    dietPlan.push("Try to include a serving of leafy greens with every meal.");
  }

  if (goals.includes('Improve fitness level')) {
    recommendations.push("Incorporate at least 30 minutes of physical activity into your daily routine.");
    workoutPlan.push("Start with brisk walking or jogging for 30 minutes, three times a week.");
  }

  if (goals.includes('Lose weight')) {
    recommendations.push("Create a calorie deficit through diet and exercise.");
    milestones.push("Aim to lose 1-2 pounds per week for sustainable weight loss.");
    dietPlan.push("Reduce intake of sugary drinks and processed foods.");
  }

  if (goals.includes('Gain muscle')) {
    recommendations.push("Increase your protein intake to support muscle growth.");
    workoutPlan.push("Incorporate strength training exercises at least twice a week.");
    dietPlan.push("Include protein-rich foods like chicken, fish, or legumes in your meals.");
  }

  if (goals.includes('Get better sleep')) {
    recommendations.push("Establish a consistent sleep schedule and create a relaxing bedtime routine.");
    milestones.push("Aim for 7-9 hours of quality sleep each night.");
  }

  if (goals.includes('Reduce stress')) {
    recommendations.push("Practice mindfulness and relaxation techniques such as meditation or deep breathing exercises.");
    milestones.push("Set aside 10-15 minutes each day for relaxation and stress reduction.");
  }

  // Hydration recommendations
  waterPlan.push(`Aim to drink at least ${userData.preferences.waterIntakeGoal} glasses of water throughout the day.`);
  waterPlan.push("Carry a water bottle with you as a reminder to stay hydrated.");

  // Return the generated wellness insights
  return {
    recommendations,
    milestones,
    dietPlan,
    waterPlan,
    workoutPlan
  };
};

// Add missing exports needed by other components
export const getChatResponse = async (message: string) => {
  return {
    text: "This is a placeholder response for the chat functionality.",
    audio: null
  };
};

export const foodDatabase = [
  { id: 1, name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
  { id: 2, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { id: 3, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 4, name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0 },
  { id: 5, name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.2 },
  { id: 6, name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 },
  { id: 7, name: 'Egg', calories: 68, protein: 5.5, carbs: 0.6, fat: 4.8, fiber: 0 },
  { id: 8, name: 'Avocado', calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10 },
  { id: 9, name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.4, fiber: 0 },
  { id: 10, name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4 }
];

export const getAllFoods = () => {
  return foodDatabase;
};

export const compareFoods = (food1Id: number, food2Id: number) => {
  const food1 = foodDatabase.find(food => food.id === food1Id);
  const food2 = foodDatabase.find(food => food.id === food2Id);
  
  if (!food1 || !food2) {
    throw new Error('One or both foods not found');
  }
  
  return {
    food1,
    food2,
    comparison: {
      calories: food1.calories - food2.calories,
      protein: food1.protein - food2.protein,
      carbs: food1.carbs - food2.carbs,
      fat: food1.fat - food2.fat,
      fiber: food1.fiber - food2.fiber
    }
  };
};
