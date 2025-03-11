
import React from 'react';
import Layout from '../components/Layout';
import RoutineTrackerApp from '../components/routine-tracker/RoutineTrackerApp';

const DailyRoutineTracker = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-6rem)]">
        <div className="max-w-7xl mx-auto bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-wellness-softGreen/30">
          <RoutineTrackerApp />
        </div>
      </div>
    </Layout>
  );
};

export default DailyRoutineTracker;
