import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ErrorDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      setTitle(detail.title || 'Something went wrong');
      setMessage(detail.message || 'Please try again.');
      setOpen(true);
    };
    window.addEventListener('app-error', handler);
    return () => window.removeEventListener('app-error', handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-venue-dark">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="bg-venue-indigo hover:bg-venue-purple text-white">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
