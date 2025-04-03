
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="px-4 py-16 sm:py-20 text-center relative overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient blur effect */}
      <div 
        style={{
          backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
          backgroundSize: "40%",
          backgroundPosition: "center",
          filter: "blur(60px)"
        }} 
        className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4]" 
        aria-hidden="true" 
      />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl font-medium tracking-tight text-wellness-dark sm:text-4xl mb-6">
          Start your wellness journey today
        </h2>
        <p className="text-lg text-wellness-charcoal/80 mb-8">
          Join thousands of users who've transformed their relationship with nutrition and wellness.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/register')} 
            className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white"
            size="lg"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={() => navigate('/chat-assistant')} 
            variant="outline" 
            className="border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen"
            size="lg"
          >
            Try Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
