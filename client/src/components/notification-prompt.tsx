import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function NotificationPrompt() {
  const { user } = useAuth();
  const { isSupported, permission, requestPermission, sendNotification, subscribeToPush } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: { browserEnabled: boolean }) => {
      return apiRequest("/api/notification-preferences", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
    },
  });

  useEffect(() => {
    if (!user || !isSupported) return;

    const askedBefore = localStorage.getItem("notificationPromptShown");
    const permissionGranted = localStorage.getItem("notificationPermission");
    
    if (!askedBefore && permission === "default" && !permissionGranted) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }
  }, [user, isSupported, permission]);

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Persist the preference to the backend
      await updatePreferencesMutation.mutateAsync({ browserEnabled: true });
      
      // Subscribe to push notifications for background support
      await subscribeToPush();
      
      sendNotification("Notifications Enabled! ✨", {
        body: "You'll now receive spiritual reminders every 5 hours, even when the app is closed!",
        tag: "welcome-notification",
      });
    }
    localStorage.setItem("notificationPromptShown", "true");
    setIsVisible(false);
    setHasAsked(true);
  };

  const handleDismiss = () => {
    localStorage.setItem("notificationPromptShown", "true");
    setIsVisible(false);
    setHasAsked(true);
  };

  if (!isVisible || !user || !isSupported || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in">
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-2xl">
        <CardContent className="p-6 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
            data-testid="button-close-notification-prompt"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-2">
                Stay Connected to Your Journey 🌟
              </h3>
              <p className="text-white/90 text-sm mb-4">
                Get instant updates about your soul energy, aura insights, and spiritual progress!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleAllow}
                  className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
                  data-testid="button-allow-notifications"
                >
                  Enable Notifications
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  data-testid="button-dismiss-notifications"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
