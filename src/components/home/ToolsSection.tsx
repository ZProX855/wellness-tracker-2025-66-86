
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Apple, Camera, Target, Moon, Clock, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
  delay: number;
}

interface ToolCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  tools: Tool[];
}

const ToolsSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  
  const allTools: Tool[] = [
    {
      title: 'AI Nutrition Assistant',
      description: 'Get personalized nutrition advice from our intelligent assistant',
      icon: MessageSquare,
      color: 'from-emerald-100 to-emerald-200',
      path: '/chat-assistant',
      delay: 100
    }, 
    {
      title: 'Food Comparison',
      description: 'Compare nutritional values between different foods',
      icon: Apple,
      color: 'from-amber-100 to-amber-200',
      path: '/food-compare',
      delay: 200
    }, 
    {
      title: 'Meal Recognition',
      description: 'Analyze your meal with a simple photo',
      icon: Camera,
      color: 'from-blue-100 to-blue-200',
      path: '/meal-recognition',
      delay: 300
    }, 
    {
      title: 'Wellness Journey',
      description: 'Create your personalized wellness plan',
      icon: Target,
      color: 'from-purple-100 to-purple-200',
      path: '/wellness-journey',
      delay: 400
    }, 
    {
      title: 'Sleep Tracker',
      description: 'Monitor and improve your sleep patterns',
      icon: Moon,
      color: 'from-indigo-100 to-indigo-200',
      path: '/sleep-tracker',
      delay: 500
    }, 
    {
      title: 'Timetable Generator',
      description: 'Create your perfect daily schedule',
      icon: Clock,
      color: 'from-teal-100 to-teal-200',
      path: '/timetable-generator',
      delay: 600
    }
  ];

  const categories: ToolCategory[] = [
    {
      name: "Diet & Nutrition",
      icon: UtensilsCrossed,
      color: "from-green-100 to-green-200",
      tools: allTools.filter(tool => ["AI Nutrition Assistant", "Food Comparison", "Meal Recognition"].includes(tool.title))
    }, 
    {
      name: "Wellness & Planning",
      icon: Target,
      color: "from-purple-100 to-purple-200",
      tools: allTools.filter(tool => ["Wellness Journey", "Sleep Tracker", "Timetable Generator"].includes(tool.title))
    }
  ];

  return (
    <section className="px-4 sm:px-6 bg-white py-[60px]">
      <div className="max-w-6xl py-0 mx-[240px] my-[4px] px-0">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-4 opacity-0 animate-fade-in" 
            style={{ animationDelay: '100ms' }}
          >
            Powerful Tools for Your Wellbeing
          </h2>
          <p 
            className="text-lg text-wellness-charcoal/70 max-w-2xl mx-auto opacity-0 animate-fade-in" 
            style={{ animationDelay: '200ms' }}
          >
            Our intelligent wellness tools helps you make informed decisions about your health.
          </p>
        </div>
        
        <div 
          className="mb-10 flex justify-center gap-4 opacity-0 animate-fade-in" 
          style={{ animationDelay: '300ms' }}
        >
          {categories.map((category, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveCategory(idx)} 
              className={cn(
                "px-6 py-3 rounded-full text-sm font-medium transition-all duration-300", 
                activeCategory === idx 
                  ? "bg-wellness-darkGreen text-white shadow-md" 
                  : "bg-wellness-softGreen/50 text-wellness-darkGreen hover:bg-wellness-softGreen"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-px px-[50px]">
          {categories[activeCategory].tools.map((tool, idx) => (
            <div 
              key={idx} 
              className="opacity-0 animate-fade-in" 
              style={{ animationDelay: `${300 + idx * 100}ms` }}
            >
              <button 
                onClick={() => navigate(tool.path)} 
                className="w-full h-full glass-panel hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-out-expo p-8 flex flex-col items-center text-center group rounded-full text-4xl py-[29px] mx-0 bg-[#f8f4e3]/[0.77] px-[30px]"
              >
                <div 
                  className={`h-16 w-16 rounded-full bg-gradient-to-r ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  <tool.icon className="h-8 w-8 text-wellness-darkGreen" />
                </div>
                <h3 className="text-xl font-medium text-wellness-darkGreen mb-3">{tool.title}</h3>
                <p className="text-wellness-charcoal/70 text-sm px-[8px]">{tool.description}</p>
                <div className="mt-6 w-12 h-12 rounded-full bg-wellness-softGreen/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                  <ArrowRight className="h-5 w-5 text-wellness-darkGreen" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
