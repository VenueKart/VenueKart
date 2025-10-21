import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './button';

export function FloatingMessage({ isVisible, onClose, title, message, type = 'success' }) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    setShouldShow(isVisible);

    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setShouldShow(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    shouldShow && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          onClick={handleClose}
        />

        {/* Floating Message */}
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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

            {/* Icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                type === 'success' ? 'bg-green-100' : 'bg-blue-100'
              }`}
            >
              <CheckCircle
                className={`h-8 w-8 ${
                  type === 'success' ? 'text-green-600' : 'text-blue-600'
                }`}
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>

            {/* Message */}
            <p className="text-gray-600 leading-relaxed mb-6">{message}</p>

            {/* Action button */}
            <div>
              <Button
                onClick={handleClose}
                className="bg-venue-indigo hover:bg-venue-purple text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Got it!
              </Button>
            </div>

            {/* Decorative dots */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-venue-purple rounded-full opacity-10" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-venue-indigo rounded-full opacity-10" />
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default FloatingMessage;
