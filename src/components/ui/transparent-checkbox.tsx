
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TransparentCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TransparentCheckbox: React.FC<TransparentCheckboxProps> = ({
  checked,
  onChange,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={cn(
        "relative rounded-full border-2 border-wellness-darkGreen/30 backdrop-blur-sm",
        "transition-all duration-200 ease-in-out",
        "hover:border-wellness-darkGreen/50",
        "focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen/20",
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: checked ? 1 : 0,
          scale: checked ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center text-wellness-darkGreen"
      >
        <Check className={cn(
          "stroke-2",
          size === 'sm' && "w-4 h-4",
          size === 'md' && "w-5 h-5",
          size === 'lg' && "w-6 h-6"
        )} />
      </motion.div>
    </motion.button>
  );
};

export default TransparentCheckbox;
