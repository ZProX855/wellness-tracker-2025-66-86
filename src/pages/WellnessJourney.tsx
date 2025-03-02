
import React from 'react';
import Header from '../components/Header';
import WellnessJourneyComponent from '../components/WellnessJourney';

const WellnessJourney = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <WellnessJourneyComponent />
        </div>
      </main>
    </div>
  );
};

export default WellnessJourney;
