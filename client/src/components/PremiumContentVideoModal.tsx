import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import premiumVideoPath from '@assets/WhatsApp Video 2025-08-14 at 4.09.26 PM_1755168069793.mp4';

interface PremiumContentVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumContentVideoModal({ isOpen, onClose }: PremiumContentVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Reset video to start when modal opens and autoplay
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.log('Auto-play was prevented:', error);
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-6 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white mb-2">
            🔒 Premium Content Preview
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <p className="text-purple-200">
              Get a glimpse of our detailed aura and chakra analysis reports
            </p>
          </div>

          <div className="w-full max-w-2xl bg-black/20 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTEwZTI0Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNjAiIGZpbGw9IiM4YjVjZjYiLz4KPHN2ZyB4PSIzNzAiIHk9IjE5NSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+PHBhdGggZD0iTTggNWwxMSA3LTExIDd2LTE0eiIvPjwvcD4KPC9zdmc+Cjx0ZXh0IHg9IjQwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGI1Y2Y2IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4Ij5DbGljayB0byBwbGF5IHByZW1pdW0gY29udGVudCBwcmV2aWV3PC90ZXh0Pgo8L3N2Zz4="
            >
              <source src={premiumVideoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="text-center space-y-4">
            <p className="text-purple-200 text-sm">
              This video showcases just a small part of our comprehensive premium reports
            </p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-purple-400 text-purple-300 hover:bg-purple-800/20 px-8 py-3 rounded-lg font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}