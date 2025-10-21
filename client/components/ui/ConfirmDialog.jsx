import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-venue-indigo text-venue-indigo hover:bg-venue-lavender"
            onClick={() => {
              onOpenChange?.(false);
              onCancel?.();
            }}
          >
            {cancelText}
          </Button>
          <Button
            className="bg-venue-indigo hover:bg-venue-purple text-white"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
