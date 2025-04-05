
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`inline-block transition-transform hover:scale-105 duration-300 ${className}`}
    >
      <div className="flex items-center gap-3">
        <img 
          src="/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png" 
          alt="Wellness Tracker Logo" 
          className="h-12 w-auto"
        />
        <span className="font-medium text-xl text-wellness-darkGreen">Wellness Tracker</span>
      </div>
    </Link>
  );
};

export default Logo;
