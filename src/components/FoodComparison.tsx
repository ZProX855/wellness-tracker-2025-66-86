
import React, { useState, useEffect } from 'react';
import { compareFoods, foodDatabase, getAllFoods } from '../services/api';
import { toast } from 'sonner';
import { Apple, Carrot, Banana, ChevronDown, X, Info, CheckCircle } from 'lucide-react';

interface FoodData {
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  fiber: number;
}

interface ComparisonResult {
  food1: FoodData;
  food2: FoodData;
  insights?: string;
}

const FoodComparison: React.FC = () => {
  const [food1, setFood1] = useState('');
  const [food2, setFood2] = useState('');
  const [quantity1, setQuantity1] = useState(100);
  const [quantity2, setQuantity2] = useState(100);
  const [showCategoryDropdown1, setShowCategoryDropdown1] = useState(false);
  const [showCategoryDropdown2, setShowCategoryDropdown2] = useState(false);
  const [selectedCategory1, setSelectedCategory1] = useState<string | null>(null);
  const [selectedCategory2, setSelectedCategory2] = useState<string | null>(null);
  const [showFoodsDropdown1, setShowFoodsDropdown1] = useState(false);
  const [showFoodsDropdown2, setShowFoodsDropdown2] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foodCategories, setFoodCategories] = useState<string[]>([]);

  // Extract all food categories on component mount
  useEffect(() => {
    const categories = Object.keys(foodDatabase).map(category => 
      category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
    setFoodCategories(categories);
  }, []);

  const handleCompare = async () => {
    if (!food1 || !food2) {
      toast.error('Please select both foods to compare');
      return;
    }
    
    setIsLoading(true);
    try {
      const response: any = await compareFoods(food1, food2, quantity1, quantity2);
      if (response.error) {
        toast.error(response.error);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      toast.error('Error comparing foods. Please try again.');
      console.error("Food comparison error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCategory = (category: string, dropdownNumber: 1 | 2) => {
    if (dropdownNumber === 1) {
      setSelectedCategory1(category);
      setShowCategoryDropdown1(false);
      setShowFoodsDropdown1(true);
    } else {
      setSelectedCategory2(category);
      setShowCategoryDropdown2(false);
      setShowFoodsDropdown2(true);
    }
  };

  const selectFood = (food: string, dropdownNumber: 1 | 2) => {
    if (dropdownNumber === 1) {
      setFood1(food);
      setShowFoodsDropdown1(false);
    } else {
      setFood2(food);
      setShowFoodsDropdown2(false);
    }
  };

  const getFoodsInCategory = (categoryName: string | null): FoodData[] => {
    if (!categoryName) return [];
    
    // Convert "Proteins" to "proteins" for object key lookup
    const categoryKey = categoryName.toLowerCase().replace(' ', '_');
    
    // Access foods in the selected category
    return foodDatabase[categoryKey as keyof typeof foodDatabase] || [];
  };

  // Highlight the higher/lower value
  const getComparisonClass = (value1: number, value2: number, higherIsBetter = false) => {
    if (value1 === value2) return '';
    
    const isBetter = higherIsBetter ? value1 > value2 : value1 < value2;
    return isBetter ? 'text-green-600 font-medium' : 'text-amber-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'proteins':
        return <img src="https://cdn-icons-png.flaticon.com/512/2531/2531195.png" className="h-5 w-5" alt="Protein" />;
      case 'carbs':
        return <img src="https://cdn-icons-png.flaticon.com/512/3076/3076134.png" className="h-5 w-5" alt="Carbs" />;
      case 'fats':
        return <img src="https://cdn-icons-png.flaticon.com/512/2413/2413089.png" className="h-5 w-5" alt="Fats" />;
      case 'fruits':
        return <Banana className="h-5 w-5 text-amber-500" />;
      case 'vegetables':
        return <Carrot className="h-5 w-5 text-orange-500" />;
      case 'grains legumes':
        return <img src="https://cdn-icons-png.flaticon.com/512/3823/3823395.png" className="h-5 w-5" alt="Grains" />;
      case 'dairy':
        return <img src="https://cdn-icons-png.flaticon.com/512/3050/3050158.png" className="h-5 w-5" alt="Dairy" />;
      default:
        return <Apple className="h-5 w-5 text-red-500" />;
    }
  };

  // Render a nutrition card for a single food
  const renderNutritionCard = (food: FoodData, quantity: number) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-wellness-softGreen/20">
        <h4 className="font-medium text-wellness-darkGreen text-center mb-3">{food.name} ({quantity}g)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-wellness-softGreen/20 p-2 rounded-lg">
            <div className="text-xs text-wellness-charcoal/70">Calories</div>
            <div className="text-lg font-medium text-wellness-darkGreen">{(food.calories * quantity / 100).toFixed(1)} kcal</div>
          </div>
          <div className="bg-wellness-softGreen/20 p-2 rounded-lg">
            <div className="text-xs text-wellness-charcoal/70">Protein</div>
            <div className="text-lg font-medium text-wellness-darkGreen">{(food.protein * quantity / 100).toFixed(1)}g</div>
          </div>
          <div className="bg-wellness-softGreen/20 p-2 rounded-lg">
            <div className="text-xs text-wellness-charcoal/70">Carbs</div>
            <div className="text-lg font-medium text-wellness-darkGreen">{(food.carbs * quantity / 100).toFixed(1)}g</div>
          </div>
          <div className="bg-wellness-softGreen/20 p-2 rounded-lg">
            <div className="text-xs text-wellness-charcoal/70">Fats</div>
            <div className="text-lg font-medium text-wellness-darkGreen">{(food.fats * quantity / 100).toFixed(1)}g</div>
          </div>
          <div className="bg-wellness-softGreen/20 p-2 rounded-lg col-span-2">
            <div className="text-xs text-wellness-charcoal/70">Fiber</div>
            <div className="text-lg font-medium text-wellness-darkGreen">{(food.fiber * quantity / 100).toFixed(1)}g</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Comparison Tool */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 relative">
            <label className="block text-wellness-darkGreen font-medium mb-2">First Food</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <button
                  className="input-field w-full text-left flex items-center justify-between"
                  onClick={() => {
                    setShowCategoryDropdown1(!showCategoryDropdown1);
                    setShowFoodsDropdown1(false);
                  }}
                >
                  <span>{selectedCategory1 || "Select food category"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showCategoryDropdown1 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-wellness-softGreen/50 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {foodCategories.map((category, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-wellness-softGreen/30 cursor-pointer transition-colors flex items-center gap-2"
                        onClick={() => selectCategory(category, 1)}
                      >
                        {getCategoryIcon(category)}
                        {category}
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedCategory1 && (
                  <div className="mt-2">
                    <button
                      className="input-field w-full text-left flex items-center justify-between"
                      onClick={() => setShowFoodsDropdown1(!showFoodsDropdown1)}
                    >
                      <span>{food1 || "Select food"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showFoodsDropdown1 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-wellness-softGreen/50 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getFoodsInCategory(selectedCategory1).map((food, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-wellness-softGreen/30 cursor-pointer transition-colors"
                            onClick={() => selectFood(food.name, 1)}
                          >
                            <div className="flex justify-between">
                              <span>{food.name}</span>
                              <span className="text-wellness-darkGreen">{food.calories} cal</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={quantity1}
                onChange={(e) => setQuantity1(Number(e.target.value))}
                className="input-field w-24"
                min="0"
              />
              <span className="self-center text-wellness-charcoal">g</span>
            </div>
            {food1 && (
              <div className="mt-2 px-3 py-1 bg-wellness-softGreen/40 rounded-full inline-flex items-center">
                <Apple className="h-4 w-4 text-wellness-darkGreen mr-1" />
                <span className="text-sm">{food1} ({quantity1}g)</span>
                <button 
                  className="ml-2 text-wellness-darkGreen/70 hover:text-wellness-darkGreen"
                  onClick={() => {
                    setFood1('');
                    setSelectedCategory1(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* Individual food nutrition card */}
            {food1 && result && (
              <div className="mt-4">
                {renderNutritionCard(result.food1, quantity1)}
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <label className="block text-wellness-darkGreen font-medium mb-2">Second Food</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <button
                  className="input-field w-full text-left flex items-center justify-between"
                  onClick={() => {
                    setShowCategoryDropdown2(!showCategoryDropdown2);
                    setShowFoodsDropdown2(false);
                  }}
                >
                  <span>{selectedCategory2 || "Select food category"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showCategoryDropdown2 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-wellness-softGreen/50 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {foodCategories.map((category, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-wellness-softGreen/30 cursor-pointer transition-colors flex items-center gap-2"
                        onClick={() => selectCategory(category, 2)}
                      >
                        {getCategoryIcon(category)}
                        {category}
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedCategory2 && (
                  <div className="mt-2">
                    <button
                      className="input-field w-full text-left flex items-center justify-between"
                      onClick={() => setShowFoodsDropdown2(!showFoodsDropdown2)}
                    >
                      <span>{food2 || "Select food"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showFoodsDropdown2 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-wellness-softGreen/50 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getFoodsInCategory(selectedCategory2).map((food, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-wellness-softGreen/30 cursor-pointer transition-colors"
                            onClick={() => selectFood(food.name, 2)}
                          >
                            <div className="flex justify-between">
                              <span>{food.name}</span>
                              <span className="text-wellness-darkGreen">{food.calories} cal</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={quantity2}
                onChange={(e) => setQuantity2(Number(e.target.value))}
                className="input-field w-24"
                min="0"
              />
              <span className="self-center text-wellness-charcoal">g</span>
            </div>
            {food2 && (
              <div className="mt-2 px-3 py-1 bg-wellness-softGreen/40 rounded-full inline-flex items-center">
                <Banana className="h-4 w-4 text-wellness-darkGreen mr-1" />
                <span className="text-sm">{food2} ({quantity2}g)</span>
                <button 
                  className="ml-2 text-wellness-darkGreen/70 hover:text-wellness-darkGreen"
                  onClick={() => {
                    setFood2('');
                    setSelectedCategory2(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* Individual food nutrition card */}
            {food2 && result && (
              <div className="mt-4">
                {renderNutritionCard(result.food2, quantity2)}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleCompare}
          disabled={isLoading || !food1 || !food2}
          className="btn-primary rounded-lg w-full mb-6"
        >
          {isLoading ? 'Comparing...' : 'Compare Foods'}
        </button>
        
        {result && (
          <div className="bg-white bg-opacity-70 rounded-xl p-4 shadow-sm border border-wellness-softGreen/30 animate-scale-in">
            <h3 className="text-center text-xl text-wellness-darkGreen font-medium mb-4">Nutritional Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-wellness-softGreen/30">
                    <th className="py-2 px-4 text-left font-medium text-wellness-darkGreen">Nutrient</th>
                    <th className="py-2 px-4 text-right font-medium text-wellness-darkGreen">{result.food1.name} ({quantity1}g)</th>
                    <th className="py-2 px-4 text-right font-medium text-wellness-darkGreen">{result.food2.name} ({quantity2}g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b border-wellness-softGreen/20">Calories</td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food1.calories, result.food2.calories, false)}`}>
                      {result.food1.calories.toFixed(1)} kcal
                    </td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food2.calories, result.food1.calories, false)}`}>
                      {result.food2.calories.toFixed(1)} kcal
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b border-wellness-softGreen/20">Protein</td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food1.protein, result.food2.protein, true)}`}>
                      {result.food1.protein.toFixed(1)}g
                    </td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food2.protein, result.food1.protein, true)}`}>
                      {result.food2.protein.toFixed(1)}g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b border-wellness-softGreen/20">Fats</td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food1.fats, result.food2.fats, false)}`}>
                      {result.food1.fats.toFixed(1)}g
                    </td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20 ${getComparisonClass(result.food2.fats, result.food1.fats, false)}`}>
                      {result.food2.fats.toFixed(1)}g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b border-wellness-softGreen/20">Carbs</td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20`}>
                      {result.food1.carbs.toFixed(1)}g
                    </td>
                    <td className={`py-2 px-4 text-right border-b border-wellness-softGreen/20`}>
                      {result.food2.carbs.toFixed(1)}g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Fiber</td>
                    <td className={`py-2 px-4 text-right ${getComparisonClass(result.food1.fiber, result.food2.fiber, true)}`}>
                      {result.food1.fiber.toFixed(1)}g
                    </td>
                    <td className={`py-2 px-4 text-right ${getComparisonClass(result.food2.fiber, result.food1.fiber, true)}`}>
                      {result.food2.fiber.toFixed(1)}g
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {result.insights && (
              <div className="mt-4 p-4 bg-wellness-softGreen/30 rounded-lg">
                <h4 className="font-medium text-wellness-darkGreen mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-wellness-darkGreen" />
                  AI Insights
                </h4>
                <div className="text-wellness-charcoal text-sm whitespace-pre-line">
                  {/* Replace the insights with a bulleted version */}
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start">
                      <span className="text-wellness-darkGreen mr-2">🥗</span>
                      <span><strong>Nutrient Density:</strong> {result.food1.calories > result.food2.calories ? result.food1.name : result.food2.name} is more calorie-dense, while {result.food1.protein > result.food2.protein ? result.food1.name : result.food2.name} offers more protein per serving.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wellness-darkGreen mr-2">💪</span>
                      <span><strong>Protein Content:</strong> {result.food1.protein > result.food2.protein ? result.food1.name : result.food2.name} provides {Math.abs(result.food1.protein - result.food2.protein).toFixed(1)}g more protein, making it better for muscle building.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wellness-darkGreen mr-2">🍽️</span>
                      <span><strong>Dietary Goals:</strong> For weight loss, favor {result.food1.calories < result.food2.calories ? result.food1.name : result.food2.name}. For muscle building, {result.food1.protein > result.food2.protein ? result.food1.name : result.food2.name} is preferable.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wellness-darkGreen mr-2">📊</span>
                      <span><strong>Fiber Content:</strong> {result.food1.fiber > result.food2.fiber ? result.food1.name : result.food2.name} offers more fiber, supporting digestive health and sustained energy.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wellness-darkGreen mr-2">👍</span>
                      <span><strong>Recommendation:</strong> Combine both foods for a balanced nutritional profile if appropriate for your diet.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodComparison;
