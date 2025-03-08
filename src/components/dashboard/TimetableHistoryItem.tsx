
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

interface TimetableHistoryItemProps {
  timetable: TimetableRecord;
}

const TimetableHistoryItem: React.FC<TimetableHistoryItemProps> = ({ timetable }) => {
  return (
    <div 
      className="p-3 bg-wellness-softGreen/10 rounded-lg hover:bg-wellness-softGreen/20 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-wellness-darkGreen">{timetable.name || 'Untitled Timetable'}</h4>
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
          {Object.keys(timetable.schedule || {}).length} activities
        </span>
        <Link
          to={`/timetable-generator?id=${timetable.id}`}
          className="text-xs bg-wellness-darkGreen text-white px-2 py-1 rounded hover:bg-wellness-mediumGreen transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TimetableHistoryItem;
