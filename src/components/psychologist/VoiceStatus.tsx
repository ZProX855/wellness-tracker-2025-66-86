
import React from 'react';
import { motion } from 'framer-motion';

const VoiceStatus = () => {
  return (
    <div className="flex items-center justify-center h-8 mt-2">
      <div className="flex items-end space-x-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-wellness-darkGreen"
            animate={{
              height: ["4px", "16px", "8px", "24px", "4px"],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-wellness-charcoal/70 ml-2">Speaking...</span>
    </div>
  );
};

export default VoiceStatus;
