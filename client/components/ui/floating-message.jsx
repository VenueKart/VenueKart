import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './button';

export function FloatingMessage({ isVisible, onClose, title, message, type = 'success' }) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    setShouldShow(isVisible);
    
    if (isVisible) {
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setShouldShow(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Floating Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              duration: 0.4 
            }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative border border-gray-100">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Success icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                <CheckCircle className={`h-8 w-8 ${
                  type === 'success' ? 'text-green-600' : 'text-blue-600'
                }`} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-3"
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 leading-relaxed mb-6"
              >
                {message}
              </motion.p>

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleClose}
                  className="bg-venue-indigo hover:bg-venue-purple text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Got it!
                </Button>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="absolute -top-4 -left-4 w-8 h-8 bg-venue-purple rounded-full"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="absolute -bottom-4 -right-4 w-6 h-6 bg-venue-indigo rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FloatingMessage;
