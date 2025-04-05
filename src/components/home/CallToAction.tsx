
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-wellness-darkGreen text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start Your Wellness Journey Today
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of users who have transformed their health with our AI-powered wellness tracker.
          Get personalized insights, track your progress, and achieve your health goals.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            <span>Privacy Protected</span>
          </div>
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            <span>Backed by Science</span>
          </div>
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            <span>Loved by Users</span>
          </div>
        </div>
        
        <Button 
          size="lg"
          onClick={() => navigate('/register')}
          className="bg-white text-wellness-darkGreen hover:bg-wellness-softBeige"
        >
          Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
