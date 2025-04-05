
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Logo: React.FC<{
  className?: string;
}> = ({
  className = ''
}) => {
  return (
    <Link to="/" className={`inline-block transition-transform hover:scale-105 duration-300 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-wellness-softBeige border-2 border-wellness-mediumGreen flex items-center justify-center">
          <Heart size={14} className="text-wellness-darkGreen" fill="#68A688" />
        </div>
        <span className="font-medium text-xl text-wellness-darkGreen">Wellness Tracker</span>
      </div>
    </Link>
  );
};

export default Logo;
