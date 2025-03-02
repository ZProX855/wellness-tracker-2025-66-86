
import React, { useState, useEffect } from 'react';
import { getWellnessInsights } from '../services/api';
import { Target, Activity, Leaf, ChevronRight, ChevronDown, CheckCircle2, MessageSquare, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';

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
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversation, setConversation] = useState<string>('');
  const [conversationLoading, setConversationLoading] = useState(false);
  
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
      toast.error('Please select at least one wellness goal');
      return;
    }
    
    setState({ ...state, loading: true });
    
    try {
      // Explicitly type the result from getWellnessInsights
      const insights = await getWellnessInsights(selectedGoals) as WellnessInsights;
      
      if (insights.recommendations.length === 0 && insights.milestones.length === 0) {
        throw new Error('Failed to generate wellness plan');
      }
      
      setState({
        ...state,
        recommendations: insights.recommendations,
        milestones: insights.milestones,
        loading: false
      });
      
      setActiveSection('plan');
      toast.success('Your wellness plan is ready!');
    } catch (error) {
      console.error('Error generating wellness plan:', error);
      setState({ ...state, loading: false });
      toast.error('Failed to generate wellness plan. Please try again.');
    }
  };

  // Generate plan through Gemini AI conversation
  const generatePlanFromConversation = async () => {
    if (!conversation.trim()) {
      toast.error('Please enter some details about your wellness goals');
      return;
    }

    setConversationLoading(true);
    
    try {
      // Send the conversation to Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC3Er0jxIvcQCjPzGpp9xYH-Lc-8TuqqJc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `Based on the following details, generate a wellness plan with recommendations and milestones:
                
                ${conversation}
                
                Format your response as structured data with two sections: "Recommendations" and "Milestones". 
                For recommendations, provide 4-6 actionable health and wellness suggestions.
                For milestones, provide 3-5 achievable goals with timeframes.`
              }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Invalid response from Gemini API');
      }

      const text = data.candidates[0].content.parts[0].text;
      
      // Parse recommendations and milestones from the response
      const recommendations: string[] = [];
      const milestones: string[] = [];
      
      let currentSection: 'none' | 'recommendations' | 'milestones' = 'none';
      
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().includes('recommendations')) {
          currentSection = 'recommendations';
          continue;
        } else if (trimmedLine.toLowerCase().includes('milestones')) {
          currentSection = 'milestones';
          continue;
        }
        
        // Skip empty lines and headers
        if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('*')) {
          continue;
        }
        
        // Extract list items
        if (currentSection === 'recommendations' && (trimmedLine.startsWith('-') || /^\d+\./.test(trimmedLine))) {
          recommendations.push(trimmedLine.replace(/^-|\d+\.\s*/, '').trim());
        } else if (currentSection === 'milestones' && (trimmedLine.startsWith('-') || /^\d+\./.test(trimmedLine))) {
          milestones.push(trimmedLine.replace(/^-|\d+\.\s*/, '').trim());
        }
      }
      
      // If parsing failed, create fallback data
      if (recommendations.length === 0) {
        const fallbackRecommendations = [
          "Drink more water throughout the day",
          "Add more vegetables to your meals",
          "Practice daily mindfulness or meditation",
          "Get 7-8 hours of sleep each night"
        ];
        recommendations.push(...fallbackRecommendations);
      }
      
      if (milestones.length === 0) {
        const fallbackMilestones = [
          "Complete a full week of daily exercise within 14 days",
          "Reduce processed food intake by 50% within 30 days",
          "Establish a consistent sleep schedule within 21 days"
        ];
        milestones.push(...fallbackMilestones);
      }
      
      setState({
        ...state,
        recommendations,
        milestones,
        loading: false
      });
      
      setActiveSection('plan');
      setIsConversationOpen(false);
      toast.success('Your wellness plan is ready!');
    } catch (error) {
      console.error('Error generating wellness plan from conversation:', error);
      toast.error('Failed to generate wellness plan. Please try again.');
    } finally {
      setConversationLoading(false);
    }
  };
  
  // Function to download wellness plan as PDF
  const downloadAsPDF = () => {
    const { recommendations, milestones } = state;
    
    if (recommendations.length === 0 && milestones.length === 0) {
      toast.error('No wellness plan to download');
      return;
    }
    
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define colors
      const colors = {
        primary: '#6E59A5',
        secondary: '#9b87f5',
        background: '#F1F0FB',
        text: '#1A1F2C',
        accent: '#D6BCFA',
        categoryBg: {
          recommendations: '#E5DEFF',
          milestones: '#FFDEE2'
        }
      };
      
      // Set up document
      doc.setFillColor(colors.background);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Add header
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Your Wellness Journey Plan', 105, 25, { align: 'center' });
      
      // Add selected goals section
      const selectedGoals = getSelectedGoals();
      if (selectedGoals.length > 0) {
        doc.setFillColor(colors.secondary);
        doc.roundedRect(15, 50, 180, 12 + (selectedGoals.length * 7), 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('Your Selected Goals', 105, 58, { align: 'center' });
        
        doc.setFontSize(10);
        selectedGoals.forEach((goal, index) => {
          doc.text(`• ${goal}`, 25, 67 + (index * 7));
        });
      }
      
      // Calculate starting Y position based on goals section
      let yPos = 70 + (selectedGoals.length * 7);
      
      // Add recommendations section
      if (recommendations.length > 0) {
        doc.setFillColor(colors.categoryBg.recommendations);
        doc.roundedRect(15, yPos, 180, 12 + (recommendations.length * 12), 3, 3, 'F');
        
        doc.setTextColor(colors.primary);
        doc.setFontSize(14);
        doc.text('Recommendations', 105, yPos + 8, { align: 'center' });
        
        doc.setTextColor(colors.text);
        doc.setFontSize(10);
        
        recommendations.forEach((recommendation, index) => {
          // Add checkbox
          doc.setDrawColor(colors.primary);
          doc.setLineWidth(0.5);
          doc.rect(25, yPos + 15 + (index * 12), 5, 5);
          
          // Add text with word wrapping
          const textLines = doc.splitTextToSize(recommendation, 150);
          doc.text(textLines, 35, yPos + 19 + (index * 12));
        });
        
        yPos += 20 + (recommendations.length * 12);
      }
      
      // Add milestones section
      if (milestones.length > 0) {
        doc.setFillColor(colors.categoryBg.milestones);
        doc.roundedRect(15, yPos, 180, 12 + (milestones.length * 12), 3, 3, 'F');
        
        doc.setTextColor(colors.primary);
        doc.setFontSize(14);
        doc.text('Milestones', 105, yPos + 8, { align: 'center' });
        
        doc.setTextColor(colors.text);
        doc.setFontSize(10);
        
        milestones.forEach((milestone, index) => {
          // Add checkbox
          doc.setDrawColor(colors.primary);
          doc.setLineWidth(0.5);
          doc.rect(25, yPos + 15 + (index * 12), 5, 5);
          
          // Add text with word wrapping
          const textLines = doc.splitTextToSize(milestone, 150);
          doc.text(textLines, 35, yPos + 19 + (index * 12));
        });
      }
      
      // Add footer
      doc.setFillColor(colors.primary);
      doc.rect(0, 282, 210, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Generated by Wellness Journey AI Assistant', 105, 290, { align: 'center' });
      
      // Save PDF
      doc.save('wellness-journey-plan.pdf');
      
      toast.success('Your wellness plan has been downloaded!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download wellness plan. Please try again.');
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
          <div className="flex flex-wrap gap-3 items-center justify-center">
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
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Generate with AI Chat</h3>
                  <p className="text-muted-foreground text-xs">Tell the AI about your wellness goals in your own words.</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={() => setIsConversationOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start AI Conversation
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
        
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveSection('goals')}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <ChevronDown className="h-5 w-5" />
            Adjust My Goals
          </button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20"
            onClick={downloadAsPDF}
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6">
      {renderGoalsSection()}
      {renderPlanSection()}
      
      {/* AI Conversation Dialog */}
      <Dialog open={isConversationOpen} onOpenChange={setIsConversationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chat with Wellness AI</DialogTitle>
            <DialogDescription>
              Tell us about your wellness goals, lifestyle, and preferences in your own words.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Example: I want to improve my energy levels and sleep quality. I work at a desk job 8 hours a day and have two young children. I currently don't exercise regularly and often eat on the go."
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConversationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={generatePlanFromConversation}
              disabled={conversationLoading || !conversation.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {conversationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>Generate Plan</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellnessJourney;
