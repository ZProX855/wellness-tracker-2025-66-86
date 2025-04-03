
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="px-4 py-16 sm:py-24 text-center relative overflow-hidden sm:px-6 lg:px-8">
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
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-wellness-softGreen rounded-full">
            <Heart className="h-8 w-8 text-wellness-darkGreen" />
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-wellness-darkGreen mb-6">
          Start Your Wellness Journey Today
        </h2>
        
        <p className="text-lg sm:text-xl text-wellness-charcoal mb-8 max-w-2xl mx-auto">
          Join thousands of users who have transformed their health with our AI-powered wellness tools and personalized guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            className="w-full sm:w-auto text-lg py-6 px-8 bg-wellness-darkGreen hover:bg-wellness-mediumGreen transition-all flex items-center justify-center gap-2 shadow-lg"
            onClick={() => navigate('/register')}
          >
            <ShieldCheck className="h-5 w-5" />
            Create Free Account
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-lg py-6 px-8 border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20 transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/login')}
          >
            <Activity className="h-5 w-5" />
            Sign In
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-wellness-softGreen/20">
            <h3 className="text-wellness-darkGreen font-semibold mb-2">AI-Powered Tools</h3>
            <p className="text-wellness-charcoal text-sm">Advanced AI technology to help you achieve your health goals</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-wellness-softGreen/20">
            <h3 className="text-wellness-darkGreen font-semibold mb-2">Personalized Experience</h3>
            <p className="text-wellness-charcoal text-sm">Tailored recommendations based on your unique health profile</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-wellness-softGreen/20">
            <h3 className="text-wellness-darkGreen font-semibold mb-2">Secure Privacy</h3>
            <p className="text-wellness-charcoal text-sm">Your data is protected with enterprise-grade security measures</p>
          </div>
        </div>
        
        <div className="mt-12 text-wellness-charcoal text-sm">
          <p>Already tracking your wellness journey with us?</p>
          <button 
            onClick={() => navigate('/login')} 
            className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen font-medium mt-2"
          >
            Sign in to your account
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
