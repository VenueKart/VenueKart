import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function TooltipProvider({ children, delayDuration = 200 }) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
