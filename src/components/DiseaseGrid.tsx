import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Bug, 
  Leaf, 
  AlertTriangle,
  Droplets,
  Wind,
  Scissors,
  Skull
} from 'lucide-react';

interface DiseaseType {
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const diseases: DiseaseType[] = [
  { 
    name: 'Anthracnose', 
    icon: Bug, 
    color: 'text-primary',
    description: 'Fungal disease causing dark lesions' 
  },
  { 
    name: 'Bacterial Canker', 
    icon: AlertTriangle, 
    color: 'text-destructive',
    description: 'Bacterial infection with oozing lesions' 
  },
  { 
    name: 'Cutting Weevil', 
    icon: Scissors, 
    color: 'text-warning',
    description: 'Insect damage to shoots and leaves' 
  },
  { 
    name: 'Die Back', 
    icon: Skull, 
    color: 'text-destructive',
    description: 'Progressive death of twigs and branches' 
  },
  { 
    name: 'Gall Midge', 
    icon: Bug, 
    color: 'text-warning',
    description: 'Insect causing gall formation' 
  },
  { 
    name: 'Healthy', 
    icon: Leaf, 
    color: 'text-success',
    description: 'No disease detected' 
  },
  { 
    name: 'Powdery Mildew', 
    icon: Wind, 
    color: 'text-muted-foreground',
    description: 'White powdery fungal coating' 
  },
  { 
    name: 'Sooty Mould', 
    icon: Droplets, 
    color: 'text-foreground',
    description: 'Black fungal growth on leaves' 
  },
];

const DiseaseGrid: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Detectable Diseases</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {diseases.map((disease, index) => {
          const Icon = disease.icon;
          return (
            <motion.div
              key={disease.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 
                         hover:shadow-soft transition-all duration-300 cursor-default"
            >
              <div className={`mb-2 ${disease.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {disease.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {disease.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DiseaseGrid;
