import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner && !showSettings) return null;

  return (
    <AnimatePresence>
      {showBanner && !showSettings && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
        >
          <Card className="max-w-4xl mx-auto glass shadow-2xl border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Cookie className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">We value your privacy</h3>
                  <p className="text-white/70 text-sm">
                    We use cookies to enhance your spiritual journey, analyze site traffic, and personalize your experience. 
                    Choose your preferences below.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                    Settings
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/80" onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="glass border-primary/20 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5 text-primary" />
                  Cookie Settings
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Essential Cookies</Label>
                      <p className="text-xs text-white/50">Required for basic site functionality.</p>
                    </div>
                    <Switch checked={preferences.essential} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Functional Cookies</Label>
                      <p className="text-xs text-white/50">Enable personalized features like your mascot settings.</p>
                    </div>
                    <Switch 
                      checked={preferences.functional} 
                      onCheckedChange={(val) => setPreferences(p => ({ ...p, functional: val }))} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Analytics Cookies</Label>
                      <p className="text-xs text-white/50">Help us understand how users interact with our spiritual tools.</p>
                    </div>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(val) => setPreferences(p => ({ ...p, analytics: val }))} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Marketing Cookies</Label>
                      <p className="text-xs text-white/50">Used to provide relevant spiritual content and offers.</p>
                    </div>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(val) => setPreferences(p => ({ ...p, marketing: val }))} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 p-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
                <Button className="bg-primary hover:bg-primary/80" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
