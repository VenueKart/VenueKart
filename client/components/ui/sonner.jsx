import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster(props) {
  return (
    <SonnerToaster position="top-right" richColors closeButton toastOptions={{ classNames: { toast: "rounded-lg shadow-lg", title: "font-medium", description: "text-sm" } }} {...props} />
  );
}
