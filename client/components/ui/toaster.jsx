import React from "react";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
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
        </div>
      ))}
    </div>
  );
}
