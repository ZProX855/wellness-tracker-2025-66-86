
import React from 'react';

interface TimetableErrorStateProps {
  error: string;
  onRetry: () => void;
}

const TimetableErrorState: React.FC<TimetableErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-red-500 mb-3">{error}</p>
      <button 
        onClick={onRetry}
        className="text-sm bg-wellness-darkGreen text-white px-3 py-1.5 rounded hover:bg-wellness-mediumGreen transition-colors"
      >
        Refresh
      </button>
    </div>
  );
};

export default TimetableErrorState;
