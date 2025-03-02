
import React, { useState, useEffect } from 'react';
import { getWellnessInsights } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';

interface WellnessState {
  goals: { id: number; text: string; selected: boolean }[];
  recommendations: string[];
  milestones: string[];
  loading: boolean;
}

// Define an interface for the API response
interface WellnessInsights {
  recommendations: string[];
  milestones: string[];
}

const WellnessJourney: React.FC = () => {
  const [state, setState] = useState<WellnessState>({
    goals: [
      { id: 1, text: 'Eat healthier meals', selected: false },
      { id: 2, text: 'Improve fitness level', selected: false },
      { id: 3, text: 'Lose weight', selected: false },
      { id: 4, text: 'Gain muscle', selected: false },
      { id: 5, text: 'Get better sleep', selected: false },
      { id: 6, text: 'Reduce stress', selected: false },
    ],
    recommendations: [],
    milestones: [],
    loading: false
  });
  
  const [activeSection, setActiveSection] = useState<'goals' | 'plan'>('goals');
  
  const toggleGoal = (id: number) => {
    setState({
      ...state,
      goals: state.goals.map(goal => 
        goal.id === id ? { ...goal, selected: !goal.selected } : goal
      )
    });
  };
  
  const getSelectedGoals = () => {
    return state.goals.filter(goal => goal.selected).map(goal => goal.text);
  };
  
  const generatePlan = async () => {
    const selectedGoals = getSelectedGoals();
    
    if (selectedGoals.length === 0) {
      return;
    }
    
    setState({ ...state, loading: true });
    
    try {
      // Explicitly type the result from getWellnessInsights
      const insights = await getWellnessInsights(selectedGoals) as WellnessInsights;
      setState({
        ...state,
        recommendations: insights.recommendations,
        milestones: insights.milestones,
        loading: false
      });
      setActiveSection('plan');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState({ ...state, loading: false });
    }
  };
  
  const renderGoalsSection = () => {
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'goals' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-8 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Set Your Wellness Goals</h3>
          <p className="text-wellness-charcoal">Select all the goals that apply to you to create your personalized wellness journey.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {state.goals.map((goal, index) => (
            <div 
              key={goal.id}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer opacity-0 animate-fade-in ${ 
                goal.selected 
                  ? 'bg-wellness-darkGreen border-wellness-darkGreen text-white' 
                  : 'bg-white bg-opacity-60 border-wellness-softGreen hover:border-wellness-mediumGreen'
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
            onClick={generatePlan}
            disabled={getSelectedGoals().length === 0 || state.loading}
            className={`btn-primary rounded-lg flex items-center gap-2 ${
              getSelectedGoals().length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {state.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Your Plan...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Generate My Wellness Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderPlanSection = () => {
    if (state.recommendations.length === 0 && state.milestones.length === 0) {
      return null;
    }
    
    return (
      <div className={`transition-opacity duration-500 ${activeSection === 'plan' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="mb-6 text-center">
          <h3 className="text-2xl text-wellness-darkGreen font-medium mb-3">Your Personalized Wellness Journey</h3>
          <p className="text-wellness-charcoal">Based on your goals: {getSelectedGoals().join(', ')}</p>
        </div>
        
        <div className="mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Leaf className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Recommendations</h4>
            </div>
            
            <ul className="space-y-3">
              {state.recommendations.map((recommendation, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-wellness-softGreen flex items-center justify-center">
                <Activity className="h-5 w-5 text-wellness-darkGreen" />
              </div>
              <h4 className="text-xl font-medium text-wellness-darkGreen">Milestones to Expect</h4>
            </div>
            
            <ul className="space-y-3">
              {state.milestones.map((milestone, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(index + state.recommendations.length) * 150}ms` }}
                >
                  <ChevronRight className="h-5 w-5 text-wellness-darkGreen mt-0.5 flex-shrink-0" />
                  <p className="text-wellness-charcoal">{milestone}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setActiveSection('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Adjust My Goals
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      {renderGoalsSection()}
      {renderPlanSection()}
    </div>
  );
};

export default WellnessJourney;
