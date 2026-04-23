import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TermTags } from './TermTags';
import { Loader2, Trash2 } from 'lucide-react';

export interface ImageData {
  id: number;
  url: string;
  terminologies: string[];
}

interface PolaroidCardProps {
  data: ImageData;
  isLoading?: boolean;
  onDeleteTerm?: (id: number, term: string) => void;
  onDeleteImage?: (id: number) => void;
}

export function PolaroidCard({ data, isLoading, onDeleteTerm, onDeleteImage }: PolaroidCardProps) {
  // Randomize styling properties on mount
  const decoration = useMemo(() => {
    const types = ['tape-pink', 'tape-purple', 'tape-blue', 'tape-green', 'tape-yellow', 'pin'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const rotation = useMemo(() => {
    // Subtle rotation like screenshot
    return Math.random() * 4 - 2; // -2 to 2 degrees
  }, []);

  const tapeRotation = useMemo(() => {
    return Math.random() * 8 - 4; // -4 to 4 degrees
  }, []);

  const tapeClass = useMemo(() => {
    switch (decoration) {
      case 'tape-pink': return 'bg-washi-red';
      case 'tape-purple': return 'bg-washi-purple';
      case 'tape-blue': return 'bg-washi-blue';
      case 'tape-green': return 'bg-washi-green';
      case 'tape-yellow': return 'bg-washi-yellow';
      default: return 'bg-washi-blue';
    }
  }, [decoration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      className="relative flex flex-col items-center w-full"
    >
      {/* The Polaroid */}
      <div 
        className="relative bg-white dark:bg-[#202020] p-1.5 pb-6 rounded-sm shadow-sm border border-gray-200/60 dark:border-[#333] group max-w-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Decoration */}
        {decoration.startsWith('tape') ? (
          <div 
            className={`absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 shadow-sm z-10 opacity-90 mix-blend-multiply ${tapeClass}`}
             style={{ transform: `rotate(${tapeRotation}deg) translateX(-50%)` }}
          />
        ) : (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-md z-10 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-200/80"></div>
          </div>
        )}
        
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-gray-50 dark:bg-black/50 overflow-hidden border border-gray-100 dark:border-white/5 pt-2 px-1">
          <img 
            src={data.url} 
            alt="Design Inspiration" 
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          )}
        </div>
        
        {/* Delete Image Button - visible on hover */}
        <button
           onClick={() => onDeleteImage?.(data.id)}
           className="absolute -top-2 -right-2 p-1 bg-white dark:bg-neutral-800 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm border border-gray-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/40"
           title="Delete image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Terminologies overlaid on top-right corner of polaroid */}
        {!isLoading && data.terminologies && data.terminologies.length > 0 && (
          <div className="absolute top-4 -right-4 z-20">
             <TermTags 
               terminologies={data.terminologies} 
               onDelete={(term) => onDeleteTerm?.(data.id, term)} 
             />
          </div>
        )}

      </div>

    </motion.div>
  );
}
