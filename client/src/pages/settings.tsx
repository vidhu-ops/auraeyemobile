import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Settings as SettingsIcon, Check } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";

interface NotificationPreferences {
  browserEnabled: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    isEnabled,
    subscribeToPush,
    unsubscribeFromPush
  } = useNotifications();

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: { browserEnabled: boolean }) => {
      return apiRequest("POST", "/api/notification-preferences", data);
    },
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches to prevent them from overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/notification-preferences"] });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<NotificationPreferences>(["/api/notification-preferences"]);

      // Optimistically update to the new value, merging with existing data
      queryClient.setQueryData<NotificationPreferences>(["/api/notification-preferences"], (old) => ({
        ...old,
        ...newPreferences,
      }));

      // Return context with the snapshotted value (or default if cache is empty)
      return { previousPreferences: previousPreferences ?? { browserEnabled: false } };
    },
    onError: (err, newPreferences, context) => {
      // Rollback to the previous value on error
      if (context?.previousPreferences) {
        queryClient.setQueryData<NotificationPreferences>(["/api/notification-preferences"], context.previousPreferences);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
    },
  });

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Request permission if not granted
        if (permission !== "granted") {
          const granted = await requestPermission();
          if (!granted) {
            toast({
              title: "Permission Denied",
              description: "Please allow notifications in your browser settings to enable this feature.",
              variant: "destructive",
            });
            return;
          }
        }

        // Subscribe to push notifications
        const subscribed = await subscribeToPush();
        if (!subscribed) {
          toast({
            title: "Subscription Failed",
            description: "Unable to subscribe to push notifications. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Update preferences - only show success if this succeeds
        try {
          await updatePreferencesMutation.mutateAsync({ browserEnabled: true });
          
          // Show success toast
          toast({
            title: "Notifications Enabled! ✨",
            description: "You'll receive spiritual reminders every 5 hours.",
          });

          // Send immediate browser notification to confirm it's working
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Notifications Enabled! ✨', {
              body: 'You will receive spiritual reminders every 5 hours to help guide your journey.',
              icon: '/logo.png',
              badge: '/logo.png',
            });
          }
        } catch (error) {
          // Rollback: unsubscribe since we can't save the preference
          const rolledBack = await unsubscribeFromPush();
          
          if (!rolledBack) {
            toast({
              title: "Critical Error",
              description: "Failed to save settings and couldn't restore previous state. You may be subscribed to notifications. Please refresh the page and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Settings Update Failed",
              description: "Unable to save your notification preferences. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        // Unsubscribe from push notifications
        const unsubscribed = await unsubscribeFromPush();
        if (!unsubscribed) {
          toast({
            title: "Unsubscribe Failed",
            description: "Unable to unsubscribe from push notifications. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Update preferences - only show success if this succeeds
        try {
          await updatePreferencesMutation.mutateAsync({ browserEnabled: false });
          
          toast({
            title: "Notifications Disabled",
            description: "You won't receive any more push notifications.",
          });
        } catch (error) {
          // Rollback: re-subscribe since we can't save the preference
          const rolledBack = await subscribeToPush();
          
          if (!rolledBack) {
            toast({
              title: "Critical Error",
              description: "Failed to save settings and couldn't restore previous state. You may be unsubscribed from notifications. Please refresh the page and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Settings Update Failed",
              description: "Unable to save your notification preferences. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your notification preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPermissionBadge = () => {
    if (!isSupported) {
      return <Badge variant="secondary">Not Supported</Badge>;
    }
    
    switch (permission) {
      case "granted":
        return <Badge className="bg-green-500 text-white">Granted</Badge>;
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your notification preferences and app settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Push Notifications Card */}
          <Card className="border-purple-200/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>
                      Receive spiritual reminders and updates
                    </CardDescription>
                  </div>
                </div>
                {getPermissionBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSupported ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700">
                    Push notifications are not supported in your browser.
                  </p>
                </div>
              ) : (
                <>
                  {/* Main Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {preferences?.browserEnabled ? (
                        <Bell className="w-5 h-5 text-purple-600" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <Label htmlFor="notifications-toggle" className="text-base font-semibold cursor-pointer">
                          Enable Push Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Get reminders every 5 hours, even when the app is closed
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="notifications-toggle"
                      checked={preferences?.browserEnabled ?? false}
                      onCheckedChange={handleToggleNotifications}
                      disabled={isLoading || updatePreferencesMutation.isPending}
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  {/* Notification Details */}
                  <div className="space-y-3 pt-4 border-t border-purple-100">
                    <h3 className="font-semibold text-purple-700">What you'll receive:</h3>
                    <div className="space-y-2">
                      {[
                        "Breathing reminders to reconnect with your inner peace",
                        "Meditation prompts to recharge your spirit",
                        "Aura check-in notifications for energy awareness",
                        "Mindful moment reminders for spiritual growth"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Browser Permission Info */}
                  {permission === "denied" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        <strong>Permission Denied:</strong> You've blocked notifications for this site. 
                        Please enable them in your browser settings to receive push notifications.
                      </p>
                    </div>
                  )}

                  {permission === "default" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Permission Required:</strong> Enable the toggle above to request notification permission from your browser.
                      </p>
                    </div>
                  )}

                  {preferences?.browserEnabled && permission === "granted" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <strong>Active:</strong> You're all set! Push notifications are enabled and working.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Test Notification Button */}
          {isSupported && preferences?.browserEnabled && permission === "granted" && (
            <Card className="border-purple-200/50 shadow-lg">
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>
                  Send yourself a test notification to make sure everything is working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification('Test Notification ✨', {
                        body: 'Your push notifications are working perfectly!',
                        icon: '/logo.png',
                        badge: '/logo.png',
                      });
                      toast({
                        title: "Test Sent!",
                        description: "Check your notifications.",
                      });
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-test-notification"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
