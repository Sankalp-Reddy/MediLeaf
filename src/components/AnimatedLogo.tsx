
import React from 'react';
import { Leaf, Flower } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-leaf-light via-leaf to-leaf-dark p-2"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="h-5 w-5 text-white" />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-nature-300 p-1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Flower className="h-2.5 w-2.5 text-white" />
        </motion.div>
      </div>
      <div className="flex flex-col">
        <motion.span 
          className="font-serif font-bold text-lg leading-tight tracking-tight"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-gradient">MediLeaf</span>
        </motion.span>
        <motion.span 
          className="text-xs text-muted-foreground"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Plant Identifier
        </motion.span>
      </div>
    </div>
  );
};

export default AnimatedLogo;
