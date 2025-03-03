
import React from 'react';
import { Scale, ArrowRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBMI as calculateBMIApi } from '../../services/api';

interface BMICalculatorProps {
  height: number | '';
  weight: number | '';
  setHeight: (height: number | '') => void;
  setWeight: (weight: number | '') => void;
  loading: boolean;
  calculateBMI: () => Promise<void>;
  showBmiInfo: boolean;
  setShowBmiInfo: (show: boolean) => void;
  goBack: () => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({
  height,
  weight,
  setHeight,
  setWeight,
  loading,
  calculateBMI: externalCalculateBMI,
  showBmiInfo,
  setShowBmiInfo,
  goBack
}) => {
  const calculateBMI = async () => {
    if (height === '' || weight === '') {
      toast.error('Please enter both height and weight');
      return;
    }
    
    if (typeof height === 'number' && typeof weight === 'number') {
      if (height <= 0 || weight <= 0) {
        toast.error('Height and weight must be positive values');
        return;
      }
      
      try {
        await calculateBMIApi(height, weight);
        await externalCalculateBMI();
      } catch (error) {
        console.error("BMI calculation error:", error);
        toast.error("Failed to calculate BMI. Please try again.");
      }
    }
  };

  return (
    <div className="transition-all duration-500 animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Calculate Your BMI</h3>
        <p className="text-wellness-charcoal max-w-xl mx-auto">To personalize your plan further, we need to calculate your Body Mass Index (BMI).</p>
        <button 
          onClick={() => setShowBmiInfo(true)}
          className="text-sm text-wellness-mediumGreen underline mt-1 inline-flex items-center gap-1 hover:text-wellness-darkGreen transition-colors"
        >
          <Scale className="h-3 w-3" />
          <span>What is BMI?</span>
        </button>
      </div>
      
      <div className="glass-panel p-6 mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter height in cm"
              className="input-field w-full focus:ring-wellness-mediumGreen"
              min="0"
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <label className="block text-wellness-darkGreen font-medium mb-2 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter weight in kg"
              className="input-field w-full focus:ring-wellness-mediumGreen"
              min="0"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-white bg-opacity-80 rounded-xl border border-wellness-softGreen/40 mb-6">
          <h3 className="text-wellness-darkGreen font-medium mb-3">BMI Categories</h3>
          <div className="flex h-8 rounded-full overflow-hidden mb-3">
            <div className="bg-amber-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Underweight</div>
            <div className="bg-green-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Normal</div>
            <div className="bg-amber-600 flex-1 flex items-center justify-center text-xs text-white font-medium">Overweight</div>
            <div className="bg-red-500 flex-1 flex items-center justify-center text-xs text-white font-medium">Obese</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
              <div>Underweight</div>
              <div className="font-medium">{`< 18.5`}</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-green-500 rounded-full mx-auto mb-1"></div>
              <div>Normal</div>
              <div className="font-medium">18.5 - 24.9</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-amber-600 rounded-full mx-auto mb-1"></div>
              <div>Overweight</div>
              <div className="font-medium">25 - 29.9</div>
            </div>
            <div className="text-xs text-center px-1">
              <div className="h-3 w-3 bg-red-500 rounded-full mx-auto mb-1"></div>
              <div>Obese</div>
              <div className="font-medium">≥ 30</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="btn-secondary rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:bg-wellness-softGreen/70"
        >
          <ChevronDown className="h-5 w-5" />
          Back to Goals
        </button>
        
        <button
          onClick={calculateBMI}
          disabled={height === '' || weight === '' || loading}
          className={`btn-primary rounded-full px-6 py-3 shadow-sm hover:shadow-md flex items-center gap-2 transition-all duration-300 ${
            height === '' || weight === '' ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-2px]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Calculating...
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5" />
              Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BMICalculator;
