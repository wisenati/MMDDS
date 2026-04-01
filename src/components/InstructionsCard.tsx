import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstructionsCard: React.FC = () => {
  const handleDownload = () => {
    // Download the instructions markdown file
    const link = document.createElement('a');
    link.href = '/BACKEND_INSTRUCTIONS.md';
    link.download = 'BACKEND_INSTRUCTIONS.md';
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 
                 border border-primary/20 mt-8"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Complete Setup Instructions
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get the full Python training script, Flask API server code, and step-by-step 
            instructions to set up your machine learning backend.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructionsCard;
