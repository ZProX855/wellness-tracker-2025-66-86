
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  scrollY: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollY }) => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-[#f8f4e3] rounded-none py-[29px] my-0 mx-0">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-20 my-[43px]">
          <div 
            className="mb-8 transform transition-transform duration-700" 
            style={{
              transform: `scale(${1 - scrollY * 0.0005}) translateY(${scrollY * 0.1}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}
          >
            <img 
              src="/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png" 
              alt="Wellness Tracker Logo" 
              className="h-32 w-auto mx-auto animate-pulse-soft" 
            />
          </div>
          
          <h1 
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.003)
            }} 
            className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-wellness-darkGreen mb-6 leading-tight px-0 mx-0 py-[4px]"
          >
            Your Wellness<br />Reimagined
          </h1>
          
          <p 
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.004)
            }} 
            className="text-xl text-wellness-charcoal/80 max-w-3xl mx-auto mb-12 leading-relaxed sm:text-lg text-center py-0 my-[44px] px-[159px]"
          >
            Track nutrition, monitor health, and achieve your wellness goals with intelligent, AI-powered tools.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate('/chat-assistant')} 
              className="animate-fade-in glass-morphism bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white font-medium px-8 py-6 text-lg rounded-full" 
              style={{ animationDelay: '600ms' }}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce" 
          style={{ opacity: Math.max(0, 1 - scrollY * 0.01) }}
        >
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
