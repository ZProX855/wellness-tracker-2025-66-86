
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
    <div>
      {/* Component content would go here */}
    </div>
  );
};

export default BenefitsSection;
