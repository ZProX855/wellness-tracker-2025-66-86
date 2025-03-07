
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="px-4 text-center relative overflow-hidden sm:px-0 py-0 my-[58px]">
      <div 
        style={{
          backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
          backgroundSize: "30%",
          backgroundPosition: "center",
          filter: "blur(60px)"
        }} 
        className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4] py-0 my-[69px]"
      ></div>
      
      <div 
        style={{ animationDelay: '400ms' }} 
        className="max-w-3xl mx-auto relative z-10 opacity-0 animate-fade-in my-0 py-0"
      >
        <h2 className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-6">
          Begin Your Wellness Journey Today
        </h2>
        <p className="text-wellness-charcoal/70 mb-10 text-xl px-[53px] mx-[80px]">
          Take the first step toward a healthier, more balanced lifestyle with our AI-powered tools.
        </p>
        <Button 
          onClick={() => navigate('/wellness-journey')} 
          className="glass-morphism bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white font-medium px-8 py-6 text-lg rounded-full"
        >
          Start Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
