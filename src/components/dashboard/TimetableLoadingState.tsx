
import React from 'react';
import { Loader } from 'lucide-react';

const TimetableLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader className="h-8 w-8 text-wellness-mediumGreen animate-spin mb-3" />
      <p className="text-wellness-darkGreen">Loading your timetables...</p>
    </div>
  );
};

export default TimetableLoadingState;
