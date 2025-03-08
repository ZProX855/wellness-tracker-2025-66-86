
import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type TimetableRecord = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  schedule: any;
};

interface TimetableHistoryPanelProps {
  timetables: TimetableRecord[];
  isLoading: boolean;
}

const TimetableHistoryPanel: React.FC<TimetableHistoryPanelProps> = ({ timetables, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-wellness-darkGreen">Timetable History</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-wellness-softGreen/20 rounded"></div>
          <div className="h-12 bg-wellness-softGreen/20 rounded"></div>
          <div className="h-12 bg-wellness-softGreen/20 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-wellness-darkGreen">Timetable History</h3>
        <Link 
          to="/timetable-generator" 
          className="text-sm text-wellness-darkGreen hover:text-wellness-mediumGreen flex items-center"
        >
          Create new <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {timetables.length > 0 ? (
        <div className="space-y-3">
          {timetables.map((timetable) => (
            <div 
              key={timetable.id} 
              className="p-3 bg-wellness-softGreen/10 rounded-lg hover:bg-wellness-softGreen/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-wellness-darkGreen">{timetable.name}</h4>
                  {timetable.description && (
                    <p className="text-sm text-wellness-charcoal line-clamp-1">{timetable.description}</p>
                  )}
                </div>
                <span className="text-xs text-wellness-charcoal flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(timetable.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-wellness-charcoal flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Object.keys(timetable.schedule).length} activities
                </span>
                <Link
                  to={`/timetable-generator?id=${timetable.id}`}
                  className="text-xs bg-wellness-darkGreen text-white px-2 py-1 rounded hover:bg-wellness-mediumGreen transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default TimetableHistoryPanel;
