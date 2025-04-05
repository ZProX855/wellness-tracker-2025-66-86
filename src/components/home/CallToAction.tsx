
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="text-white px-0 mx-0 my-[100px] bg-[#68a688]/85 py-[40px]">
      <div className="container mx-auto text-center px-0 py-0">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start Your Wellness Journey Today
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12 mx-0 px-[54px] py-[6px] my-[26px]">
          <div className="flex items-center px-[20px]">
            <ShieldCheck className="h-5 w-5 mr-2" />
            <span>Privacy Protected</span>
          </div>
          <div className="flex items-center px-[20px]">
            <Activity className="h-5 w-5 mr-2" />
            <span>Backed by Science</span>
          </div>
          <div className="flex items-center px-[20px]">
            <Heart className="h-5 w-5 mr-2" />
            <span>Loved by Users</span>
          </div>
        </div>
        
        <Button size="lg" onClick={() => navigate('/register')} className="bg-white text-wellness-darkGreen hover:bg-wellness-softBeige py-0">
          Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
