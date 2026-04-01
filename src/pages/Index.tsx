import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Settings } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ImageUploadZone from '@/components/ImageUploadZone';
import DiseaseGrid from '@/components/DiseaseGrid';
import AnalyzeButton from '@/components/AnalyzeButton';
import DiagnosisResultCard, { DiagnosisResult } from '@/components/DiagnosisResultCard';
import SetupGuide from '@/components/SetupGuide';
import { analyzeImage } from '@/lib/diseaseApi';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const diagnosisResult = await analyzeImage(selectedImage);
      setResult(diagnosisResult);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  const handleNewAnalysis = useCallback(() => {
    handleClear();
  }, [handleClear]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <HeroSection />
              
              {/* Section Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Upload Your Image
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Upload a photo of your mango leaf and our AI will instantly identify 
                  diseases with treatment recommendations.
                </p>
              </motion.div>

              {/* Upload Zone */}
              <ImageUploadZone
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                previewUrl={previewUrl}
                onClear={handleClear}
                isAnalyzing={isAnalyzing}
              />

              {/* Analyze Button */}
              {selectedImage && !isAnalyzing && (
                <div className="flex justify-center">
                  <AnalyzeButton
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center"
                >
                  <p className="text-destructive font-medium">{error}</p>
                </motion.div>
              )}

              {/* Disease Grid */}
              <div className="pt-8 border-t border-border">
                <DiseaseGrid />
              </div>

              {/* Setup Guide Toggle */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowSetup(!showSetup)}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4" />
                  {showSetup ? 'Hide Setup Guide' : 'Show Python Backend Setup'}
                </Button>
              </div>

              {/* Setup Guide */}
              {showSetup && <SetupGuide />}
            </motion.div>
          ) : (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleNewAnalysis}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  New Analysis
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleNewAnalysis}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another
                </Button>
              </div>

              {/* Analyzed Image Preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-elevated"
                >
                  <img
                    src={previewUrl}
                    alt="Analyzed mango leaf"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Diagnosis Result */}
              <DiagnosisResultCard result={result} />

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-8"
              >
                <p className="text-sm text-muted-foreground">
                  Need more help? Consult with a local agricultural extension officer.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            MangoCare AI Disease Detection System • Built for Farmers, Researchers & Agronomists
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
