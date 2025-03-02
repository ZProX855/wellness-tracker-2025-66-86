import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, AlertCircle, Clock, CalendarClock, Zap, Brain, Coffee, Utensils, Heart, Medal } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';

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
  const [seenInsights, setSeenInsights] = useLocalStorage<string[]>("seen-insights", []);
  
  const generateInsights = () => {
    const insights = [];
    
    const categories = timetable.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (categories['work'] > timetable.length * 0.5) {
      insights.push({
        title: "Work-Life Balance ⚖️",
        description: "Your schedule seems heavily focused on work activities. Consider adding more leisure or rest activities for better balance and to prevent burnout. Even short breaks can boost productivity!",
        icon: <TrendingUp className="h-5 w-5 text-wellness-darkGreen" />,
        category: "balance",
        emoji: "⚖️"
      });
    }
    
    if (!categories['exercise'] || categories['exercise'] < 1) {
      insights.push({
        title: "Physical Activity 🏃‍♂️",
        description: "Try to include at least one exercise session in your daily routine. Even a 20-minute walk or quick home workout can improve your mood, energy levels, and overall health.",
        icon: <Zap className="h-5 w-5 text-wellness-darkGreen" />,
        category: "exercise",
        emoji: "🏃‍♂️"
      });
    } else if (categories['exercise'] === 1) {
      insights.push({
        title: "Exercise Consistency 🏋️‍♀️",
        description: "Great job including exercise in your day! For optimal health benefits, aim for 150 minutes of moderate activity per week spread across multiple days.",
        icon: <Medal className="h-5 w-5 text-wellness-darkGreen" />,
        category: "exercise-improvement",
        emoji: "🏋️‍♀️"
      });
    }
    
    if (!categories['meal'] || categories['meal'] < 3) {
      insights.push({
        title: "Meal Structure 🍽️",
        description: "Your schedule has fewer than 3 meals planned. Regular meals help maintain energy levels and prevent overeating. Consider adding small, nutritious meals or snacks throughout your day.",
        icon: <Utensils className="h-5 w-5 text-wellness-darkGreen" />,
        category: "nutrition",
        emoji: "🍽️"
      });
    }
    
    const morningEntries = timetable.filter(entry => {
      const hour = parseInt(entry.time.split(':')[0]);
      return hour < 10;
    });
    
    if (morningEntries.length < 2) {
      insights.push({
        title: "Morning Routine 🌅",
        description: "A consistent morning routine sets the tone for your day. Consider adding activities like hydration, stretching, meditation, or planning your day's priorities to your morning schedule.",
        icon: <Coffee className="h-5 w-5 text-wellness-darkGreen" />,
        category: "routine",
        emoji: "🌅"
      });
    }
    
    if (!categories['learning'] || categories['learning'] < 1) {
      insights.push({
        title: "Personal Growth 📚",
        description: "Adding even 15-30 minutes of learning to your day can significantly boost your skills and knowledge over time. Consider reading, online courses, podcasts, or other educational content.",
        icon: <Brain className="h-5 w-5 text-wellness-darkGreen" />,
        category: "growth",
        emoji: "📚"
      });
    }
    
    if (!categories['leisure'] || categories['leisure'] < 1) {
      insights.push({
        title: "Relaxation Time 🧘‍♀️",
        description: "Make sure to include some leisure activities to relax and recharge. Activities you enjoy reduce stress and improve overall wellbeing. Even 30 minutes of 'me time' can make a difference!",
        icon: <Heart className="h-5 w-5 text-wellness-darkGreen" />,
        category: "relaxation",
        emoji: "🧘‍♀️"
      });
    }
    
    const eveningEntries = timetable.filter(entry => {
      const hour = parseInt(entry.time.split(':')[0]);
      return hour >= 20;
    });
    
    const hasRelaxingEveningActivity = eveningEntries.some(entry => 
      entry.category === 'leisure' || entry.category === 'rest'
    );
    
    if (!hasRelaxingEveningActivity && eveningEntries.length > 0) {
      insights.push({
        title: "Evening Wind-Down 🌙",
        description: "Consider adding a relaxing activity before bed, such as reading, gentle stretching, or meditation. This helps signal to your body it's time to sleep and improves sleep quality.",
        icon: <Clock className="h-5 w-5 text-wellness-darkGreen" />,
        category: "sleep",
        emoji: "🌙"
      });
    }
    
    let goalInsight = {
      title: "Your Goals 🎯",
      description: "Based on our conversation, focus on creating a sustainable routine that aligns with your personal objectives.",
      icon: <CalendarClock className="h-5 w-5 text-wellness-darkGreen" />,
      category: "goals",
      emoji: "🎯"
    };
    
    const allResponses = [...responses, ...localConversation];
    for (const response of allResponses) {
      const goalKeywords = ["goal", "aim", "objective", "achieve", "want to", "hoping to"];
      
      if (response.question && goalKeywords.some(keyword => response.question.toLowerCase().includes(keyword))) {
        goalInsight.description = "Based on our conversation, " + response.question;
      }
      
      if (response.answer && goalKeywords.some(keyword => response.answer.toLowerCase().includes(keyword))) {
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
    
    insights.push({
      title: "Track Your Progress ✅",
      description: "Remember to mark activities as completed and review your progress at the end of the day. Celebrate small wins to stay motivated! Consider using a journal to reflect on what worked well.",
      icon: <CheckCircle className="h-5 w-5 text-wellness-darkGreen" />,
      category: "tracking",
      emoji: "✅"
    });
    
    const filteredInsights = insights.filter(insight => {
      if (insight.category === 'goals' || insight.category === 'tracking') {
        return true;
      }
      return !seenInsights.includes(insight.category);
    });
    
    const newSeenCategories = filteredInsights
      .map(insight => insight.category)
      .filter(category => category !== 'goals' && category !== 'tracking');
    
    if (newSeenCategories.length > 0) {
      setSeenInsights([...seenInsights, ...newSeenCategories]);
    }
    
    return filteredInsights;
  };
  
  const insights = generateInsights();
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'balance': return 'bg-amber-50 border-amber-200';
      case 'exercise': return 'bg-green-50 border-green-200';
      case 'exercise-improvement': return 'bg-emerald-50 border-emerald-200';
      case 'nutrition': return 'bg-orange-50 border-orange-200';
      case 'routine': return 'bg-blue-50 border-blue-200';
      case 'growth': return 'bg-indigo-50 border-indigo-200';
      case 'relaxation': return 'bg-purple-50 border-purple-200';
      case 'sleep': return 'bg-violet-50 border-violet-200';
      case 'goals': return 'bg-red-50 border-red-200';
      case 'tracking': return 'bg-teal-50 border-teal-200';
      default: return 'bg-white border-wellness-softGreen/30';
    }
  };
  
  const priorityInsights = insights.filter(i => 
    i.category === 'goals' || i.category === 'tracking'
  );
  
  const otherInsights = insights.filter(i => 
    i.category !== 'goals' && i.category !== 'tracking'
  );
  
  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-wellness-softGreen/40 shadow-sm mb-8 hover:shadow-md transition-shadow animate-fade-in">
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
        {priorityInsights.length > 0 && (
          <div className="mb-4">
            <h3 className="text-wellness-darkGreen font-medium mb-3 flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Priority Focus Areas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {priorityInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border animate-fade-in ${getCategoryColor(insight.category)}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {insight.icon}
                    <h3 className="font-medium text-wellness-darkGreen">{insight.title}</h3>
                  </div>
                  <p className="text-wellness-charcoal text-sm">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {otherInsights.length > 0 && (
          <div>
            <h3 className="text-wellness-darkGreen font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Personalized Wellness Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border animate-fade-in ${getCategoryColor(insight.category)}`}
                  style={{ animationDelay: `${(index + priorityInsights.length) * 150}ms` }}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-2xl" aria-hidden="true">{insight.emoji}</div>
                    <div>
                      <h3 className="font-medium text-wellness-darkGreen mb-1">{insight.title.replace(insight.emoji, '').trim()}</h3>
                      <p className="text-wellness-charcoal text-sm">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {insights.length === 0 && (
          <div className="text-center p-6">
            <p className="text-wellness-charcoal">No insights available yet. Add more activities to your timetable to receive personalized recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimetableInsights;
