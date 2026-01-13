import { useState, useEffect } from "react";
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

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone || localStorage.getItem("appInstalled") === "true") {
      setIsInstalled(true);
      return;
    }

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
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Force show for development/testing if not in standalone mode
    if (!isStandalone && !promptDismissedAt) {
      setShowPrompt(true);
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIOSDevice && !isStandalone) {
      setShowPrompt(true);
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
    } else {
      // Logic for iOS or others where native prompt isn't available
      alert("To install: Tap the Share button in Safari, then 'Add to Home Screen'.");
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
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 flex items-center justify-between shadow-md sticky top-0 z-[100] w-full">
      <div className="flex items-center gap-2 overflow-hidden">
        <Smartphone className="h-4 w-4 flex-shrink-0" />
        <span className="text-[10px] sm:text-xs font-medium truncate">
          Download AuraEye App for the best experience
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Button 
          onClick={handleInstall}
          size="sm" 
          className="bg-white text-purple-600 hover:bg-white/90 font-bold h-7 text-[10px] rounded-full px-3"
        >
          Download Now
        </Button>
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
