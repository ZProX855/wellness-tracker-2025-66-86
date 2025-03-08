
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type TimetableRecord = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  schedule: any;
};

interface TimetableHistoryPanelProps {
  timetables?: TimetableRecord[];
  isLoading?: boolean;
  fetchData?: boolean;
}

const TimetableHistoryPanel: React.FC<TimetableHistoryPanelProps> = ({ 
  timetables: propTimetables, 
  isLoading: propIsLoading,
  fetchData = true
}) => {
  const [localTimetables, setLocalTimetables] = useState<TimetableRecord[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Use either props or local state
  const timetables = propTimetables || localTimetables;
  const isLoading = propIsLoading !== undefined ? propIsLoading : isLocalLoading;

  useEffect(() => {
    // Only fetch if we're told to fetch and don't have prop data
    if (fetchData && !propTimetables && user) {
      const fetchTimetables = async () => {
        setIsLocalLoading(true);
        setError(null);
        
        try {
          // Set a timeout to prevent hanging requests
          const timeoutId = setTimeout(() => {
            setIsLocalLoading(false);
            setError('Request timed out. Please try again.');
          }, 5000);
          
          const { data, error } = await supabase
            .from('timetable_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          clearTimeout(timeoutId);
          
          if (error) {
            console.error('Error fetching timetable history:', error);
            setError('Failed to load timetable history.');
          } else {
            setLocalTimetables(data || []);
          }
        } catch (error) {
          console.error('Failed to fetch timetable history:', error);
          setError('An unexpected error occurred.');
        } finally {
          setIsLocalLoading(false);
        }
      };
      
      fetchTimetables();
    }
  }, [user, fetchData, propTimetables]);

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-wellness-darkGreen">Timetable History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="h-8 w-8 text-wellness-mediumGreen animate-spin mb-3" />
          <p className="text-wellness-darkGreen">Loading your timetables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm border border-wellness-softGreen/30 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-wellness-darkGreen">Timetable History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-red-500 mb-3">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm bg-wellness-darkGreen text-white px-3 py-1.5 rounded hover:bg-wellness-mediumGreen transition-colors"
          >
            Refresh
          </button>
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
