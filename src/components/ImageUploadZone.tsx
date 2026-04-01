import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  previewUrl: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onImageSelect,
  selectedImage,
  previewUrl,
  onClear,
  isAnalyzing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              upload-zone flex flex-col items-center justify-center
              w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer
              transition-all duration-300 ease-out
              ${isDragOver 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border hover:border-primary/40 hover:bg-muted/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <motion.div
              animate={{ y: isDragOver ? -5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-4 p-8"
            >
              <div className={`
                p-4 rounded-2xl transition-colors duration-300
                ${isDragOver ? 'bg-primary/10' : 'bg-muted'}
              `}>
                <Upload className={`
                  w-10 h-10 transition-colors duration-300
                  ${isDragOver ? 'text-primary' : 'text-muted-foreground'}
                `} />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragOver ? 'Drop your image here' : 'Upload mango leaf image'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            </motion.div>
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-80 rounded-2xl overflow-hidden shadow-elevated"
          >
            <img
              src={previewUrl}
              alt="Selected mango leaf"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* File info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate max-w-[200px]">
                  {selectedImage?.name}
                </p>
                <p className="text-xs text-white/70">
                  {selectedImage && (selectedImage.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            {/* Clear button */}
            {!isAnalyzing && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClear}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full
                           hover:bg-white/30 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}
            
            {/* Analyzing overlay */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white font-medium">Analyzing...</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageUploadZone;
