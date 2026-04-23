import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PolaroidCard, ImageData } from './PolaroidCard';

interface DayDropZoneProps {
  dayName: string;
  dayDate: string | number;
  dayIndex: number;
  images: ImageData[];
  onUpload: (file: File, dayIndex: number) => void;
  onDeleteTerm: (id: number, term: string) => void;
  onDeleteImage: (id: number) => void;
  isUploading?: boolean;
}

export function DayDropZone({ dayName, dayDate, dayIndex, images, onUpload, onDeleteTerm, onDeleteImage, isUploading }: DayDropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0], dayIndex);
    }
  }, [dayIndex, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: false
  } as any);

  return (
    <div 
      {...getRootProps()}
      className={`relative flex flex-col min-h-[300px] p-4 pt-0 transition-colors
        ${isDragActive ? 'bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700' : 'bg-transparent'}
      `}
    >
      <input {...getInputProps()} />
      
      {/* Day Header */}
      <div className="flex flex-col items-center justify-center mb-6 pt-4 group">
        <h3 className="font-sans text-3xl font-light text-neutral-600 dark:text-neutral-300 select-none">
          {dayDate}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-400 dark:text-neutral-500 mt-1 select-none">
          {dayName}
        </span>
      </div>

      {/* Images Container */}
      <div className="flex-1 flex flex-row flex-wrap gap-4 relative z-10 w-full items-start justify-center">
        <AnimatePresence>
          {images.map((img) => (
            <div key={img.id} className="w-[45%] min-w-[120px] max-w-[200px] flex-grow">
                <PolaroidCard 
                    data={img} 
                    onDeleteTerm={onDeleteTerm} 
                    onDeleteImage={onDeleteImage}
                />
            </div>
          ))}
          {/* Optimistic upload placeholder */}
          {isUploading && (
             <div key={`uploading-${dayIndex}`} className="w-[45%] min-w-[120px] max-w-[200px] flex-grow">
                 <PolaroidCard 
                    data={{id: 0, url: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', terminologies: []}} 
                    isLoading={true} 
                 />
             </div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State / Drag Overlay */}
      {images.length === 0 && !isUploading && (
        <div className="absolute inset-0 top-20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-neutral-400 dark:text-neutral-600">
            <Upload className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs uppercase tracking-wider font-semibold opacity-50">Drop images</span>
        </div>
      )}
      
       {/* Drag active overlay */}
       <AnimatePresence>
         {isDragActive && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl z-20 flex items-center justify-center border-2 border-dashed border-blue-400"
           >
             <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider shadow-sm">
               Drop here
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
