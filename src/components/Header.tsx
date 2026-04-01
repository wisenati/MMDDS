import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Shield, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full py-6 px-6 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Mango<span className="text-primary">Care</span>
            </h1>
            <p className="text-xs text-muted-foreground">Disease Detection AI</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            <span>8 Disease Types</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-warning" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
