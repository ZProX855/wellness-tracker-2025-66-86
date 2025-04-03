
import React from 'react';
import { HeartPulse, Target, UtensilsCrossed } from 'lucide-react';

const BenefitsSection: React.FC = () => {
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
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-wellness-dark sm:text-4xl mb-4">
            Why Choose NutriWell
          </h2>
          <p className="max-w-2xl mx-auto text-wellness-charcoal/80">
            Our platform is designed to give you the tools and insights you need for a healthier lifestyle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-wellness-softGreen/30"
              style={{animationDelay: `${benefit.delay}ms`}}
            >
              <div className="w-16 h-16 rounded-full bg-wellness-softGreen flex items-center justify-center mb-4 mx-auto">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium text-wellness-dark mb-2 text-center">
                {benefit.title}
              </h3>
              <p className="text-wellness-charcoal/70 text-center">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
