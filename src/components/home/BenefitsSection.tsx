
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-wellness-softBeige/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-wellness-darkGreen mb-4">
            The Benefits of AI-Powered Wellness
          </h2>
          <p className="text-lg text-wellness-charcoal max-w-3xl mx-auto">
            Our cutting-edge AI technology helps you make better health decisions with personalized insights and recommendations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-wellness-softGreen/30 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${benefit.delay}ms` }}
            >
              <div className="w-16 h-16 bg-wellness-softGreen/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-wellness-darkGreen mb-4 text-center">
                {benefit.title}
              </h3>
              <p className="text-wellness-charcoal text-center">
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
