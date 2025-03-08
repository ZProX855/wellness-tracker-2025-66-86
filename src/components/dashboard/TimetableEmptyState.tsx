
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimetableEmptyState: React.FC = () => {
  return (
    <div className="text-center py-6">
      <Calendar className="h-12 w-12 mx-auto text-wellness-darkGreen opacity-50 mb-3" />
      <h4 className="text-wellness-darkGreen font-medium">No timetables yet</h4>
      <p className="text-sm text-wellness-charcoal mb-3">Create a personalized timetable to optimize your day</p>
      <Link 
        to="/timetable-generator" 
        className="inline-flex items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
      >
        Create Timetable
      </Link>
    </div>
  );
};

export default TimetableEmptyState;
