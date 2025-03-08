
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TimetableHistoryItem from './TimetableHistoryItem';
import TimetableEmptyState from './TimetableEmptyState';
import TimetableLoadingState from './TimetableLoadingState';
import TimetableErrorState from './TimetableErrorState';
import { toast } from 'sonner';

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

  const fetchTimetables = async () => {
    if (!user) return;
    
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
        toast.error('Failed to load timetable history');
      } else {
        setLocalTimetables(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch timetable history:', error);
      setError('An unexpected error occurred.');
      toast.error('An unexpected error occurred while loading timetables');
    } finally {
      setIsLocalLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we're told to fetch and don't have prop data
    if (fetchData && !propTimetables && user) {
      fetchTimetables();
    }
  }, [user, fetchData, propTimetables]);

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
      
      {isLoading && <TimetableLoadingState />}
      
      {!isLoading && error && <TimetableErrorState error={error} onRetry={() => window.location.reload()} />}
      
      {!isLoading && !error && (
        <>
          {timetables.length > 0 ? (
            <div className="space-y-3">
              {timetables.map((timetable) => (
                <TimetableHistoryItem key={timetable.id} timetable={timetable} />
              ))}
            </div>
          ) : (
            <TimetableEmptyState />
          )}
        </>
      )}
    </div>
  );
};

export default TimetableHistoryPanel;
