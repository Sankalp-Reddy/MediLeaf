
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center py-8", className)}>
      <motion.div 
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {/* Circular spinner */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <motion.div 
          className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
        />
        
        {/* Center leaf icon */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-primary" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 2-4 .5-1.5.5-3 .5-4.5s.08-3 0-4.5c0 0 .33 1 1 2s1.5 1.25 2 1.5c.5.25 1.25.5 2 0s1.25-1 1.5-1.5.75-1 0-1.5-1.5-1.5-2.5-1c-1 .5-2 1.5-3 2.5-1 1-2 2.5-2.5 4-1.25 3.5-1.25 5.5-.5 9.5 0 0 .5-3 1.5-4s2-1.5 3-1.5c1 0 2.24.5 2.5 1.5.25 1 0 2-.5 2.5s-1 .5-1.5 0c-.5-.5-1.25-1.5-.5-2.5s2.5-1 4.5 0c2 1 3 3 3 5.5z"/>
          </svg>
        </motion.div>
      </motion.div>
      
      <div className="mt-6 relative">
        <div className="h-1.5 w-48 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 w-full bg-[length:200%_100%]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
          />
        </div>
        
        <motion.p 
          className="text-sm text-muted-foreground mt-3 text-center font-medium"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Identifying your plant...
        </motion.p>
        
        <motion.div 
          className="mt-2 text-xs text-center text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Analyzing leaf patterns and characteristics
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
