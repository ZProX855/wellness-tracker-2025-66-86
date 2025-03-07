
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
    <section className="py-20 px-4 sm:px-6 bg-wellness-softBeige/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl font-medium text-wellness-darkGreen mb-4 opacity-0 animate-fade-in glow-effect" 
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
              {/* Background glow effect that appears on hover */}
              <div 
                className="absolute inset-0 rounded-lg transition-all duration-500 z-0"
                style={{
                  background: hoveredIndex === idx 
                    ? 'radial-gradient(circle at center, rgba(104, 166, 136, 0.15), transparent 70%)' 
                    : 'none',
                  transform: hoveredIndex === idx ? 'scale(1.1)' : 'scale(1)',
                  opacity: hoveredIndex === idx ? 1 : 0
                }}
              />
              
              <div className={`glass-panel p-8 h-full transition-all duration-500 backdrop-blur-sm bg-white/80 rounded-lg relative z-10 ${
                hoveredIndex === idx ? 'shadow-lg shadow-wellness-darkGreen/20' : 'hover:shadow-md'
              }`}>
                <div className={`mb-6 w-16 h-16 rounded-full bg-wellness-softGreen/50 flex items-center justify-center transition-transform duration-500 ${
                  hoveredIndex === idx ? 'scale-110 glow-effect' : ''
                }`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-medium text-wellness-darkGreen mb-3">{benefit.title}</h3>
                <p className="text-wellness-charcoal/70">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
