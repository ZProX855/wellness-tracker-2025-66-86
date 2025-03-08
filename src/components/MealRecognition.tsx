import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, X, CheckCircle, EggIcon, Loader, AlertCircle, InfoIcon } from 'lucide-react';
import { recognizeMeal } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface MealData {
  mealDescription: string;
  foodIdentified: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  recommendations: string | string[];
  fullAnalysis?: string;
}

const MealRecognition: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MealData | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size <= 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 1200;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setAnalyzeError(null);
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        setIsUploading(false);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        setIsUploading(false);
        return;
      }
      
      try {
        const resizedImage = await resizeImage(file);
        setSelectedImage(resizedImage);
        setResult(null);
        setIsUploading(false);
        
        analyzeImage(resizedImage);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error('Error processing the image. Please try another image.');
        setIsUploading(false);
      }
    } else {
      setIsUploading(false);
    }
  };
  
  const analyzeImage = async (imageData: string) => {
    if (!imageData) {
      toast.error('Please upload an image first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalyzeError(null);
    
    try {
      const timeoutPromise = new Promise<MealData>((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout')), 45000)
      );
      
      const analysisPromise = recognizeMeal(imageData);
      
      const mealData = await Promise.race([
        analysisPromise,
        timeoutPromise
      ]) as MealData;
      
      if (mealData.foodIdentified === "Could not identify the meal" || 
          mealData.foodIdentified === "Error analyzing the meal") {
        if (Array.isArray(mealData.recommendations)) {
          setAnalyzeError(mealData.recommendations.join('\n'));
        } else {
          setAnalyzeError(mealData.recommendations);
        }
        setResult(null);
      } else {
        setResult(mealData);
        
        const { calories, protein, carbs, fats } = mealData.nutritionInfo;
        
        if (calories > 1500 || protein > 80 || carbs > 120 || fats > 70) {
          toast.warning('The nutritional values may be higher than expected. Consider them as estimates.', {
            duration: 6000,
          });
        }
      }
    } catch (error) {
      console.error("Meal recognition error:", error);
      let errorMessage = "Error analyzing the meal. Please try again.";
      
      if (error instanceof Error) {
        if (error.message === 'Analysis timeout') {
          errorMessage = "Analysis took too long. Please try a different image or try again later.";
        } else if (error.message.includes("API")) {
          errorMessage = "AI service temporarily unavailable. Please try again in a few moments.";
        } else if (error.message.includes("safety")) {
          errorMessage = "This image couldn't be analyzed due to content safety filters. Please try a different image.";
        }
      }
      
      toast.error(errorMessage);
      setAnalyzeError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAnalyze = () => {
    if (selectedImage) {
      setRetryCount(prevCount => prevCount + 1);
      analyzeImage(selectedImage);
    }
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setAnalyzeError(null);
    setShowDetails(false);
    setRetryCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveMealToHistory = async () => {
    if (!result || !user) {
      toast.error('Cannot save meal data. Please try again or log in.');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        const base64Response = await fetch(selectedImage);
        const blob = await base64Response.blob();
        
        const file = new File([blob], `meal-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('meal-images')
          .upload(`${user.id}/${file.name}`, file);
          
        if (storageError) {
          console.error('Error uploading image:', storageError);
        } else if (storageData) {
          const { data: urlData } = supabase.storage
            .from('meal-images')
            .getPublicUrl(`${user.id}/${file.name}`);
            
          if (urlData) {
            imageUrl = urlData.publicUrl;
          }
        }
      }
      
      const { error } = await supabase.from('meal_recognitions').insert({
        user_id: user.id,
        meal_name: result.foodIdentified,
        calories: result.nutritionInfo.calories,
        proteins: result.nutritionInfo.protein,
        carbs: result.nutritionInfo.carbs,
        fats: result.nutritionInfo.fats,
        date: new Date().toISOString().split('T')[0],
        image_url: imageUrl
      });
      
      if (error) {
        console.error('Error saving meal data:', error);
        toast.error('Failed to save meal data to your history.');
      } else {
        toast.success('Meal saved to your history!');
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatRecommendations = (text: string | string[]): string => {
    if (!text) return '';
    
    if (Array.isArray(text)) {
      const bullets = ['🥗', '💪', '🍽️', '👍', '✨'];
      return text.map((line, index) => {
        const emoji = bullets[index % bullets.length];
        return `${emoji} ${line}`;
      }).join('\n');
    }
    
    if (typeof text === 'string') {
      if (text.includes('•') || text.includes('- ') || /[\u{1F300}-\u{1F6FF}]/u.test(text)) {
        return text;
      }
      
      const bullets = ['🥗', '💪', '🍽️', '👍', '✨'];
      return text.split('\n')
        .filter(line => line.trim().length > 0)
        .map((line, index) => {
          const emoji = bullets[index % bullets.length];
          return `${emoji} ${line}`;
        })
        .join('\n');
    }
    
    return String(text);
  };

  const calculateMacroPercentages = () => {
    if (!result) return { protein: 0, carbs: 0, fats: 0 };
    
    const { protein, carbs, fats } = result.nutritionInfo;
    const total = protein + carbs + fats;
    
    if (total === 0) return { protein: 33, carbs: 33, fats: 34 };
    
    return {
      protein: Math.round((protein / total) * 100),
      carbs: Math.round((carbs / total) * 100),
      fats: Math.round((fats / total) * 100)
    };
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-panel p-6">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-wellness-darkGreen mb-2">AI Meal Recognition</h3>
          <p className="text-wellness-charcoal text-sm">Upload a photo of your meal to get nutritional information and personalized recommendations.</p>
        </div>
        
        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-wellness-softGreen rounded-xl p-8 text-center bg-white bg-opacity-50 mb-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                if (file.type.match('image.*')) {
                  const dummyEvent = {
                    target: {
                      files: [file]
                    }
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleImageChange(dummyEvent);
                } else {
                  toast.error('Please drop an image file');
                }
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="w-10 h-10 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-wellness-darkGreen">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-20 h-20 rounded-full bg-wellness-softGreen/50 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-wellness-darkGreen" />
                </div>
                <div>
                  <p className="text-wellness-darkGreen font-medium">Drag and drop an image here, or</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 btn-secondary rounded-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </button>
                </div>
                <p className="text-sm text-wellness-charcoal/70">
                  Supported formats: JPG, PNG, WEBP (Max: 10MB)<br/>
                  Try to use clear, well-lit food images for best results
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full h-auto rounded-xl max-h-80 object-cover"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-wellness-darkGreen text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {isAnalyzing && (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <Loader className="h-10 w-10 text-wellness-darkGreen animate-spin" />
                  <p className="text-wellness-darkGreen">Analyzing your meal with Gemini AI...</p>
                  <p className="text-xs text-wellness-charcoal">This may take up to 30 seconds for accurate results</p>
                </div>
              </div>
            )}
            
            {analyzeError && !isAnalyzing && !result && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{analyzeError}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!isAnalyzing && !analyzeError && !result && (
              <button
                onClick={handleAnalyze}
                className="btn-primary rounded-lg w-full flex items-center justify-center gap-2"
              >
                <Camera className="h-5 w-5" />
                Analyze Meal
              </button>
            )}
            
            {result && (
              <div className="animate-fade-in">
                <div className="bg-white bg-opacity-70 rounded-xl p-4 shadow-sm border border-wellness-softGreen/30 mb-4">
                  <div className="mb-4 p-4 bg-wellness-softGreen/30 rounded-lg">
                    <p className="text-wellness-darkGreen font-medium whitespace-pre-line">
                      {result.mealDescription}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-wellness-darkGreen" />
                    <h4 className="font-medium text-wellness-darkGreen">Identified Meal</h4>
                  </div>
                  
                  <div className="p-3 bg-wellness-softGreen/20 rounded-lg mb-4">
                    <p className="text-wellness-darkGreen">{result.foodIdentified}</p>
                  </div>
                  
                  <h4 className="font-medium text-wellness-darkGreen mb-2 flex justify-between items-center">
                    <span>Nutrition Information</span>
                    <button 
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs text-wellness-mediumGreen hover:text-wellness-darkGreen flex items-center gap-1"
                    >
                      <InfoIcon className="h-3 w-3" />
                      {showDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                    <div className="bg-wellness-softGreen/40 p-2 rounded-lg text-center flex flex-col justify-center">
                      <div className="text-sm text-wellness-charcoal">Calories</div>
                      <div className="font-medium text-wellness-darkGreen text-lg">{result.nutritionInfo.calories}</div>
                    </div>
                    <div className="bg-wellness-softGreen/40 p-2 rounded-lg text-center flex flex-col justify-center">
                      <div className="text-sm text-wellness-charcoal">Protein</div>
                      <div className="font-medium text-wellness-darkGreen text-lg">{result.nutritionInfo.protein}g</div>
                    </div>
                    <div className="bg-wellness-softGreen/40 p-2 rounded-lg text-center flex flex-col justify-center">
                      <div className="text-sm text-wellness-charcoal">Carbs</div>
                      <div className="font-medium text-wellness-darkGreen text-lg">{result.nutritionInfo.carbs}g</div>
                    </div>
                    <div className="bg-wellness-softGreen/40 p-2 rounded-lg text-center flex flex-col justify-center">
                      <div className="text-sm text-wellness-charcoal">Fats</div>
                      <div className="font-medium text-wellness-darkGreen text-lg">{result.nutritionInfo.fats}g</div>
                    </div>
                    <div className="bg-wellness-softGreen/40 p-2 rounded-lg text-center flex flex-col justify-center">
                      <div className="text-sm text-wellness-charcoal">Fiber</div>
                      <div className="font-medium text-wellness-darkGreen text-lg">{result.nutritionInfo.fiber}g</div>
                    </div>
                  </div>
                  
                  {!showDetails && (
                    <div className="mb-4">
                      <div className="text-xs text-wellness-charcoal mb-1 flex justify-between">
                        <span>Macronutrient Distribution</span>
                        <span>{calculateMacroPercentages().protein}% Protein | {calculateMacroPercentages().carbs}% Carbs | {calculateMacroPercentages().fats}% Fats</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-blue-400" 
                          style={{width: `${calculateMacroPercentages().protein}%`}}
                          title={`Protein: ${calculateMacroPercentages().protein}%`}
                        ></div>
                        <div 
                          className="h-full bg-green-400" 
                          style={{width: `${calculateMacroPercentages().carbs}%`}}
                          title={`Carbs: ${calculateMacroPercentages().carbs}%`}
                        ></div>
                        <div 
                          className="h-full bg-yellow-400" 
                          style={{width: `${calculateMacroPercentages().fats}%`}}
                          title={`Fats: ${calculateMacroPercentages().fats}%`}
                        ></div>
                      </div>
                      <div className="flex text-xs mt-1 text-wellness-charcoal/70 justify-between">
                        <div className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div> Protein</div>
                        <div className="flex items-center"><div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div> Carbs</div>
                        <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div> Fats</div>
                      </div>
                    </div>
                  )}
                  
                  {showDetails && result.fullAnalysis && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono overflow-auto max-h-40">
                      <pre className="whitespace-pre-wrap">{result.fullAnalysis}</pre>
                    </div>
                  )}
                  
                  <div className="bg-wellness-softGreen/30 p-3 rounded-lg">
                    <h4 className="font-medium text-wellness-darkGreen mb-1">Recommendations</h4>
                    <div className="text-sm text-wellness-charcoal whitespace-pre-line">
                      {formatRecommendations(result.recommendations)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 px-4 bg-wellness-softGreen text-wellness-darkGreen rounded-lg hover:bg-wellness-softGreen/80 transition-colors"
                  >
                    Analyze Another Meal
                  </button>
                  <button
                    onClick={saveMealToHistory}
                    disabled={isSaving || !user}
                    className="flex-1 py-2 px-4 bg-wellness-darkGreen text-white rounded-lg hover:bg-wellness-darkGreen/90 transition-colors disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <span className="mr-2">Saving...</span>
                        <Loader className="h-4 w-4 animate-spin inline" />
                      </>
                    ) : (
                      'Save to History'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealRecognition;
