
import React from 'react';
import Header from '../components/Header';
import WellnessJourneyComponent from '../components/WellnessJourney';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const WellnessJourney = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2">Your Wellness Journey</h1>
            <p className="text-wellness-charcoal">Set your health goals and get a personalized wellness plan with AI-powered insights.</p>
          </div>
          
          <WellnessJourneyComponent />
        </div>
      </main>
    </div>
  );
};

export default WellnessJourney;
