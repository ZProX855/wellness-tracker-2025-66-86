
import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface Goal {
  id: number;
  text: string;
  selected: boolean;
}

interface GoalSelectorProps {
  goals: Goal[];
  toggleGoal: (id: number) => void;
  loading: boolean;
  getSelectedGoals: () => string[];
  handleContinue: () => Promise<void>;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({
  goals,
  toggleGoal,
  loading,
  getSelectedGoals,
  handleContinue
}) => {
  return (
    <div className="transition-all duration-500 animate-fade-in">
      <div className="mb-8 text-center">
        <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Set Your Wellness Goals</h3>
        <p className="text-wellness-charcoal max-w-xl mx-auto">Select all the goals that apply to you to create your personalized wellness journey.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {goals.map((goal, index) => (
          <div 
            key={goal.id}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md opacity-0 animate-fade-in ${ 
              goal.selected 
                ? 'bg-wellness-darkGreen border-wellness-darkGreen text-white' 
                : 'bg-white bg-opacity-70 backdrop-blur-sm border-wellness-softGreen hover:border-wellness-mediumGreen'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => toggleGoal(goal.id)}
          >
            <div className="flex items-center">
              {goal.selected ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <div className="h-5 w-5 border border-wellness-mediumGreen rounded-full mr-2"></div>
              )}
              <span className={goal.selected ? 'font-medium' : ''}>{goal.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={getSelectedGoals().length === 0 || loading}
          className={`btn-primary rounded-full px-6 py-3 shadow-sm hover:shadow-md flex items-center gap-2 transition-all duration-300 ${
            getSelectedGoals().length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-2px]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting Initial Insights...
            </>
          ) : (
            <>
              <Target className="h-5 w-5" />
              Continue to Next Step
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoalSelector;
