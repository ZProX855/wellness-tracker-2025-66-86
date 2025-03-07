
import React from 'react';
import { useP5Sketch } from '../../hooks/useP5Sketch';

interface CyberBackgroundProps {
  className?: string;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ className }) => {
  const { containerRef, debugMessages } = useP5Sketch({
    containerId: 'cyber-background',
    debugPrefix: 'CyberBackground'
  });

  return (
    <>
      <div 
        ref={containerRef} 
        className={`fixed top-0 left-0 w-full h-full overflow-hidden ${className || ''}`}
        style={{ zIndex: -10 }}
      />
      {debugMessages && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black/70 text-white p-2 text-xs z-50 max-w-xs max-h-32 overflow-auto">
          <pre>{debugMessages}</pre>
        </div>
      )}
    </>
  );
};

export default CyberBackground;
