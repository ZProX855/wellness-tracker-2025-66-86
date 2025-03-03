
import React, { useState } from 'react';
import { ChevronDown, Award, Utensils, Droplets, Dumbbell, CheckCircle2, ChevronRight, Zap, Brain, Download, Share2 } from 'lucide-react';

interface WellnessPlanProps {
  finalPlan: {
    diet: string[];
    water: string;
    training: string[];
  };
  recommendations: string[];
  milestones: string[];
  goBack: () => void;
}

const WellnessPlan: React.FC<WellnessPlanProps> = ({
  finalPlan,
  recommendations,
  milestones,
  goBack
}) => {
  const [activeSections, setActiveSections] = useState({
    diet: true,
    water: true,
    training: true,
    insights: false
  });

  const toggleSection = (section: keyof typeof activeSections) => {
    setActiveSections({
      ...activeSections,
      [section]: !activeSections[section]
    });
  };

  const downloadPlan = () => {
    const planContent = `
YOUR WELLNESS PLAN
==================

NUTRITION PLAN:
${finalPlan.diet.join('\n')}

HYDRATION PLAN:
${finalPlan.water}

TRAINING PLAN:
${finalPlan.training.join('\n')}

RECOMMENDATIONS:
${recommendations.join('\n')}

MILESTONES:
${milestones.join('\n')}
`;

    const blob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_wellness_plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sharePlan = async () => {
    const shareText = `My Wellness Plan:\n\n${finalPlan.diet.slice(0, 2).join('\n')}\n\n${finalPlan.water}\n\n${finalPlan.training.slice(0, 2).join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wellness Plan',
          text: shareText
        });
      } catch (err) {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(shareText);
      }
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="transition-all duration-500 animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl text-wellness-darkGreen font-medium mb-2">Your Complete Wellness Plan</h3>
        <p className="text-wellness-charcoal flex items-center justify-center gap-1">
          <Award className="h-4 w-4 text-wellness-darkGreen" />
          <span>Based on your goals, BMI, and preferences</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={downloadPlan}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-wellness-softGreen text-wellness-darkGreen hover:bg-wellness-mediumGreen/20 transition-colors"
        >
          <Download className="h-4 w-4" /> Download Plan
        </button>
        <button 
          onClick={sharePlan}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-wellness-softGreen text-wellness-darkGreen hover:bg-wellness-mediumGreen/20 transition-colors"
        >
          <Share2 className="h-4 w-4" /> Share Plan
        </button>
      </div>
      
      <div className="space-y-6 mb-8">
        {/* Nutrition Plan */}
        <div className="glass-panel transition-all duration-300 hover:shadow-md">
          <div 
            className="flex items-center gap-2 p-5 cursor-pointer" 
            onClick={() => toggleSection('diet')}
          >
            <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
              <Utensils className="h-6 w-6 text-wellness-darkGreen" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium text-wellness-darkGreen">Nutrition Plan</h4>
              <p className="text-wellness-charcoal text-sm">Personalized dietary recommendations</p>
            </div>
            <ChevronDown className={`h-5 w-5 text-wellness-darkGreen transition-transform ${activeSections.diet ? 'rotate-180' : ''}`} />
          </div>
          
          {activeSections.diet && (
            <div className="px-5 pb-5 pt-2 animate-fade-in">
              <ul className="space-y-3">
                {finalPlan.diet.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-wellness-charcoal bg-white/50 p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-shrink-0 w-6 text-center">
                      {item.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      {item.substring(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Hydration Plan */}
        <div className="glass-panel transition-all duration-300 hover:shadow-md">
          <div 
            className="flex items-center gap-2 p-5 cursor-pointer" 
            onClick={() => toggleSection('water')}
          >
            <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
              <Droplets className="h-6 w-6 text-wellness-darkGreen" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium text-wellness-darkGreen">Hydration Plan</h4>
              <p className="text-wellness-charcoal text-sm">Optimal water intake recommendations</p>
            </div>
            <ChevronDown className={`h-5 w-5 text-wellness-darkGreen transition-transform ${activeSections.water ? 'rotate-180' : ''}`} />
          </div>
          
          {activeSections.water && (
            <div className="px-5 pb-5 pt-2 animate-fade-in">
              <div className="bg-white/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-wellness-charcoal">
                  {finalPlan.water}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Training Plan */}
        <div className="glass-panel transition-all duration-300 hover:shadow-md">
          <div 
            className="flex items-center gap-2 p-5 cursor-pointer" 
            onClick={() => toggleSection('training')}
          >
            <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-wellness-darkGreen" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium text-wellness-darkGreen">Training Plan</h4>
              <p className="text-wellness-charcoal text-sm">Exercise and physical activity guidance</p>
            </div>
            <ChevronDown className={`h-5 w-5 text-wellness-darkGreen transition-transform ${activeSections.training ? 'rotate-180' : ''}`} />
          </div>
          
          {activeSections.training && (
            <div className="px-5 pb-5 pt-2 animate-fade-in">
              <ul className="space-y-3">
                {finalPlan.training.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-wellness-charcoal bg-white/50 p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-shrink-0 w-6 text-center">
                      {item.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      {item.substring(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* AI Insights */}
        <div className="glass-panel transition-all duration-300 hover:shadow-md">
          <div 
            className="flex items-center gap-2 p-5 cursor-pointer" 
            onClick={() => toggleSection('insights')}
          >
            <div className="h-12 w-12 rounded-full bg-wellness-softGreen flex items-center justify-center">
              <Brain className="h-6 w-6 text-wellness-darkGreen" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium text-wellness-darkGreen">AI-Powered Insights</h4>
              <p className="text-wellness-charcoal text-sm">Recommendations and milestones for your journey</p>
            </div>
            <ChevronDown className={`h-5 w-5 text-wellness-darkGreen transition-transform ${activeSections.insights ? 'rotate-180' : ''}`} />
          </div>
          
          {activeSections.insights && (
            <div className="px-5 pb-5 pt-2 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <h5 className="text-lg font-medium text-wellness-darkGreen mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-wellness-mediumGreen" />
                    Key Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-white/50 rounded-lg shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-wellness-darkGreen flex-shrink-0 mt-0.5" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-lg font-medium text-wellness-darkGreen mb-2 flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-wellness-mediumGreen" />
                    Progress Milestones
                  </h5>
                  <ul className="space-y-2">
                    {milestones.map((milestone, index) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-white/50 rounded-lg shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-wellness-mediumGreen text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={goBack}
          className="btn-secondary rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:bg-wellness-softGreen/70"
        >
          <ChevronDown className="h-5 w-5" />
          Back to Preferences
        </button>
      </div>
    </div>
  );
};

export default WellnessPlan;
