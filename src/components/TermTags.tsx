import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TermTagsProps {
  terminologies: string[];
  onDelete?: (term: string) => void;
}

export function TermTags({ terminologies, onDelete }: TermTagsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!terminologies || terminologies.length === 0) return null;

  const handleCopy = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(term);
    setCopiedTerm(term);
    toast.success(`Copied "${term}" to clipboard`);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  const handleDelete = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(term);
    }
  };

  return (
    <div 
      className="relative flex items-center h-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-full overflow-hidden border border-gray-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md"
          >
            <div className="px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-200">
              {terminologies[0]}
            </div>
            {terminologies.length > 1 && (
              <div className="px-2 py-1.5 bg-gray-50 dark:bg-neutral-800 border-l border-gray-100 dark:border-neutral-700 text-gray-500 dark:text-gray-400 text-xs font-medium">
                +{terminologies.length - 1}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-0 flex flex-col gap-1.5 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 min-w-max"
          >
            {terminologies.map((term) => (
              <div 
                key={term}
                className="group relative flex justify-between items-center bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-transparent hover:border-gray-200 dark:hover:border-neutral-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
                onClick={(e) => handleCopy(term, e)}
              >
                <span>{term}</span>
                <div className="hidden group-hover:flex items-center justify-center p-1.5 ml-3 -mr-1 rounded bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors" onClick={(e) => handleDelete(term, e)}>
                  <X className="w-3 h-3" />
                </div>
                {copiedTerm === term && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-md">
                    <Check className="w-4 h-4 mr-1.5" />
                    <span className="text-xs">Copied</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
