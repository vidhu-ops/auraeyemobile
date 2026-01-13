import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone || localStorage.getItem("appInstalled") === "true") {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const promptDismissedAt = localStorage.getItem("installPromptDismissedAt");
    
    if (promptDismissedAt) {
      const dismissedTime = parseInt(promptDismissedAt, 10);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (dismissedTime > oneDayAgo) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("appInstalled", "true");
      }
      
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("installPromptDismissedAt", Date.now().toString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="w-[90vw] max-w-md mx-auto bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
          data-testid="button-close-install-prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-white">
            Download AuraEye App
          </DialogTitle>
          
          <DialogDescription className="text-purple-200 text-sm">
            Get the full experience! Install AuraEye on your device for quick access to aura readings, meditations, and spiritual guidance.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {isIOS ? (
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-white text-sm font-medium mb-3">
                To install on iPhone/iPad:
              </p>
              <div className="space-y-2 text-purple-200 text-xs">
                <p>1. Tap the <span className="font-bold">Share</span> button in Safari</p>
                <p>2. Scroll and tap <span className="font-bold">"Add to Home Screen"</span></p>
                <p>3. Tap <span className="font-bold">"Add"</span> to confirm</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02]"
              data-testid="button-install-app"
            >
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          )}

          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="w-full text-purple-300 hover:text-white hover:bg-white/10 rounded-xl"
            data-testid="button-maybe-later"
          >
            Maybe Later
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-purple-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Free • No storage space needed • Works offline</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
