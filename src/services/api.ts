
// API service with Gemini 2.0 Flash integration

// Use this API key for the Gemini AI model
const GEMINI_API_KEY = "AIzaSyC3Er0jxIvcQCjPzGpp9xYH-Lc-8TuqqJc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Mock food database (USDA-based data)
export const foodDatabase = {
  proteins: [
    { name: 'Chicken Breast', calories: 165, protein: 31, fats: 3.6, carbs: 0, fiber: 0 },
    { name: 'Ground Beef (80% lean)', calories: 250, protein: 20, fats: 20, carbs: 0, fiber: 0 },
    { name: 'Tofu', calories: 76, protein: 8, fats: 4.5, carbs: 2, fiber: 0.5 },
    { name: 'Salmon', calories: 206, protein: 22, fats: 13, carbs: 0, fiber: 0 },
    { name: 'Lentils', calories: 116, protein: 9, fats: 0.4, carbs: 20, fiber: 8 },
    { name: 'Eggs', calories: 155, protein: 13, fats: 11, carbs: 1, fiber: 0 },
    { name: 'Tuna', calories: 130, protein: 29, fats: 1, carbs: 0, fiber: 0 },
    { name: 'Greek Yogurt', calories: 100, protein: 10, fats: 5, carbs: 3.6, fiber: 0 },
    { name: 'Cottage Cheese', calories: 98, protein: 11, fats: 4.3, carbs: 3.1, fiber: 0 },
    { name: 'Turkey Breast', calories: 135, protein: 30, fats: 1, carbs: 0, fiber: 0 },
    { name: 'Shrimp', calories: 99, protein: 24, fats: 0.3, carbs: 0, fiber: 0 },
    { name: 'Pork Chop', calories: 231, protein: 25, fats: 14, carbs: 0, fiber: 0 },
    { name: 'Beef Steak', calories: 271, protein: 26, fats: 19, carbs: 0, fiber: 0 },
    { name: 'Tempeh', calories: 193, protein: 19, fats: 11, carbs: 9, fiber: 0 },
    { name: 'Seitan', calories: 370, protein: 75, fats: 2, carbs: 14, fiber: 1 },
    { name: 'Cod Fish', calories: 82, protein: 18, fats: 0.7, carbs: 0, fiber: 0 },
    { name: 'Tilapia', calories: 96, protein: 20, fats: 1.7, carbs: 0, fiber: 0 },
    { name: 'Bison', calories: 143, protein: 28, fats: 2.4, carbs: 0, fiber: 0 },
  ],
  carbs: [
    { name: 'White Rice', calories: 130, protein: 2.7, fats: 0.3, carbs: 28, fiber: 0.4 },
    { name: 'Quinoa', calories: 120, protein: 4.4, fats: 1.9, carbs: 21, fiber: 2.8 },
    { name: 'Oats', calories: 389, protein: 16.9, fats: 6.9, carbs: 66, fiber: 10.6 },
    { name: 'Whole Grain Bread', calories: 69, protein: 3.6, fats: 1, carbs: 12, fiber: 1.9 },
    { name: 'Pasta', calories: 158, protein: 5.8, fats: 0.9, carbs: 31, fiber: 1.8 },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, fats: 0.1, carbs: 20, fiber: 3 },
    { name: 'Potato', calories: 77, protein: 2, fats: 0.1, carbs: 17, fiber: 2.2 },
    { name: 'Brown Rice', calories: 112, protein: 2.6, fats: 0.9, carbs: 23.5, fiber: 1.8 },
    { name: 'Corn', calories: 96, protein: 3.4, fats: 1.5, carbs: 21, fiber: 2.4 },
    { name: 'Barley', calories: 123, protein: 2.3, fats: 0.8, carbs: 28.2, fiber: 3.8 },
    { name: 'Buckwheat', calories: 343, protein: 13.3, fats: 3.4, carbs: 71.5, fiber: 10 },
    { name: 'Rice Noodles', calories: 109, protein: 0.9, fats: 0.1, carbs: 24.9, fiber: 0.9 },
    { name: 'Couscous', calories: 176, protein: 5.9, fats: 0.3, carbs: 36.5, fiber: 2.2 },
    { name: 'Bagel', calories: 245, protein: 9.6, fats: 1.0, carbs: 47.9, fiber: 2.1 },
    { name: 'English Muffin', calories: 134, protein: 4.4, fats: 1.0, carbs: 26.5, fiber: 1.6 },
    { name: 'Tortilla (Corn)', calories: 52, protein: 1.4, fats: 0.7, carbs: 10.7, fiber: 1.5 },
    { name: 'Tortilla (Flour)', calories: 104, protein: 2.8, fats: 2.1, carbs: 17.8, fiber: 1.2 },
    { name: 'Rye Bread', calories: 83, protein: 2.7, fats: 0.9, carbs: 15.5, fiber: 1.9 },
  ],
  fats: [
    { name: 'Avocado', calories: 160, protein: 2, fats: 15, carbs: 9, fiber: 7 },
    { name: 'Almonds', calories: 579, protein: 21, fats: 50, carbs: 22, fiber: 12.5 },
    { name: 'Cheese (Cheddar)', calories: 402, protein: 25, fats: 33, carbs: 1.3, fiber: 0 },
    { name: 'Butter', calories: 717, protein: 0.9, fats: 81, carbs: 0.1, fiber: 0 },
    { name: 'Olive Oil', calories: 884, protein: 0, fats: 100, carbs: 0, fiber: 0 },
    { name: 'Peanut Butter', calories: 588, protein: 25, fats: 50, carbs: 20, fiber: 6 },
    { name: 'Walnuts', calories: 654, protein: 15.2, fats: 65.2, carbs: 13.7, fiber: 6.7 },
    { name: 'Coconut Oil', calories: 862, protein: 0, fats: 100, carbs: 0, fiber: 0 },
    { name: 'Chia Seeds', calories: 486, protein: 16.5, fats: 30.7, carbs: 42.1, fiber: 34.4 },
    { name: 'Flax Seeds', calories: 534, protein: 18.3, fats: 42.2, carbs: 28.9, fiber: 27.3 },
    { name: 'Pistachios', calories: 562, protein: 20.2, fats: 45.4, carbs: 27.5, fiber: 10.3 },
    { name: 'Cashews', calories: 553, protein: 18.2, fats: 43.9, carbs: 30.2, fiber: 3.3 },
    { name: 'Macadamia Nuts', calories: 718, protein: 7.9, fats: 75.8, carbs: 13.8, fiber: 8.6 },
    { name: 'Hazelnuts', calories: 628, protein: 15.0, fats: 60.8, carbs: 16.7, fiber: 9.7 },
    { name: 'Pecans', calories: 691, protein: 9.2, fats: 72.0, carbs: 13.9, fiber: 9.6 },
    { name: 'Sunflower Seeds', calories: 584, protein: 20.8, fats: 51.5, carbs: 20.0, fiber: 8.6 },
  ],
  fruits: [
    { name: 'Banana', calories: 89, protein: 1.1, fats: 0.3, carbs: 23, fiber: 2.6 },
    { name: 'Apple', calories: 52, protein: 0.3, fats: 0.2, carbs: 14, fiber: 2.4 },
    { name: 'Strawberries', calories: 32, protein: 0.7, fats: 0.3, carbs: 7.7, fiber: 2 },
    { name: 'Mango', calories: 60, protein: 0.8, fats: 0.4, carbs: 15, fiber: 1.6 },
    { name: 'Blueberries', calories: 57, protein: 0.7, fats: 0.3, carbs: 14, fiber: 2.4 },
    { name: 'Orange', calories: 47, protein: 0.9, fats: 0.1, carbs: 12, fiber: 2.4 },
    { name: 'Pineapple', calories: 50, protein: 0.5, fats: 0.1, carbs: 13.1, fiber: 1.4 },
    { name: 'Grapes', calories: 69, protein: 0.7, fats: 0.2, carbs: 18.1, fiber: 0.9 },
    { name: 'Watermelon', calories: 30, protein: 0.6, fats: 0.2, carbs: 7.6, fiber: 0.4 },
    { name: 'Kiwi', calories: 61, protein: 1.1, fats: 0.5, carbs: 14.7, fiber: 3 },
    { name: 'Pear', calories: 57, protein: 0.4, fats: 0.1, carbs: 15.2, fiber: 3.1 },
    { name: 'Peach', calories: 39, protein: 0.9, fats: 0.3, carbs: 9.5, fiber: 1.5 },
    { name: 'Plum', calories: 46, protein: 0.7, fats: 0.3, carbs: 11.4, fiber: 1.4 },
    { name: 'Cherries', calories: 50, protein: 1.0, fats: 0.3, carbs: 12.2, fiber: 1.6 },
    { name: 'Grapefruit', calories: 42, protein: 0.8, fats: 0.1, carbs: 10.7, fiber: 1.6 },
    { name: 'Avocado', calories: 160, protein: 2.0, fats: 14.7, carbs: 8.5, fiber: 6.7 },
    { name: 'Pomegranate', calories: 83, protein: 1.7, fats: 1.2, carbs: 18.7, fiber: 4.0 },
    { name: 'Cantaloupe', calories: 34, protein: 0.8, fats: 0.2, carbs: 8.2, fiber: 0.9 },
  ],
  vegetables: [
    { name: 'Spinach', calories: 23, protein: 2.9, fats: 0.4, carbs: 3.6, fiber: 2.2 },
    { name: 'Broccoli', calories: 34, protein: 2.8, fats: 0.4, carbs: 7, fiber: 2.6 },
    { name: 'Carrots', calories: 41, protein: 0.9, fats: 0.2, carbs: 10, fiber: 2.8 },
    { name: 'Bell Peppers', calories: 31, protein: 1, fats: 0.3, carbs: 6, fiber: 2.1 },
    { name: 'Kale', calories: 49, protein: 4.3, fats: 0.9, carbs: 8.8, fiber: 3.6 },
    { name: 'Cauliflower', calories: 25, protein: 1.9, fats: 0.3, carbs: 5, fiber: 2 },
    { name: 'Tomatoes', calories: 18, protein: 0.9, fats: 0.2, carbs: 3.9, fiber: 1.2 },
    { name: 'Cucumber', calories: 15, protein: 0.7, fats: 0.1, carbs: 3.6, fiber: 0.5 },
    { name: 'Zucchini', calories: 17, protein: 1.2, fats: 0.3, carbs: 3.1, fiber: 1 },
    { name: 'Mushrooms', calories: 22, protein: 3.1, fats: 0.3, carbs: 3.3, fiber: 1 },
    { name: 'Asparagus', calories: 20, protein: 2.2, fats: 0.1, carbs: 3.9, fiber: 2.1 },
    { name: 'Brussels Sprouts', calories: 43, protein: 3.4, fats: 0.3, carbs: 9.0, fiber: 3.8 },
    { name: 'Cabbage', calories: 25, protein: 1.3, fats: 0.1, carbs: 5.8, fiber: 2.5 },
    { name: 'Celery', calories: 16, protein: 0.7, fats: 0.2, carbs: 3.4, fiber: 1.6 },
    { name: 'Eggplant', calories: 25, protein: 1.0, fats: 0.2, carbs: 6.0, fiber: 3.0 },
    { name: 'Green Beans', calories: 31, protein: 1.8, fats: 0.2, carbs: 7.0, fiber: 3.4 },
    { name: 'Onion', calories: 40, protein: 1.1, fats: 0.1, carbs: 9.3, fiber: 1.7 },
    { name: 'Lettuce', calories: 15, protein: 1.4, fats: 0.2, carbs: 2.9, fiber: 1.3 },
  ],
  grains_legumes: [
    { name: 'Black Beans', calories: 132, protein: 8.9, fats: 0.5, carbs: 23.7, fiber: 8.7 },
    { name: 'Chickpeas', calories: 164, protein: 8.9, fats: 2.6, carbs: 27.4, fiber: 7.6 },
    { name: 'Pinto Beans', calories: 143, protein: 9, fats: 0.7, carbs: 26.2, fiber: 9 },
    { name: 'Kidney Beans', calories: 127, protein: 8.7, fats: 0.5, carbs: 22.8, fiber: 6.4 },
    { name: 'Couscous', calories: 112, protein: 3.8, fats: 0.2, carbs: 23.2, fiber: 1.4 },
    { name: 'Bulgur', calories: 83, protein: 3.1, fats: 0.2, carbs: 18.6, fiber: 4.5 },
    { name: 'Millet', calories: 119, protein: 3.5, fats: 1, carbs: 23.7, fiber: 2.3 },
    { name: 'Amaranth', calories: 103, protein: 3.8, fats: 1.8, carbs: 18.7, fiber: 2.8 },
    { name: 'Buckwheat', calories: 92, protein: 3.4, fats: 0.8, carbs: 19.9, fiber: 2.7 },
    { name: 'Spelt', calories: 127, protein: 5.5, fats: 0.8, carbs: 26.3, fiber: 2.7 },
    { name: 'Navy Beans', calories: 140, protein: 8.2, fats: 0.6, carbs: 26.0, fiber: 10.5 },
    { name: 'Lentils (Red)', calories: 115, protein: 9.0, fats: 0.4, carbs: 20.0, fiber: 8.0 },
    { name: 'Lentils (Green)', calories: 116, protein: 9.0, fats: 0.4, carbs: 20.0, fiber: 7.9 },
    { name: 'Split Peas', calories: 118, protein: 8.3, fats: 0.4, carbs: 21.1, fiber: 8.3 },
    { name: 'Farro', calories: 170, protein: 7.0, fats: 1.5, carbs: 34.0, fiber: 5.0 },
    { name: 'Wild Rice', calories: 101, protein: 4.0, fats: 0.3, carbs: 21.0, fiber: 2.0 },
  ],
  dairy: [
    { name: 'Milk (Whole)', calories: 61, protein: 3.2, fats: 3.3, carbs: 4.8, fiber: 0 },
    { name: 'Milk (Skim)', calories: 34, protein: 3.4, fats: 0.1, carbs: 5, fiber: 0 },
    { name: 'Yogurt (Plain)', calories: 59, protein: 3.5, fats: 3.3, carbs: 4.7, fiber: 0 },
    { name: 'Feta Cheese', calories: 264, protein: 14.2, fats: 21.3, carbs: 4.1, fiber: 0 },
    { name: 'Mozzarella', calories: 280, protein: 28, fats: 17, carbs: 3.1, fiber: 0 },
    { name: 'Cream Cheese', calories: 342, protein: 6.2, fats: 34, carbs: 2.7, fiber: 0 },
    { name: 'Sour Cream', calories: 198, protein: 3, fats: 19.4, carbs: 4.6, fiber: 0 },
    { name: 'Parmesan Cheese', calories: 431, protein: 38.5, fats: 29, carbs: 3.2, fiber: 0 },
    { name: 'Goat Cheese', calories: 364, protein: 21.6, fats: 29.8, carbs: 0.9, fiber: 0 },
    { name: 'Swiss Cheese', calories: 380, protein: 27, fats: 28, carbs: 5.4, fiber: 0 },
    { name: 'Cottage Cheese (1%)', calories: 82, protein: 12.4, fats: 1.0, carbs: 3.1, fiber: 0 },
    { name: 'Greek Yogurt (Plain)', calories: 59, protein: 10.0, fats: 0.4, carbs: 3.6, fiber: 0 },
    { name: 'Ricotta Cheese', calories: 174, protein: 11.4, fats: 12.6, carbs: 4.0, fiber: 0 },
    { name: 'Blue Cheese', calories: 353, protein: 21.4, fats: 28.7, carbs: 2.3, fiber: 0 },
    { name: 'Brie Cheese', calories: 334, protein: 20.8, fats: 27.7, carbs: 0.5, fiber: 0 },
    { name: 'Butter Milk', calories: 62, protein: 3.3, fats: 3.3, carbs: 4.8, fiber: 0 },
  ]
};

// Helper function to get all foods
export const getAllFoods = () => {
  const allCategories = Object.values(foodDatabase);
  return allCategories.flat();
};

// Helper function for Gemini API calls with better error handling and retry logic
async function callGeminiAPI(prompt: string, temperature: number = 0.7, isVision: boolean = false, imageData?: string, retryCount: number = 2) {
  try {
    // Always use gemini-2.0-flash as requested
    const model = "gemini-2.0-flash";
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    let requestBody: any = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 64
      }
    };
    
    // Add image data for vision analysis if provided
    if (isVision && imageData) {
      try {
        // Extract mime type and base64 data properly
        const mimeTypeMatch = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64Data = imageData.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');

        requestBody.contents[0].parts.unshift({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      } catch (imageFormatError) {
        console.error("Error formatting image data:", imageFormatError);
        throw new Error("Invalid image format. Please try a different image.");
      }
    }
    
    console.log(`Calling ${model} API...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      
      // Check if we can retry the request
      if (retryCount > 0) {
        console.log(`Retrying API call, ${retryCount} attempts left...`);
        return await callGeminiAPI(prompt, temperature, isVision, imageData, retryCount - 1);
      }
      
      throw new Error(`API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("Empty response from API:", data);
      throw new Error("No response generated from API");
    }
    
    // Handle blocked content case
    if (data.candidates[0].finishReason === "SAFETY") {
      console.warn("Content blocked by safety filters:", data);
      throw new Error("Content blocked by safety filters. Please try a different prompt or image.");
    }
    
    // Check if we have valid content
    if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
      console.error("Unexpected API response format:", data);
      
      // Try one more time with a simplified prompt if we have retry attempts left
      if (retryCount > 0) {
        const simplifiedPrompt = "Describe what you see in this image briefly.";
        return await callGeminiAPI(simplifiedPrompt, temperature, isVision, imageData, retryCount - 1);
      }
      
      throw new Error("Invalid response format from API");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Check if we can retry with a different approach
    if (retryCount > 0 && isVision) {
      try {
        // Fall back to a text-only analysis with a generic response
        const fallbackPrompt = "You are a nutrition expert. Provide general nutrition facts about a balanced meal.";
        const fallbackResponse = await callGeminiAPI(fallbackPrompt, temperature, false, undefined, 0);
        
        return "Could not properly analyze the image. Here is some general nutrition advice:\n\n" + fallbackResponse;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
    
    throw error;
  }
}

// AI Nutrition Assistant chat function
export const getChatResponse = async (message: string) => {
  try {
    const prompt = `
      You are a friendly AI nutrition assistant. 
      The user is asking: "${message}"
      
      Please provide a short, clear, and engaging response about nutrition. 
      Use bullet points and emojis where appropriate. 
      Keep your response concise (maximum 3-4 bullet points) and end with a quick recommendation.
      
      Format your response with bullet points and emojis, making it easy to scan and understand.
      
      If the user asks for a meal plan or specific nutritional advice, include sample foods with their nutritional values.
      If they ask about weight management, provide practical tips based on scientific evidence.
      If they ask about specific diets (keto, paleo, vegan, etc.), provide a balanced view of benefits and considerations.
    `;
    
    const aiResponse = await callGeminiAPI(prompt);
    
    return {
      text: aiResponse,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      text: "I'm sorry, I couldn't process your request right now. Please try again later.",
      loading: false,
      error: "API error"
    };
  }
};

// Food comparison function with AI insights
export const compareFoods = async (food1: string, food2: string, quantity1: number = 100, quantity2: number = 100) => {
  // First get the basic nutrition data from our database
  const allFoods = getAllFoods();
  const food1Data = allFoods.find(food => food.name.toLowerCase() === food1.toLowerCase());
  const food2Data = allFoods.find(food => food.name.toLowerCase() === food2.toLowerCase());
  
  if (!food1Data || !food2Data) {
    return {
      error: "One or both foods not found in our database",
      data: null
    };
  }
  
  // Adjust for quantity
  const food1Adjusted = {
    name: food1Data.name,
    calories: (food1Data.calories * quantity1) / 100,
    protein: (food1Data.protein * quantity1) / 100,
    fats: (food1Data.fats * quantity1) / 100,
    carbs: (food1Data.carbs * quantity1) / 100,
    fiber: (food1Data.fiber * quantity1) / 100,
  };
  
  const food2Adjusted = {
    name: food2Data.name,
    calories: (food2Data.calories * quantity2) / 100,
    protein: (food2Data.protein * quantity2) / 100,
    fats: (food2Data.fats * quantity2) / 100,
    carbs: (food2Data.carbs * quantity2) / 100,
    fiber: (food2Data.fiber * quantity2) / 100,
  };
  
  try {
    // Get AI insights on the comparison
    const prompt = `
      Compare the nutritional values of ${quantity1}g ${food1} vs ${quantity2}g ${food2}:
      
      ${food1} (${quantity1}g):
      - Calories: ${food1Adjusted.calories.toFixed(1)} kcal
      - Protein: ${food1Adjusted.protein.toFixed(1)}g
      - Fats: ${food1Adjusted.fats.toFixed(1)}g
      - Carbs: ${food1Adjusted.carbs.toFixed(1)}g
      - Fiber: ${food1Adjusted.fiber.toFixed(1)}g
      
      ${food2} (${quantity2}g):
      - Calories: ${food2Adjusted.calories.toFixed(1)} kcal
      - Protein: ${food2Adjusted.protein.toFixed(1)}g
      - Fats: ${food2Adjusted.fats.toFixed(1)}g
      - Carbs: ${food2Adjusted.carbs.toFixed(1)}g
      - Fiber: ${food2Adjusted.fiber.toFixed(1)}g
      
      Provide a short, concise comparative analysis of these foods. Format your response as 4-5 bullet points with emojis, highlighting:
      1. Which food is more nutrient-dense and why
      2. How each food might fit into different dietary goals (weight loss, muscle building)
      3. Which food has more fiber and its benefits
      4. A simple practical recommendation for incorporating these foods
      
      Be friendly, concise, and focused on practical advice.
    `;
    
    const aiInsights = await callGeminiAPI(prompt);
    
    return {
      error: null,
      data: {
        food1: food1Adjusted,
        food2: food2Adjusted,
        insights: aiInsights
      }
    };
  } catch (error) {
    console.error("Food comparison API error:", error);
    return {
      error: "Failed to get AI insights",
      data: {
        food1: food1Adjusted,
        food2: food2Adjusted,
        insights: null
      }
    };
  }
};

// BMI calculator and advice
export const calculateBMI = async (height: number, weight: number) => {
  // Calculate BMI
  const bmi = weight / ((height/100) * (height/100));
  const bmiValue = bmi.toFixed(1);
  
  let category = '';
  
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal weight';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }
  
  try {
    // Get AI-generated advice based on BMI
    const prompt = `
      A user has a BMI of ${bmiValue}, which puts them in the ${category} category.
      
      Provide personalized advice with 4-5 bullet points with emojis covering:
      1. A friendly assessment of their current BMI
      2. 2-3 specific, actionable nutrition recommendations
      3. 1-2 physical activity suggestions
      4. A brief timeline for healthy changes if needed
      
      Make each bullet point concise, friendly, and focused on overall health rather than just weight.
      Format your response with emojis at the beginning of each bullet point.
    `;
    
    const advice = await callGeminiAPI(prompt);
    
    return {
      bmi: bmiValue,
      category,
      advice
    };
  } catch (error) {
    console.error("BMI advice API error:", error);
    
    // Fallback advice if API fails
    let fallbackAdvice = '';
    
    if (bmi < 18.5) {
      fallbackAdvice = "🥗 Focus on nutrient-dense foods to help you gain weight in a healthy way. Include healthy fats like avocados, nuts, and olive oil. Strength training can help build muscle mass. Consider smaller, more frequent meals if you struggle with appetite.";
    } else if (bmi >= 18.5 && bmi < 25) {
      fallbackAdvice = "🌟 You're in a healthy weight range! Focus on maintaining balanced nutrition with plenty of whole foods. Regular physical activity will help maintain muscle mass and cardiovascular health. Stay hydrated and prioritize quality sleep.";
    } else if (bmi >= 25 && bmi < 30) {
      fallbackAdvice = "🚶 Gradual changes to diet and increasing physical activity can help. Focus on whole foods, adequate protein, and plenty of vegetables. Even small amounts of daily movement can make a difference. Staying hydrated can help manage hunger.";
    } else {
      fallbackAdvice = "💪 Start with small, sustainable changes rather than drastic diets. Increasing protein and fiber can help manage hunger. Regular movement, even just walking, is beneficial. Consider consulting a healthcare provider for personalized guidance.";
    }
    
    return {
      bmi: bmiValue,
      category,
      advice: fallbackAdvice
    };
  }
};

// More robust meal recognition function with better error handling
export const recognizeMeal = async (imageData: string) => {
  try {
    // First, validate the image data
    if (!imageData || !imageData.startsWith('data:image/')) {
      throw new Error("Invalid image data");
    }
    
    // Use a single, well-structured prompt for better reliability
    const analyzePrompt = `
      You are a professional nutritionist analyzing a food image. 

      TASK 1: FOOD IDENTIFICATION
      Identify exactly what food is shown in this image in 1-2 sentences. Be specific and precise.
      If you see multiple food items, list all major items.
      If you cannot identify the food or there is no food in the image, reply with: "NO_FOOD_DETECTED"

      TASK 2: NUTRITION ANALYSIS
      If food is detected, provide nutrition estimates in the following format:
      Calories: [number]
      Protein: [number]g
      Carbs: [number]g
      Fats: [number]g
      Fiber: [number]g

      Use realistic values based on standard nutritional data. For example:
      - A plate of pasta: 350-500 calories, 10-15g protein, 60-80g carbs, 5-15g fat, 2-4g fiber
      - A salad: 150-300 calories, 5-10g protein, 10-20g carbs, 8-15g fat, 3-6g fiber
      - A burger: 400-600 calories, 20-30g protein, 30-45g carbs, 20-35g fat, 2-5g fiber

      TASK 3: RECOMMENDATIONS
      Provide 3-4 specific nutritional recommendations or benefits about this meal in bullet point format.
      Each bullet point should start with an emoji.

      Format your complete response like this:
      [FOOD_ID]
      Description of the food items identified

      [NUTRITION]
      Calories: X
      Protein: Xg
      Carbs: Xg
      Fats: Xg
      Fiber: Xg

      [RECOMMENDATIONS]
      • Recommendation 1
      • Recommendation 2
      • Recommendation 3
    `;
    
    // Analyze with a more resilient approach using gemini-2.0-flash
    const analysisResponse = await callGeminiAPI(analyzePrompt, 0.2, true, imageData);
    
    // Check if no food was identified
    if (analysisResponse.includes("NO_FOOD_DETECTED")) {
      return {
        foodIdentified: "Could not identify the meal",
        nutritionInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0
        },
        recommendations: "We couldn't identify any food in this image. Please try again with a clearer image of food items.",
        fullAnalysis: analysisResponse
      };
    }
    
    // Parse the structured response
    const sections = analysisResponse.split(/\[(\w+)\]\n/);
    
    let foodIdentified = "Unknown meal";
    let caloriesValue = 0;
    let proteinValue = 0;
    let carbsValue = 0;
    let fatsValue = 0;
    let fiberValue = 0;
    let recommendations = "No specific recommendations available.";
    
    // Extract information from structured sections
    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i];
      const content = sections[i + 1]?.trim() || "";
      
      if (sectionName === "FOOD_ID") {
        foodIdentified = content;
      } else if (sectionName === "NUTRITION") {
        // Extract nutrition values
        const caloriesMatch = content.match(/calories:?\s*(\d+)/i);
        const proteinMatch = content.match(/protein:?\s*(\d+)/i);
        const carbsMatch = content.match(/carbs:?\s*(\d+)/i);
        const fatsMatch = content.match(/fats:?\s*(\d+)/i);
        const fiberMatch = content.match(/fiber:?\s*(\d+)/i);
        
        caloriesValue = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;
        proteinValue = proteinMatch ? parseInt(proteinMatch[1]) : 0;
        carbsValue = carbsMatch ? parseInt(carbsMatch[1]) : 0;
        fatsValue = fatsMatch ? parseInt(fatsMatch[1]) : 0;
        fiberValue = fiberMatch ? parseInt(fiberMatch[1]) : 0;
        
        // Validate the values against reasonable ranges
        caloriesValue = Math.min(Math.max(caloriesValue, 0), 1500);
        proteinValue = Math.min(Math.max(proteinValue, 0), 100);
        carbsValue = Math.min(Math.max(carbsValue, 0), 150);
        fatsValue = Math.min(Math.max(fatsValue, 0), 100);
        fiberValue = Math.min(Math.max(fiberValue, 0), 40);
      } else if (sectionName === "RECOMMENDATIONS") {
        recommendations = content;
      }
    }
    
    // If no structured response was received, try to extract information using regex
    if (!foodIdentified || foodIdentified === "Unknown meal") {
      // Try to find food description in unstructured text
      const foodMatch = analysisResponse.match(/(?:I see|This is|The image shows|This appears to be)\s+([^.!?]+[.!?])/i);
      if (foodMatch) {
        foodIdentified = foodMatch[1].trim();
      }
    }
    
    // If nutrition values weren't found, try alternative extraction
    if (caloriesValue === 0 && proteinValue === 0 && carbsValue === 0) {
      // Try to find nutrition values in unstructured text
      const altCaloriesMatch = analysisResponse.match(/(?:estimated|approximately|about|around|roughly)\s+(\d+)\s*(?:to|-)\s*(\d+)\s*calories/i);
      if (altCaloriesMatch) {
        const minCal = parseInt(altCaloriesMatch[1]);
        const maxCal = parseInt(altCaloriesMatch[2]);
        caloriesValue = Math.floor((minCal + maxCal) / 2);
      }
      
      // Make educated guesses based on food type
      if (foodIdentified.toLowerCase().includes("salad")) {
        caloriesValue = caloriesValue || 250;
        proteinValue = proteinValue || 8;
        carbsValue = carbsValue || 15;
        fatsValue = fatsValue || 12;
        fiberValue = fiberValue || 5;
      } else if (foodIdentified.toLowerCase().includes("pasta") || foodIdentified.toLowerCase().includes("noodle")) {
        caloriesValue = caloriesValue || 400;
        proteinValue = proteinValue || 12;
        carbsValue = carbsValue || 70;
        fatsValue = fatsValue || 8;
        fiberValue = fiberValue || 3;
      } else if (foodIdentified.toLowerCase().includes("burger") || foodIdentified.toLowerCase().includes("sandwich")) {
        caloriesValue = caloriesValue || 550;
        proteinValue = proteinValue || 25;
        carbsValue = carbsValue || 45;
        fatsValue = fatsValue || 30;
        fiberValue = fiberValue || 3;
      } else if (foodIdentified.toLowerCase().includes("chicken") || foodIdentified.toLowerCase().includes("fish")) {
        caloriesValue = caloriesValue || 300;
        proteinValue = proteinValue || 30;
        carbsValue = carbsValue || 5;
        fatsValue = fatsValue || 15;
        fiberValue = fiberValue || 1;
      } else if (foodIdentified.toLowerCase().includes("rice") || foodIdentified.toLowerCase().includes("grain")) {
        caloriesValue = caloriesValue || 350;
        proteinValue = proteinValue || 7;
        carbsValue = carbsValue || 70;
        fatsValue = fatsValue || 3;
        fiberValue = fiberValue || 3;
      } else if (foodIdentified.toLowerCase().includes("fruit") || foodIdentified.toLowerCase().includes("vegetable")) {
        caloriesValue = caloriesValue || 150;
        proteinValue = proteinValue || 3;
        carbsValue = carbsValue || 30;
        fatsValue = fatsValue || 1;
        fiberValue = fiberValue || 7;
      } else {
        // Default mixed meal values
        caloriesValue = caloriesValue || 400;
        proteinValue = proteinValue || 20;
        carbsValue = carbsValue || 40;
        fatsValue = fatsValue || 15;
        fiberValue = fiberValue || 4;
      }
    }
    
    // Format recommendations with emojis if they don't already have them
    if (!recommendations.includes("•") && !recommendations.includes("- ") && !/[\u{1F300}-\u{1F6FF}]/u.test(recommendations)) {
      const bullets = ['🥗', '💪', '🍽️', '👍', '✨'];
      recommendations = recommendations.split('\n')
        .filter(line => line.trim().length > 0)
        .map((line, index) => {
          const emoji = bullets[index % bullets.length];
          return `${emoji} ${line}`;
        })
        .join('\n');
    }
    
    return {
      foodIdentified,
      nutritionInfo: {
        calories: caloriesValue,
        protein: proteinValue,
        carbs: carbsValue,
        fats: fatsValue,
        fiber: fiberValue
      },
      recommendations,
      fullAnalysis: analysisResponse
    };
  } catch (error) {
    console.error("Meal recognition API error:", error);
    
    // Provide a more helpful fallback response
    return {
      foodIdentified: "Error analyzing the meal",
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0
      },
      recommendations: "We encountered an error while analyzing this image. Please try again with a different image or try again later. For best results, use well-lit photos of food items without text overlays.",
      fullAnalysis: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Wellness journey insights function
export interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
}

export const getWellnessInsights = async (goals: string[]): Promise<WellnessInsights> => {
  try {
    const prompt = `
      The user has selected the following wellness goals:
      ${goals.map(goal => `- ${goal}`).join('\n')}
      
      Based on these goals, provide:
      1. 5 actionable recommendations to help them achieve these goals
      2. 5 realistic milestones they can expect to see on their journey
      
      Format your response as a JSON object with two arrays:
      {
        "recommendations": ["🥗 Recommendation 1", "💪 Recommendation 2", ...],
        "milestones": ["Week 1-2: 🌱 Milestone 1", "Month 1: 🏆 Milestone 2", ...]
      }
      
      Make sure to include emojis at the beginning of each recommendation and milestone.
      Each item should be very concise (15 words or less).
      For milestones, include a timeframe (e.g., "Week 1-2:", "Month 3:")
    `;
    
    const aiResponse = await callGeminiAPI(prompt);
    
    try {
      // Try to parse the response as JSON
      const parsedResponse = JSON.parse(aiResponse);
      return {
        recommendations: Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : [],
        milestones: Array.isArray(parsedResponse.milestones) ? parsedResponse.milestones : []
      };
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      
      // Fallback: Try to extract recommendations and milestones from text
      const recommendationsMatch = aiResponse.match(/recommendations:?\s*\n((?:- [^\n]+\n?)+)/i);
      const milestonesMatch = aiResponse.match(/milestones:?\s*\n((?:- [^\n]+\n?)+)/i);
      
      const recommendations = recommendationsMatch ? 
        recommendationsMatch[1].split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.trim().substring(2)) : 
        [];
      
      const milestones = milestonesMatch ? 
        milestonesMatch[1].split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.trim().substring(2)) : 
        [];
      
      return { recommendations, milestones };
    }
  } catch (error) {
    console.error("Wellness insights API error:", error);
    
    // Return fallback data if the API call fails
    return {
      recommendations: [
        "🥗 Start with small, achievable daily habits",
        "📊 Track your progress beyond just the scale",
        "🍎 Focus on how foods make you feel",
        "💪 Include strength training alongside cardio",
        "😴 Prioritize sleep for recovery and reduced cravings"
      ],
      milestones: [
        "Week 1-2: 🌱 Notice improved energy levels",
        "Week 3-4: 💪 Feel stronger during workouts",
        "Week 6-8: 👖 Clothes fit differently",
        "Month 3: 🏆 Significant habit changes established",
        "Month 6: 🌟 Major progress toward your goals"
      ]
    };
  }
};
