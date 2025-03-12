
import React from 'react';
import Layout from '../components/Layout';
import AITherapistChat from '../components/psychologist/AITherapistChat';

const AIPsychologist = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-wellness-darkGreen mb-2">
          AI Psychologist
        </h1>
        <p className="text-wellness-charcoal/70 mb-8">
          Your personal mental wellness companion. Have a natural conversation about anything that's on your mind.
        </p>
        
        <AITherapistChat />
      </div>
    </Layout>
  );
};

export default AIPsychologist;
