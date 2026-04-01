import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ onClick, disabled, isAnalyzing }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className={`
          relative w-full md:w-auto px-8 py-6 text-lg font-semibold
          bg-primary hover:bg-primary/90 text-primary-foreground
          rounded-xl shadow-elevated hover:shadow-float
          transition-all duration-300 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          overflow-hidden group
        `}
      >
        {/* Background animation */}
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-destructive/80 to-primary 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <span className="relative flex items-center gap-3">
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground 
                              rounded-full animate-spin" />
              <span>Analyzing Disease...</span>
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" />
              <span>Analyze Leaf</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </Button>
    </motion.div>
  );
};

export default AnalyzeButton;
