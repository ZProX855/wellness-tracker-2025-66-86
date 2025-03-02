// Mock function to simulate fetching user profile data
export const fetchUserProfile = async (userId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock user profile data
  const mockProfile = {
    id: userId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://i.pravatar.cc/300',
    bio: 'A passionate health enthusiast',
    location: 'New York, USA',
    createdAt: new Date().toISOString(),
  };

  return mockProfile;
};

// Mock function to simulate updating user profile data
export const updateUserProfile = async (userId: string, updates: any) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Log the updates to simulate saving to a database
  console.log('Updating user profile:', userId, updates);

  // Mock successful update response
  return {
    success: true,
    message: 'Profile updated successfully',
  };
};

// Mock function to simulate fetching food comparison data
export const fetchFoodComparison = async (food1: string, food2: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock comparison data
  const mockComparison = {
    food1: {
      name: food1,
      calories: 200,
      protein: 10,
      carbs: 30,
      fat: 5,
    },
    food2: {
      name: food2,
      calories: 150,
      protein: 5,
      carbs: 20,
      fat: 3,
    },
    comparisonNotes: `${food1} has more calories and protein than ${food2}.`,
  };

  return mockComparison;
};

// Mock function to simulate meal recognition
export const recognizeMeal = async (imageUrl: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock meal recognition data
  const mockMeal = {
    name: 'Chicken Salad',
    calories: 450,
    protein: 30,
    carbs: 20,
    fat: 30,
  };

  return mockMeal;
};

// Mock sleep tracking API
export const trackSleep = async (duration: number, quality: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 750));

  // Mock sleep tracking data
  const mockSleepData = {
    duration,
    quality,
    recommendations: [
      'Maintain a consistent sleep schedule',
      'Create a relaxing bedtime routine',
      'Optimize your sleep environment',
    ],
  };

  return mockSleepData;
};

// Mock wellness insights API with additional plan data based on user inputs
export const getWellnessInsights = async (
  goals: string[], 
  userData?: any
): Promise<any> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('Generating wellness plan with:', { goals, userData });
  
  let recommendations: string[] = [];
  let milestones: string[] = [];
  let dietPlan: string[] = [];
  let waterPlan: string[] = [];
  let workoutPlan: string[] = [];
  
  // Generate recommendations based on goals
  if (goals.includes('Eat healthier meals')) {
    recommendations.push('Focus on whole foods like fruits, vegetables, lean proteins, and whole grains.');
    recommendations.push('Limit processed foods, added sugars, and excessive salt intake.');
    recommendations.push('Consider meal prepping to ensure healthy options are always available.');
    
    dietPlan.push('Breakfast: Oatmeal with fruits and nuts or Greek yogurt with berries and honey.');
    dietPlan.push('Lunch: Salad with lean protein (chicken, fish, tofu) and olive oil dressing.');
    dietPlan.push('Dinner: Grilled or baked protein with steamed vegetables and whole grains.');
    dietPlan.push('Snacks: Fresh fruit, nuts, or vegetable sticks with hummus.');
  }
  
  if (goals.includes('Improve fitness level')) {
    recommendations.push('Start with moderate exercise and gradually increase intensity and duration.');
    recommendations.push('Include both cardiovascular exercise and strength training in your routine.');
    recommendations.push('Find activities you enjoy to make fitness a sustainable habit.');
    
    workoutPlan.push('Day 1: 30 minutes of cardio (walking, jogging, cycling) at moderate intensity.');
    workoutPlan.push('Day 2: Upper body strength training (push-ups, dumbbell exercises, resistance bands).');
    workoutPlan.push('Day 3: Rest day or light activity like stretching or yoga.');
    workoutPlan.push('Day 4: 30 minutes of interval training (alternate between high and low intensity).');
    workoutPlan.push('Day 5: Lower body and core strength training.');
    workoutPlan.push('Day 6-7: One active recovery day and one complete rest day.');
  }
  
  if (goals.includes('Lose weight')) {
    recommendations.push('Create a moderate calorie deficit through a combination of diet and exercise.');
    recommendations.push('Focus on portion control and mindful eating practices.');
    recommendations.push('Track your progress but focus on non-scale victories too, like energy levels and how clothes fit.');
    
    if (userData?.bmi?.category === 'Overweight' || userData?.bmi?.category === 'Obese') {
      dietPlan.push('Implement portion control using smaller plates and measuring servings.');
      dietPlan.push('Replace high-calorie beverages with water, unsweetened tea, or black coffee.');
      dietPlan.push('Include protein in every meal to increase satiety and preserve muscle mass.');
      dietPlan.push('Practice intermittent fasting if appropriate (consult healthcare provider first).');
      
      workoutPlan.push('Include at least 150-300 minutes of moderate-intensity cardio per week.');
      workoutPlan.push('Add 2-3 days of full-body strength training to boost metabolism.');
      workoutPlan.push('Consider adding 1-2 HIIT sessions weekly for efficient calorie burning.');
    }
  }
  
  if (goals.includes('Gain muscle')) {
    recommendations.push('Ensure adequate protein intake (1.6-2.2g per kg of body weight).');
    recommendations.push('Implement progressive overload in your strength training routine.');
    recommendations.push('Allow for proper recovery between workouts that target the same muscle groups.');
    
    dietPlan.push('Increase caloric intake by 250-500 calories above maintenance level.');
    dietPlan.push('Consume 20-40g of protein within 2 hours post-workout.');
    dietPlan.push('Include carbohydrates before and after workouts for energy and recovery.');
    dietPlan.push('Distribute protein intake evenly throughout the day in 4-6 meals/snacks.');
    
    workoutPlan.push('Day 1: Chest and triceps focused resistance training with compound movements.');
    workoutPlan.push('Day 2: Back and biceps with emphasis on pull-ups and rows.');
    workoutPlan.push('Day 3: Rest or light activity.');
    workoutPlan.push('Day 4: Legs and core with squats, lunges, and deadlifts.');
    workoutPlan.push('Day 5: Shoulders and full body integration.');
    workoutPlan.push('Day 6-7: Active recovery and complete rest.');
  }
  
  if (goals.includes('Get better sleep')) {
    recommendations.push('Establish a consistent sleep schedule, going to bed and waking up at the same time daily.');
    recommendations.push('Create a relaxing bedtime routine to signal your body it\'s time to wind down.');
    recommendations.push('Optimize your sleep environment: cool, dark, quiet, and comfortable.');
    
    milestones.push('Within 1-2 weeks: Fall asleep more easily and wake up less during the night.');
    milestones.push('Within 3-4 weeks: Notice improved energy levels and mood during the day.');
    milestones.push('Within 6-8 weeks: Experience more consistent, high-quality sleep and better recovery.');
  }
  
  if (goals.includes('Reduce stress')) {
    recommendations.push('Practice mindfulness or meditation for at least 10 minutes daily.');
    recommendations.push('Incorporate regular physical activity, which helps reduce stress hormones.');
    recommendations.push('Set boundaries with work and technology to ensure adequate downtime.');
    
    milestones.push('Within 2 weeks: Notice greater awareness of stress triggers and improved responses.');
    milestones.push('Within 1 month: Experience fewer stress-related physical symptoms like tension or headaches.');
    milestones.push('Within 2-3 months: Develop greater emotional resilience and improved overall mood.');
  }
  
  // Generate water intake recommendations
  waterPlan.push(`Aim for at least ${userData?.preferences?.waterIntakeGoal || 8} glasses (2L) of water daily.`);
  waterPlan.push('Drink a glass of water first thing in the morning to rehydrate after sleep.');
  waterPlan.push('Keep a water bottle with you throughout the day as a visual reminder to drink.');
  waterPlan.push('Set regular reminders on your phone to prompt water intake.');
  waterPlan.push('Increase intake during and after exercise or in hot weather.');
  
  // Generate personalized recommendations based on BMI if available
  if (userData?.bmi) {
    const { category } = userData.bmi;
    
    if (category === 'Underweight') {
      recommendations.push('Focus on nutrient-dense foods to support healthy weight gain.');
      recommendations.push('Include healthy fats like avocados, nuts, and olive oil in your diet.');
      recommendations.push('Consider strength training to build muscle mass.');
      
      dietPlan = [
        'Increase caloric intake by 300-500 calories above maintenance level.',
        'Consume protein-rich foods with every meal (eggs, lean meats, dairy, legumes).',
        'Include energy-dense but nutritious foods like nuts, dried fruits, and whole-fat dairy.',
        'Consider nutritious smoothies with fruits, milk/yogurt, and nut butters as snacks.',
        'Eat regularly with 3 main meals and 2-3 snacks throughout the day.'
      ];
    } else if (category === 'Normal weight') {
      recommendations.push('Maintain your balanced diet and regular exercise routine.');
      recommendations.push('Focus on the quality of your nutrition rather than quantity.');
      recommendations.push('Consider body composition goals rather than weight goals.');
    } else if (category === 'Overweight') {
      recommendations.push('Aim for a moderate calorie deficit of 500 calories per day for sustainable weight loss.');
      recommendations.push('Prioritize protein intake to preserve muscle mass during weight loss.');
      recommendations.push('Incorporate both cardio and strength training for optimal results.');
    } else if (category === 'Obese') {
      recommendations.push('Consider consulting with a healthcare provider before starting a new exercise program.');
      recommendations.push('Focus on gradual, sustainable dietary changes rather than extreme diets.');
      recommendations.push('Start with low-impact exercises like walking, swimming, or cycling to protect joints.');
      recommendations.push('Set realistic short-term goals to build momentum and confidence.');
    }
  }
  
  // Customize workout plan based on preferences if available
  if (userData?.preferences?.selectedExerciseTypes && userData.preferences.selectedExerciseTypes.length > 0) {
    const preferredExercises = userData.preferences.selectedExerciseTypes;
    
    workoutPlan = workoutPlan.filter(plan => 
      preferredExercises.some(exercise => plan.toLowerCase().includes(exercise.toLowerCase()))
    );
    
    // Add custom workouts based on preferences
    preferredExercises.forEach(exercise => {
      if (exercise === 'Walking') {
        workoutPlan.push('Daily: 30-minute brisk walk, gradually increasing pace and distance.');
      } else if (exercise === 'Running') {
        workoutPlan.push('3-4 times weekly: Start with run/walk intervals, building to continuous running.');
      } else if (exercise === 'Swimming') {
        workoutPlan.push('2-3 times weekly: 30-minute swim sessions, alternating strokes for full-body workout.');
      } else if (exercise === 'Cycling') {
        workoutPlan.push('2-3 times weekly: 30-45 minute rides, mixing flat terrain and hills.');
      } else if (exercise === 'Weight Training') {
        workoutPlan.push('3-4 times weekly: Alternate between upper body, lower body, and full body sessions.');
      } else if (exercise === 'Yoga') {
        workoutPlan.push('2-3 times weekly: Mix of strength-building and flexibility-focused yoga sessions.');
      } else if (exercise === 'HIIT') {
        workoutPlan.push('1-2 times weekly: 20-30 minute high-intensity interval training sessions.');
      }
    });
  }
  
  // Customize diet plan based on preferences if available
  if (userData?.preferences?.selectedDietaryPreferences && userData.preferences.selectedDietaryPreferences.length > 0) {
    const dietaryPreferences = userData.preferences.selectedDietaryPreferences;
    
    // Filter out conflicting recommendations
    dietPlan = dietPlan.filter(plan => 
      !dietaryPreferences.some(pref => {
        if (pref === 'Vegetarian' && (plan.includes('meat') || plan.includes('chicken'))) return true;
        if (pref === 'Vegan' && (plan.includes('meat') || plan.includes('dairy') || plan.includes('egg'))) return true;
        if (pref === 'Gluten-free' && (plan.includes('wheat') || plan.includes('bread'))) return true;
        return false;
      })
    );
    
    // Add custom diet recommendations based on preferences
    if (dietaryPreferences.includes('Vegetarian')) {
      dietPlan.push('Include plant-based proteins like legumes, tofu, tempeh, and seitan.');
      dietPlan.push('Ensure adequate intake of vitamin B12, iron, and zinc through fortified foods or supplements.');
    }
    
    if (dietaryPreferences.includes('Vegan')) {
      dietPlan.push('Diversify protein sources with beans, lentils, chickpeas, tofu, tempeh, and seitan.');
      dietPlan.push('Consider supplementing with vitamin B12, vitamin D, omega-3, iron, and zinc.');
      dietPlan.push('Include calcium-rich foods like fortified plant milks, tofu made with calcium sulfate, and leafy greens.');
    }
    
    if (dietaryPreferences.includes('Keto')) {
      dietPlan.push('Limit carbohydrates to 20-50g per day to maintain ketosis.');
      dietPlan.push('Focus on healthy fats from avocados, olive oil, nuts, and seeds.');
      dietPlan.push('Monitor protein intake to ensure it\'s moderate (about 20-25% of calories).');
      dietPlan.push('Increase sodium, potassium, and magnesium to prevent "keto flu" symptoms.');
    }
    
    if (dietaryPreferences.includes('Mediterranean')) {
      dietPlan.push('Base meals on vegetables, fruits, whole grains, beans, nuts, and olive oil.');
      dietPlan.push('Include moderate amounts of fish, poultry, eggs, and dairy.');
      dietPlan.push('Limit red meat to occasional consumption.');
      dietPlan.push('Season foods with herbs and spices instead of salt.');
    }
  }
  
  // Add generic milestones if none have been added yet
  if (milestones.length === 0) {
    milestones.push('Week 1-2: Notice initial changes in energy levels and daily habits.');
    milestones.push('Week 3-4: Experience improvements in mood and stress levels.');
    milestones.push('Week 5-8: See measurable progress towards your specific goals.');
    milestones.push('Week 9-12: Develop sustainable habits that become part of your lifestyle.');
  }
  
  // Make sure each array has unique entries
  recommendations = [...new Set(recommendations)];
  milestones = [...new Set(milestones)];
  dietPlan = [...new Set(dietPlan)];
  waterPlan = [...new Set(waterPlan)];
  workoutPlan = [...new Set(workoutPlan)];
  
  return {
    recommendations,
    milestones,
    dietPlan,
    waterPlan,
    workoutPlan
  };
};

// Mock BMI calculator API
export const calculateBMI = async (height: number, weight: number): Promise<any> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  
  // Calculate BMI
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  
  // Determine BMI category
  let category = '';
  if (Number(bmi) < 18.5) {
    category = 'Underweight';
  } else if (Number(bmi) >= 18.5 && Number(bmi) < 25) {
    category = 'Normal weight';
  } else if (Number(bmi) >= 25 && Number(bmi) < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }
  
  // Generate advice based on BMI category
  let advice = '';
  
  if (category === 'Underweight') {
    advice = "Your BMI indicates you're underweight. Focus on nutrient-dense foods and consider consulting with a healthcare provider about healthy weight gain strategies. Include regular strength training to build muscle mass and improve overall health.";
  } else if (category === 'Normal weight') {
    advice = "Your BMI is within the normal range. Maintain your healthy weight through balanced nutrition and regular physical activity. Focus on overall wellness, including adequate sleep, stress management, and preventive healthcare.";
  } else if (category === 'Overweight') {
    advice = "Your BMI indicates you're overweight. Consider moderate changes to diet and physical activity to gradually reach a healthier weight. Focus on nutrient-dense foods, portion control, and regular exercise you enjoy.";
  } else {
    advice = "Your BMI falls in the obese category, which may increase health risks. Consider consulting with healthcare professionals for personalized guidance. Start with small, sustainable changes to diet and activity levels rather than drastic measures.";
  }
  
  return {
    bmi,
    category,
    advice
  };
};
