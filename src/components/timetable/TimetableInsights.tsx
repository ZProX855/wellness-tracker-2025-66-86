
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, AlertCircle, Clock, CalendarClock, Zap } from 'lucide-react';

interface TimetableEntry {
  time: string;
  activity: string;
  category: 'routine' | 'work' | 'meal' | 'exercise' | 'leisure' | 'learning' | 'rest';
  description?: string;
  completed?: boolean;
  important?: boolean;
}

interface TimetableInsightsProps {
  timetable: TimetableEntry[];
  conversationData: any;
  localConversation: {question: string, answer: string}[];
  responses: {question: string, answer: string}[];
}

const TimetableInsights: React.FC<TimetableInsightsProps> = ({ 
  timetable, 
  conversationData, 
  localConversation,
  responses 
}) => {
  // Generate insights based on the timetable and conversation
  const generateInsights = () => {
    const insights = [];
    
    // Check for balance in the timetable
    const categories = timetable.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Check for work-life balance
    if (categories['work'] > timetable.length * 0.5) {
      insights.push({
        title: "Work-Life Balance ⚖️",
        description: "Your schedule is heavily focused on work. Consider adding more leisure or rest activities for better balance.",
        icon: <TrendingUp className="h-5 w-5 text-wellness-darkGreen" />
      });
    }
    
    // Check for exercise
    if (!categories['exercise'] || categories['exercise'] < 1) {
      insights.push({
        title: "Physical Activity 🏃‍♂️",
        description: "Try to include at least one exercise session in your daily routine for better physical and mental health.",
        icon: <Zap className="h-5 w-5 text-wellness-darkGreen" />
      });
    }
    
    // Check for meal structure
    if (!categories['meal'] || categories['meal'] < 3) {
      insights.push({
        title: "Meal Structure 🍽️",
        description: "Aim for at least 3 regular meals per day to maintain energy levels and support healthy nutrition.",
        icon: <Clock className="h-5 w-5 text-wellness-darkGreen" />
      });
    }
    
    // Check for learning/personal development
    if (!categories['learning'] || categories['learning'] < 1) {
      insights.push({
        title: "Personal Growth 📚",
        description: "Consider adding a learning activity to your day to support your personal and professional development.",
        icon: <TrendingUp className="h-5 w-5 text-wellness-darkGreen" />
      });
    }
    
    // Check for leisure/relaxation
    if (!categories['leisure'] || categories['leisure'] < 1) {
      insights.push({
        title: "Relaxation Time 🧘‍♀️",
        description: "Make sure to include some leisure activities to relax and recharge throughout your day.",
        icon: <CheckCircle className="h-5 w-5 text-wellness-darkGreen" />
      });
    }
    
    // Analyze conversation to extract goals or preferences
    let goalInsight = {
      title: "Your Goals 🎯",
      description: "Based on our conversation, focus on creating a sustainable routine that aligns with your personal objectives.",
      icon: <CalendarClock className="h-5 w-5 text-wellness-darkGreen" />
    };
    
    // Extract goals from conversation if available
    const allResponses = [...responses, ...localConversation];
    for (const response of allResponses) {
      // Look for goal-related keywords in the conversation
      const goalKeywords = ["goal", "aim", "objective", "achieve", "want to", "hoping to"];
      
      if (response.question && goalKeywords.some(keyword => response.question.toLowerCase().includes(keyword))) {
        goalInsight.description = "Based on our conversation, " + response.question;
      }
      
      if (response.answer && goalKeywords.some(keyword => response.answer.toLowerCase().includes(keyword))) {
        // Extract the sentence containing the goal
        const sentences = response.answer.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (goalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
            goalInsight.description = "Based on what you shared: " + sentence.trim() + ".";
            break;
          }
        }
      }
    }
    
    insights.push(goalInsight);
    
    // Add a general improvement insight
    insights.push({
      title: "Track Your Progress ✅",
      description: "Remember to mark activities as completed and review your progress at the end of the day to stay motivated!",
      icon: <CheckCircle className="h-5 w-5 text-wellness-darkGreen" />
    });
    
    return insights;
  };
  
  const insights = generateInsights();
  
  return (
    <Card className="bg-white bg-opacity-70 backdrop-blur-sm border border-wellness-softGreen/30 shadow-sm mb-8 hover:shadow-md transition-shadow animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-wellness-darkGreen flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-wellness-mediumGreen" />
          AI Insights & Recommendations
        </CardTitle>
        <CardDescription>
          Based on your timetable and conversation, here are some personalized insights to help you optimize your day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg border border-wellness-softGreen/30 bg-white"
            >
              <div className="flex items-center gap-2 mb-2">
                {insight.icon}
                <h3 className="font-medium text-wellness-darkGreen">{insight.title}</h3>
              </div>
              <p className="text-wellness-charcoal text-sm">{insight.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableInsights;
