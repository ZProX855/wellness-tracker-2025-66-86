
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="px-4 py-16 sm:py-24 text-center relative overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient blur effect */}
      <div style={{
        backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
        backgroundSize: "40%",
        backgroundPosition: "center",
        filter: "blur(60px)"
      }} className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4]" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-medium text-wellness-dark mb-6">Ready to Start Your Wellness Journey?</h2>
        <p className="text-lg text-wellness-charcoal/80 mb-8">
          Join thousands of users who have transformed their lives with our AI-powered wellness tools.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white px-8 py-6 h-auto text-lg rounded-full"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={() => navigate('/chat-assistant')} 
            variant="outline" 
            className="border-wellness-mediumGreen bg-transparent hover:bg-wellness-softGreen/50 text-wellness-darkGreen px-8 py-6 h-auto text-lg rounded-full"
          >
            Try Demo
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-wellness-softGreen/30 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <ShieldCheck className="h-10 w-10 text-wellness-darkGreen mb-4" />
              <h3 className="font-medium text-lg mb-2">Safe & Secure</h3>
              <p className="text-sm text-wellness-charcoal/70">Your health data is always private and protected</p>
            </CardContent>
          </Card>
          
          <Card className="border-wellness-softGreen/30 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <Activity className="h-10 w-10 text-wellness-darkGreen mb-4" />
              <h3 className="font-medium text-lg mb-2">Science-Based</h3>
              <p className="text-sm text-wellness-charcoal/70">Our advice is backed by scientific research</p>
            </CardContent>
          </Card>
          
          <Card className="border-wellness-softGreen/30 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <Heart className="h-10 w-10 text-wellness-darkGreen mb-4" />
              <h3 className="font-medium text-lg mb-2">Personalized</h3>
              <p className="text-sm text-wellness-charcoal/70">Tailored recommendations just for you</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
