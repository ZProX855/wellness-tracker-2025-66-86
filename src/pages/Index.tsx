import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { MessageSquare, Apple, Camera, Target, Moon, Clock, UtensilsCrossed, HeartPulse, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface ToolCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  tools: Tool[];
}
interface Tool {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
  delay: number;
}
const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const allTools: Tool[] = [{
    title: 'AI Nutrition Assistant',
    description: 'Get personalized nutrition advice from our intelligent assistant',
    icon: MessageSquare,
    color: 'from-emerald-100 to-emerald-200',
    path: '/chat-assistant',
    delay: 100
  }, {
    title: 'Food Comparison',
    description: 'Compare nutritional values between different foods',
    icon: Apple,
    color: 'from-amber-100 to-amber-200',
    path: '/food-compare',
    delay: 200
  }, {
    title: 'Meal Recognition',
    description: 'Analyze your meal with a simple photo',
    icon: Camera,
    color: 'from-blue-100 to-blue-200',
    path: '/meal-recognition',
    delay: 300
  }, {
    title: 'Wellness Journey',
    description: 'Create your personalized wellness plan',
    icon: Target,
    color: 'from-purple-100 to-purple-200',
    path: '/wellness-journey',
    delay: 400
  }, {
    title: 'Sleep Tracker',
    description: 'Monitor and improve your sleep patterns',
    icon: Moon,
    color: 'from-indigo-100 to-indigo-200',
    path: '/sleep-tracker',
    delay: 500
  }, {
    title: 'Timetable Generator',
    description: 'Create your perfect daily schedule',
    icon: Clock,
    color: 'from-teal-100 to-teal-200',
    path: '/timetable-generator',
    delay: 600
  }];
  const categories: ToolCategory[] = [{
    name: "Diet & Nutrition",
    icon: UtensilsCrossed,
    color: "from-green-100 to-green-200",
    tools: allTools.filter(tool => ["AI Nutrition Assistant", "Food Comparison", "Meal Recognition"].includes(tool.title))
  }, {
    name: "Wellness & Planning",
    icon: Target,
    color: "from-purple-100 to-purple-200",
    tools: allTools.filter(tool => ["Wellness Journey", "Sleep Tracker", "Timetable Generator"].includes(tool.title))
  }];
  const benefits = [{
    title: 'Personalized Insights',
    description: 'Get tailored nutrition advice and health recommendations based on your unique needs and goals.',
    icon: <HeartPulse className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 200
  }, {
    title: 'AI-Powered Analysis',
    description: 'Our advanced AI analyzes your data to provide accurate nutritional information and actionable advice.',
    icon: <Target className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 300
  }, {
    title: 'Holistic Approach',
    description: 'We look at the whole picture of your health, not just calories or weight, to support your complete wellness journey.',
    icon: <UtensilsCrossed className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 400
  }];
  return <div className="min-h-screen bg-white text-wellness-dark">
      <Header />
      
      <main className="pt-24 pb-16 py-0">
        {/* Hero Section */}
        <section className="bg-[#f8f4e3] rounded-none py-[29px] my-0 mx-0">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-20 my-[43px]">
              <div className="mb-8 transform transition-transform duration-700" style={{
              transform: `scale(${1 - scrollY * 0.0005}) translateY(${scrollY * 0.1}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}>
                <img src="/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png" alt="Wellness Tracker Logo" className="h-32 w-auto mx-auto animate-pulse-soft" />
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-wellness-darkGreen mb-6 leading-tight" style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.003)
            }}>
                Your Wellness<br />Reimagined
              </h1>
              
              <p style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.004)
            }} className="text-xl text-wellness-charcoal/80 max-w-3xl mx-auto mb-12 leading-relaxed sm:text-lg text-center py-0 px-[114px] my-[43px]">Track nutrition, monitor health, and achieve your 
wellness goals with intelligent, AI-powered tools.</p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => navigate('/chat-assistant')} className="animate-fade-in glass-morphism bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white font-medium px-8 py-6 text-lg rounded-full" style={{
                animationDelay: '600ms'
              }}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce" style={{
            opacity: Math.max(0, 1 - scrollY * 0.01)
          }}>
              
            </div>
          </div>
        </section>
        
        {/* Tools Section */}
        <section className="px-4 sm:px-6 bg-white py-[60px]">
          <div className="max-w-6xl py-0 mx-[240px] my-[4px] px-0">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-4 opacity-0 animate-fade-in" style={{
              animationDelay: '100ms'
            }}>
                Powerful Tools for Your Wellbeing
              </h2>
              <p className="text-lg text-wellness-charcoal/70 max-w-2xl mx-auto opacity-0 animate-fade-in" style={{
              animationDelay: '200ms'
            }}>Our intelligent wellness tools helps you make informed decisions about your health.</p>
            </div>
            
            <div className="mb-10 flex justify-center gap-4 opacity-0 animate-fade-in" style={{
            animationDelay: '300ms'
          }}>
              {categories.map((category, idx) => <button key={idx} onClick={() => setActiveCategory(idx)} className={cn("px-6 py-3 rounded-full text-sm font-medium transition-all duration-300", activeCategory === idx ? "bg-wellness-darkGreen text-white shadow-md" : "bg-wellness-softGreen/50 text-wellness-darkGreen hover:bg-wellness-softGreen")}>
                  {category.name}
                </button>)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-px px-[50px]">
              {categories[activeCategory].tools.map((tool, idx) => <div key={idx} className="opacity-0 animate-fade-in" style={{
              animationDelay: `${300 + idx * 100}ms`
            }}>
                  <button onClick={() => navigate(tool.path)} className="w-full h-full glass-panel hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-out-expo p-8 flex flex-col items-center text-center group rounded-full text-4xl py-[29px] mx-0 bg-[#f8f4e3]/[0.77] px-[30px]">
                    <div className={`h-16 w-16 rounded-full bg-gradient-to-r ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <tool.icon className="h-8 w-8 text-wellness-darkGreen" />
                    </div>
                    <h3 className="text-xl font-medium text-wellness-darkGreen mb-3">{tool.title}</h3>
                    <p className="text-wellness-charcoal/70 text-sm px-[8px]">{tool.description}</p>
                    <div className="mt-6 w-12 h-12 rounded-full bg-wellness-softGreen/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                      <ArrowRight className="h-5 w-5 text-wellness-darkGreen" />
                    </div>
                  </button>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 bg-wellness-softBeige">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-4 opacity-0 animate-fade-in" style={{
              animationDelay: '100ms'
            }}>
                Why Choose Wellness Tracker
              </h2>
              <p className="text-lg text-wellness-charcoal/70 max-w-2xl mx-auto opacity-0 animate-fade-in" style={{
              animationDelay: '200ms'
            }}>
                Experience the advantages of our intelligent approach to wellness.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {benefits.map((benefit, idx) => <div key={idx} className="opacity-0 animate-fade-in" style={{
              animationDelay: `${300 + idx * 100}ms`
            }}>
                  <div className="glass-panel p-8 h-full hover:shadow-md transition-all duration-500">
                    <div className="mb-6 w-16 h-16 rounded-full bg-wellness-softGreen/50 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-medium text-wellness-darkGreen mb-3">{benefit.title}</h3>
                    <p className="text-wellness-charcoal/70">{benefit.description}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-4 text-center relative overflow-hidden my-0 py-[66px] sm:px-0">
          <div style={{
          backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
          backgroundSize: "30%",
          backgroundPosition: "center",
          filter: "blur(60px)"
        }} className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4] py-0 my-[69px]"></div>
          
          <div style={{
          animationDelay: '400ms'
        }} className="max-w-3xl mx-auto relative z-10 opacity-0 animate-fade-in my-0 py-0">
            <h2 className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-6">
              Begin Your Wellness Journey Today
            </h2>
            <p className="text-wellness-charcoal/70 mb-10 text-xl px-[53px] mx-[80px]">Take the first step toward a healthier, 
more balanced lifestyle with our AI-powered tools.</p>
            <Button onClick={() => navigate('/wellness-journey')} className="glass-morphism bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white font-medium px-8 py-6 text-lg rounded-full">
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-wellness-softGreen/30 my-0 py-0 bg-[Refactor_TimetableGenerator.tsx] bg-white">
        <div className="container text-center py-[5px] mx-0 px-0 bg-white">
          
          <p className="text-wellness-charcoal/60 text-sm">
            © {new Date().getFullYear()} Wellness Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;