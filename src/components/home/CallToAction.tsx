
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 bg-wellness-darkGreen text-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Wellness Journey?</h2>
            <p className="mb-6 text-white/80">
              Join thousands of users who have transformed their health with our AI-powered wellness tracking tools.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-wellness-lightGreen mt-1" />
                <div>
                  <h4 className="font-medium">Privacy First</h4>
                  <p className="text-sm text-white/70">Your health data stays private and secure</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-wellness-lightGreen mt-1" />
                <div>
                  <h4 className="font-medium">Personalized Experience</h4>
                  <p className="text-sm text-white/70">Recommendations that adapt to your unique needs</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-wellness-lightGreen mt-1" />
                <div>
                  <h4 className="font-medium">Holistic Health</h4>
                  <p className="text-sm text-white/70">We focus on your complete wellness journey</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-x-4">
              <Button 
                onClick={() => navigate('/register')} 
                className="bg-wellness-lightGreen hover:bg-wellness-mediumGreen text-wellness-darkGreen font-medium"
                size="lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => navigate('/bmi-calculator')} 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                size="lg"
              >
                Try BMI Calculator
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-wellness-mediumGreen/20 p-8 rounded-lg border border-wellness-mediumGreen/30 relative z-10">
              <h3 className="text-xl font-semibold mb-4">What Our Users Say</h3>
              
              <div className="space-y-4">
                <blockquote className="p-4 bg-white/10 rounded border-l-4 border-wellness-lightGreen">
                  <p className="italic text-sm mb-2">
                    "The AI meal recognition has been a game-changer for my nutrition tracking. So much easier than manually logging everything!"
                  </p>
                  <footer className="text-xs text-white/70">— Jamie L.</footer>
                </blockquote>
                
                <blockquote className="p-4 bg-white/10 rounded border-l-4 border-wellness-lightGreen">
                  <p className="italic text-sm mb-2">
                    "I've tried many wellness apps, but this is the first one that actually helps me understand my habits and make meaningful changes."
                  </p>
                  <footer className="text-xs text-white/70">— Alex M.</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
