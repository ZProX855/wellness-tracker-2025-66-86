
import React from 'react';
import Layout from '../components/Layout';
import RoutineTrackerApp from '../components/routine-tracker/RoutineTrackerApp';
import { motion } from 'framer-motion';

const DailyRoutineTracker = () => {
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 min-h-[calc(100vh-6rem)]"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-wellness-softGreen/30 py-[20px] my-[40px]"
        >
          <RoutineTrackerApp />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DailyRoutineTracker;
