import React from 'react';
import { Link } from 'react-router-dom';
const Logo: React.FC<{
  className?: string;
}> = ({
  className = ''
}) => {
  return <Link to="/" className={`inline-block transition-transform hover:scale-105 duration-300 ${className}`}>
      <div className="flex items-center gap-3">
        
        <span className="font-medium text-xl text-wellness-darkGreen">Wellness Tracker</span>
      </div>
    </Link>;
};
export default Logo;