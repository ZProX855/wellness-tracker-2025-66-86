
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-gradient-to-br from-wellness-softGreen to-wellness-softGreen/20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-wellness-darkGreen mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          
          <p className="text-lg text-wellness-charcoal mb-8">
            Join thousands of users who have transformed their health with our AI-powered wellness platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-wellness-darkGreen" />
              <span>Privacy Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-wellness-darkGreen" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-wellness-darkGreen" />
              <span>User-Centered Design</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/register')}
            className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white px-8 py-6 rounded-full text-lg"
          >
            Get Started For Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
