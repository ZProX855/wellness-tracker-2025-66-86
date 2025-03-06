
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-wellness-softGreen opacity-30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/4 -right-4 w-80 h-80 bg-wellness-mediumGreen opacity-20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-wellness-darkGreen opacity-10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      <div 
        className="hidden lg:block absolute top-1/3 left-1/3 w-64 h-64 bg-wellness-softGreen opacity-20 animate-morph filter blur-2xl"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
