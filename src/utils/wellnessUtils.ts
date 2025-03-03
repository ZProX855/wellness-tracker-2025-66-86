
export const generateDietPlan = (preference: string, bmiCategory: string): string[] => {
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

export const generateWaterPlan = (baseIntake: number, weight: number | ''): string => {
  if (typeof weight !== 'number') return `🚰 Aim to drink ${baseIntake} glasses (2L) of water daily. Set reminders on your phone to stay consistent.`;
  
  const weightBasedLiters = Math.round((weight * 30) / 1000 * 10) / 10;
  const glasses = Math.round(weightBasedLiters * 4);
  
  return `🚰 Based on your weight, aim to drink ${glasses} glasses (${weightBasedLiters}L) of water daily. 💧 Increase intake during exercise or hot weather. 📱 Consider using a water tracking app or set reminders every 2 hours during waking hours.`;
};

export const generateTrainingPlan = (preference: string, days: number, bmiCategory: string): string[] => {
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
