
import React from 'react';

type JourneyStep = 'goals' | 'bmi' | 'preferences' | 'plan';

interface JourneyProgressProps {
  activeStep: JourneyStep;
  setActiveStep: (step: JourneyStep) => void;
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({ activeStep, setActiveStep }) => {
  const steps: JourneyStep[] = ['goals', 'bmi', 'preferences', 'plan'];
  
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className="flex flex-col items-center"
            onClick={() => {
              const stepIndex = steps.indexOf(activeStep);
              if (index <= stepIndex) {
                setActiveStep(step);
              }
            }}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all 
                ${activeStep === step 
                  ? 'bg-wellness-darkGreen text-white' 
                  : index < steps.indexOf(activeStep)
                    ? 'bg-wellness-mediumGreen text-white' 
                    : 'bg-wellness-softGreen/50 text-wellness-darkGreen'
                } 
                ${index <= steps.indexOf(activeStep) 
                  ? 'cursor-pointer hover:shadow-md' 
                  : 'opacity-60 cursor-not-allowed'
                }`}
            >
              {index + 1}
            </div>
            <div 
              className={`text-xs mt-2 font-medium 
                ${activeStep === step 
                  ? 'text-wellness-darkGreen' 
                  : 'text-wellness-charcoal'
                }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-5">
        <div className="absolute top-0 h-1 bg-wellness-softGreen/30 w-full rounded-full"></div>
        <div 
          className="absolute top-0 h-1 bg-wellness-mediumGreen rounded-full transition-all duration-500"
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
