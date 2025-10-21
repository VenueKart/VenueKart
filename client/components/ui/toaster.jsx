import React from "react";
import { useToast } from "./use-toast";
import { AnimatePresence, motion } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white border rounded-lg shadow-lg p-4 max-w-sm ${
              toast.variant === 'destructive' ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            {toast.title && (
              <div className={`font-semibold text-sm mb-1 ${
                toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
              }`}>
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className={`text-sm ${
                toast.variant === 'destructive' ? 'text-red-700' : 'text-gray-600'
              }`}>
                {toast.description}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
