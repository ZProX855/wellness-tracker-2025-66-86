
import React from 'react';
import { HeartPulse, Target, UtensilsCrossed } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [{
    title: 'Personalized Insights',
    description: 'Get tailored nutrition advice and health recommendations based on your unique needs and goals.',
    icon: <HeartPulse className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 200
  }, {
    title: 'AI-Powered Analysis',
    description: 'Our advanced AI analyzes your data to provide accurate nutritional information and actionable advice.',
    icon: <Target className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 300
  }, {
    title: 'Holistic Approach',
    description: 'We look at the whole picture of your health, not just calories or weight, to support your complete wellness journey.',
    icon: <UtensilsCrossed className="h-8 w-8 text-wellness-darkGreen" />,
    delay: 400
  }];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-wellness-darkGreen">How We Help You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg border border-wellness-softBeige hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-wellness-darkGreen">{benefit.title}</h3>
              <p className="text-wellness-charcoal">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
