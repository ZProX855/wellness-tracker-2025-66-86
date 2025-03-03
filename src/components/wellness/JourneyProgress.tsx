
import React from 'react';

type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

interface JourneyProgressProps {
  activeStep: JourneyStep;
  setActiveStep: (step: JourneyStep) => void;
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({ activeStep, setActiveStep }) => {
  const steps: JourneyStep[] = ['goals', 'bmi', 'preferences', 'plan'];
  
  // Function to handle step navigation with validation
  const handleStepClick = (step: JourneyStep, index: number) => {
    const activeIndex = steps.indexOf(activeStep);
    // Only allow navigation to completed steps or current step
    if (index <= activeIndex) {
      setActiveStep(step);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = activeStep === step;
          const isCompleted = index < steps.indexOf(activeStep);
          const isClickable = index <= steps.indexOf(activeStep);
          
          return (
            <div 
              key={step} 
              className={`flex flex-col items-center transition-all duration-300 ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
              onClick={() => handleStepClick(step, index)}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              aria-label={`${step} step ${index + 1} of ${steps.length}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-wellness-darkGreen text-white shadow-md' 
                    : isCompleted
                      ? 'bg-wellness-mediumGreen text-white' 
                      : 'bg-wellness-softGreen/50 text-wellness-darkGreen'
                } ${
                  isClickable 
                    ? 'hover:shadow-md hover:scale-105' 
                    : 'opacity-60'
                }`}
              >
                {index + 1}
              </div>
              <div 
                className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  isActive 
                    ? 'text-wellness-darkGreen' 
                    : isCompleted
                      ? 'text-wellness-mediumGreen'
                      : 'text-wellness-charcoal'
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="relative mt-5">
        <div className="absolute top-0 h-1 bg-wellness-softGreen/30 w-full rounded-full"></div>
        <div 
          className="absolute top-0 h-1 bg-wellness-mediumGreen rounded-full transition-all duration-500 ease-in-out"
          style={{ 
            width: `${
              activeStep === 'goals' ? '25%' : 
              activeStep === 'bmi' ? '50%' : 
              activeStep === 'preferences' ? '75%' : '100%'
            }` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default JourneyProgress;
