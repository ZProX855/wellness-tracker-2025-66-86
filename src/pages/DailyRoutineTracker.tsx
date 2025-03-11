
import React from 'react';
import Layout from '../components/Layout';
import RoutineTrackerApp from '../components/routine-tracker/RoutineTrackerApp';

const DailyRoutineTracker = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <RoutineTrackerApp />
      </div>
    </Layout>
  );
};

export default DailyRoutineTracker;
