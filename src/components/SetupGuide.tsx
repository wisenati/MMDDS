import React from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  FolderTree, 
  Play, 
  Database, 
  Server,
  Code,
  Download,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface SetupStep {
  title: string;
  description: string;
  code?: string;
  icon: React.ElementType;
}

const steps: SetupStep[] = [
  {
    title: "Create Virtual Environment",
    description: "Open command prompt in your project folder and run:",
    code: `python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Mac/Linux`,
    icon: Terminal
  },
  {
    title: "Create Backend Folder",
    description: "Create the backend directory structure:",
    code: `mkdir backend
cd backend`,
    icon: FolderTree
  },
  {
    title: "Install Dependencies",
    description: "Create requirements.txt and install packages:",
    code: `pip install tensorflow keras numpy pandas pillow scikit-learn matplotlib flask flask-cors opencv-python`,
    icon: Download
  },
  {
    title: "Train the Model",
    description: "Run the training script (this may take 30-60 minutes):",
    code: `python train_model.py`,
    icon: Database
  },
  {
    title: "Start API Server",
    description: "Run the Flask server to enable predictions:",
    code: `python app.py
# Server runs at http://localhost:5000`,
    icon: Server
  }
];

const SetupGuide: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full mt-12 pt-8 border-t border-border"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Python Backend Setup</h3>
          <p className="text-sm text-muted-foreground">Follow these steps to enable AI predictions</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 
                         hover:shadow-soft transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  {step.code && (
                    <pre className="p-3 rounded-lg bg-muted text-xs font-mono text-foreground overflow-x-auto">
                      {step.code}
                    </pre>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Folder Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-8 p-6 rounded-xl bg-muted/50 border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <FolderTree className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Expected Folder Structure</h4>
        </div>
        <pre className="text-xs font-mono text-muted-foreground leading-relaxed">
{`MANGO DISEASE DETECTION/
├── dataset/
│   └── images/
│       ├── Anthracnose/
│       ├── Bacterial Canker/
│       ├── Cutting Weevil/
│       ├── Die Back/
│       ├── Gall Midge/
│       ├── Healthy/
│       ├── Powdery Mildew/
│       └── Sooty Mould/
├── models/                    ← Created after training
│   └── mango_disease_model.h5
├── backend/
│   ├── app.py                 ← Flask server
│   ├── train_model.py         ← Training script
│   └── requirements.txt
└── mango_dataset.csv`}
        </pre>
      </motion.div>

      {/* Success indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3"
      >
        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
        <p className="text-sm text-foreground">
          Once the Flask server is running, this app will automatically connect for real predictions!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SetupGuide;
