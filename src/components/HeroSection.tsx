import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-mango-leaves.jpg';

const HeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-56 md:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-elevated"
    >
      {/* Hero Image */}
      <img
        src={heroImage}
        alt="Mango leaves disease detection"
        className="w-full h-full object-cover object-center"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center p-6 md:p-10">
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                           bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Detection
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight"
          >
            Protect Your<br />
            <span className="text-primary">Mango Harvest</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-3 text-sm md:text-base text-muted-foreground max-w-md"
          >
            Instant disease diagnosis with treatment recommendations
          </motion.p>
        </div>
      </div>
      
      {/* Decorative status badge */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/95 backdrop-blur-sm shadow-soft border border-border"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-foreground">System Ready</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
