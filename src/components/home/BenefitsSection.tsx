
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
    <section className="py-20 bg-wellness-softBeige">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-wellness-darkGreen mb-4">Why Choose Wellness Tracker?</h2>
          <p className="text-wellness-charcoal max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with nutrition science to give you the most accurate and helpful wellness guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-wellness-mediumGreen/20 flex flex-col items-center text-center transition-all hover:shadow-md"
              style={{ animationDelay: `${benefit.delay}ms` }}
            >
              <div className="p-3 bg-wellness-lightGreen rounded-full mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-wellness-darkGreen mb-3">{benefit.title}</h3>
              <p className="text-wellness-charcoal">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
