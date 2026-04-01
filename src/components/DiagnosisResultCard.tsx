import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle, Info, Leaf, Bug, Droplets } from 'lucide-react';

export interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'healthy' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  treatment: string[];
  prevention: string[];
}

interface DiagnosisResultCardProps {
  result: DiagnosisResult;
}

const severityConfig = {
  healthy: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: CheckCircle,
    label: 'Healthy',
  },
  low: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: Info,
    label: 'Low Risk',
  },
  medium: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: AlertCircle,
    label: 'Moderate',
  },
  high: {
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: AlertTriangle,
    label: 'High Risk',
  },
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: XCircle,
    label: 'Critical',
  },
};

const DiagnosisResultCard: React.FC<DiagnosisResultCardProps> = ({ result }) => {
  const config = severityConfig[result.severity];
  const SeverityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Main Result Card */}
      <div className={`
        relative overflow-hidden rounded-2xl border ${config.border} ${config.bg}
        p-6 shadow-soft
        ${result.severity !== 'healthy' && result.severity !== 'low' ? 'pulse-alert' : ''}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
              <SeverityIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground">
                {result.disease}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {(result.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
            </div>
          </div>
          
          {/* Confidence Ring */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted/30"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${result.confidence * 176} 176`}
                className={config.color}
                initial={{ strokeDasharray: "0 176" }}
                animate={{ strokeDasharray: `${result.confidence * 176} 176` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${config.color}`}>
                {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-6">
          {result.description}
        </p>

        {/* Treatment & Prevention */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Treatment */}
          {result.treatment.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-background/50 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Treatment</h4>
              </div>
              <ul className="space-y-2">
                {result.treatment.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Prevention */}
          {result.prevention.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background/50 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-success" />
                <h4 className="font-semibold text-foreground">Prevention</h4>
              </div>
              <ul className="space-y-2">
                {result.prevention.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DiagnosisResultCard;
