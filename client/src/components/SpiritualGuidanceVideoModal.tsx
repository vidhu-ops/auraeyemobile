import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import spiritualVideoPath from '@assets/WhatsApp Video 2025-08-11 at 3.45.29 AM_1755201271313.mp4';

interface SpiritualGuidanceVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpiritualGuidanceVideoModal({ isOpen, onClose }: SpiritualGuidanceVideoModalProps) {
  const [showPostVideoOptions, setShowPostVideoOptions] = useState(false);
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Reset video to start when modal opens
      videoRef.current.currentTime = 0;
      setShowPostVideoOptions(false);
    }
  }, [isOpen]);

  const handleVideoEnded = () => {
    setShowPostVideoOptions(true);
  };

  const handleScanAuraAgain = () => {
    navigate('/');
    onClose();
    // Scroll to vibe check section after navigation
    setTimeout(() => {
      document.getElementById('vibe-check-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGoHome = () => {
    navigate('/');
    onClose();
  };

  const handleClose = () => {
    setShowPostVideoOptions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white mb-2">
            🔮 Spiritual Guidance Video
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <p className="text-purple-200">
              Let the universe guide you through this spiritual journey
            </p>
          </div>

          <div className="w-full max-w-2xl bg-black/20 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              controls
              onEnded={handleVideoEnded}
              poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTEwZTI0Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNjAiIGZpbGw9IiM4YjVjZjYiLz4KPHN2ZyB4PSIzNzAiIHk9IjE5NSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+PHBhdGggZD0iTTggNWwxMSA3LTExIDd2LTE0eiIvPjwvcD4KPC9zdmc+Cjx0ZXh0IHg9IjQwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGI1Y2Y2IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4Ij5DbGljayB0byBwbGF5IHNwaXJpdHVhbCBndWlkYW5jZSB2aWRlbzwvdGV4dD4KPC9zdmc+"
            >
              <source src={spiritualVideoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {showPostVideoOptions && (
            <div className="text-center space-y-4 animate-fade-in">
              <h3 className="text-xl font-semibold text-white">
                ✨ Would you like to scan your aura again?
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleScanAuraAgain}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105"
                >
                  🔮 Yes, Scan My Aura
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="border-purple-400 text-purple-300 hover:bg-purple-800/20 px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105"
                >
                  🏠 No, Go Home
                </Button>
              </div>
            </div>
          )}

          {!showPostVideoOptions && (
            <div className="text-center text-purple-200 text-sm">
              Watch the complete video to unlock your next spiritual step
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}