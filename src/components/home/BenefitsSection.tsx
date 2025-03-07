
import React, { useState } from 'react';
import { HeartPulse, Target, UtensilsCrossed } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const benefits = [
    {
      title: 'Personalized Insights',
      description: 'Get tailored nutrition advice and health recommendations based on your unique needs and goals.',
      icon: <HeartPulse className="h-8 w-8 text-wellness-darkGreen" />,
      delay: 200
    }, 
    {
      title: 'AI-Powered Analysis',
      description: 'Our advanced AI analyzes your data to provide accurate nutritional information and actionable advice.',
      icon: <Target className="h-8 w-8 text-wellness-darkGreen" />,
      delay: 300
    }, 
    {
      title: 'Holistic Approach',
      description: 'We look at the whole picture of your health, not just calories or weight, to support your complete wellness journey.',
      icon: <UtensilsCrossed className="h-8 w-8 text-wellness-darkGreen" />,
      delay: 400
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-wellness-softBeige/70 backdrop-blur-sm relative">
      {/* Background circle accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-wellness-softGreen/20 blur-xl" />
        <div className="absolute top-1/2 -right-32 w-64 h-64 rounded-full bg-wellness-softGreen/10 blur-xl" />
        <div className="absolute bottom-10 left-1/4 w-24 h-24 rounded-full bg-wellness-mediumGreen/10 blur-lg" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-wellness-softGreen/40 mx-auto mb-6 flex items-center justify-center green-glow">
            <div className="w-12 h-12 rounded-full bg-wellness-darkGreen/60 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/90" />
            </div>
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-4 opacity-0 animate-fade-in" 
            style={{ animationDelay: '100ms' }}
          >
            Why Choose Wellness Tracker
          </h2>
          <p 
            className="text-lg text-wellness-charcoal/70 max-w-2xl mx-auto opacity-0 animate-fade-in" 
            style={{ animationDelay: '200ms' }}
          >
            Experience the advantages of our intelligent approach to wellness.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx} 
              className="opacity-0 animate-fade-in relative" 
              style={{ animationDelay: `${300 + idx * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`glass-panel p-8 h-full transition-all duration-500 rounded-3xl border border-wellness-softGreen/40 backdrop-blur-md bg-white/50 ${hoveredIndex === idx ? 'green-glow' : ''}`}>
                {/* Accent circles */}
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-wellness-softGreen/30 opacity-70" />
                <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-wellness-darkGreen/20 opacity-50" />
                
                <div className="relative">
                  <div className="mb-6 w-16 h-16 rounded-full bg-wellness-softGreen/50 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-wellness-darkGreen mb-3">{benefit.title}</h3>
                  <p className="text-wellness-charcoal/70">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom decorative circles */}
        <div className="mt-16 flex justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-wellness-mediumGreen/40" />
          <div className="w-3 h-3 rounded-full bg-wellness-mediumGreen/60" />
          <div className="w-3 h-3 rounded-full bg-wellness-mediumGreen/40" />
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
