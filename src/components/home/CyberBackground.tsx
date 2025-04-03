
import React from 'react';
import { useP5Sketch } from '../../hooks/useP5Sketch';

interface CyberBackgroundProps {
  className?: string;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ className }) => {
  const { containerRef } = useP5Sketch({
    containerId: 'cyber-background',
    debugPrefix: 'CyberBackground'
  });

  return (
    <div 
      ref={containerRef} 
      className={`fixed top-0 left-0 w-full h-full overflow-hidden ${className || ''}`}
      style={{ zIndex: -10 }}
    />
  );
};

export default CyberBackground;
