
import React from 'react';
import { HeartPulse, Target, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium text-wellness-dark mb-4">How We Support Your Wellness</h2>
          <p className="text-lg text-wellness-charcoal/70 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with health expertise to deliver personalized wellness solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-500"
            >
              <div className="circle-feature h-16 w-16 mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium text-wellness-dark mb-3">{benefit.title}</h3>
              <p className="text-wellness-charcoal/80">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
