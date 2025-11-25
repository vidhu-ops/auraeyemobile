import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Smartphone, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NotificationPreferences {
  smsEnabled: boolean;
  phoneNumber: string;
  browserEnabled: boolean;
  emailEnabled: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { permission, requestPermission, subscribeToPush, unsubscribeFromPush } = useNotifications();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [browserToggling, setBrowserToggling] = useState(false);
  const [smsToggling, setSmsToggling] = useState(false);
  const [emailToggling, setEmailToggling] = useState(false);

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: !!user,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return apiRequest("POST", "/api/notification-preferences", data);
    },
    onMutate: async (newPreferences) => {
      await queryClient.cancelQueries({ queryKey: ["/api/notification-preferences"] });
      
      const previousPreferences = queryClient.getQueryData<NotificationPreferences>(["/api/notification-preferences"]);
      
      queryClient.setQueryData<NotificationPreferences>(["/api/notification-preferences"], (old) => ({
        ...old,
        ...newPreferences,
        smsEnabled: newPreferences.smsEnabled ?? old?.smsEnabled ?? false,
        phoneNumber: newPreferences.phoneNumber ?? old?.phoneNumber ?? "",
        browserEnabled: newPreferences.browserEnabled ?? old?.browserEnabled ?? false,
        emailEnabled: newPreferences.emailEnabled ?? old?.emailEnabled ?? false,
      }));
      
      return { previousPreferences };
    },
    onError: (err, newPreferences, context) => {
      queryClient.setQueryData(["/api/notification-preferences"], context?.previousPreferences);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
    },
  });

  const handleBrowserNotifications = async (enabled: boolean) => {
    setBrowserToggling(true);
    try {
      if (enabled) {
        if (permission !== "granted") {
          const granted = await requestPermission();
          if (!granted) {
            toast({
              title: "Permission Denied",
              description: "Please allow notifications in your browser settings.",
              variant: "destructive",
            });
            setBrowserToggling(false);
            return;
          }
        }

        const subscribed = await subscribeToPush();
        if (!subscribed) {
          toast({
            title: "Subscription Failed",
            description: "Unable to subscribe to push notifications. Please try again.",
            variant: "destructive",
          });
          setBrowserToggling(false);
          return;
        }

        try {
          await updatePreferencesMutation.mutateAsync({ browserEnabled: true });
        } catch (error) {
          await unsubscribeFromPush();
          toast({
            title: "Settings Update Failed",
            description: "Unable to save your notification preferences. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const unsubscribed = await unsubscribeFromPush();
        if (!unsubscribed) {
          toast({
            title: "Unsubscribe Failed",
            description: "Unable to unsubscribe from push notifications. Please try again.",
            variant: "destructive",
          });
          setBrowserToggling(false);
          return;
        }

        try {
          await updatePreferencesMutation.mutateAsync({ browserEnabled: false });
        } catch (error) {
          await subscribeToPush();
          toast({
            title: "Settings Update Failed",
            description: "Unable to save your notification preferences. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your notification preferences.",
        variant: "destructive",
      });
    } finally {
      setBrowserToggling(false);
    }
  };

  const handleSMSToggle = async (enabled: boolean) => {
    if (enabled && !phoneNumber && !preferences?.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }

    setSmsToggling(true);
    try {
      await updatePreferencesMutation.mutateAsync({
        smsEnabled: enabled,
        phoneNumber: phoneNumber || preferences?.phoneNumber,
      });
    } finally {
      setSmsToggling(false);
    }
  };

  const handleEmailToggle = async (enabled: boolean) => {
    setEmailToggling(true);
    try {
      await updatePreferencesMutation.mutateAsync({ emailEnabled: enabled });
    } finally {
      setEmailToggling(false);
    }
  };

  const handlePhoneNumberSave = async () => {
    if (!phoneNumber) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    await updatePreferencesMutation.mutateAsync({
      phoneNumber,
      smsEnabled: true,
    });
  };

  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/push/test");
    },
    onSuccess: () => {
      toast({
        title: "Test Notification Sent! ✨",
        description: "Check your device for the notification. It may take a few seconds.",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Make sure browser notifications are enabled and you've granted permission.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive updates about your spiritual journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label htmlFor="browser-notifications" className="text-base font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-white">
                    Get instant updates in your browser
                  </p>
                </div>
              </div>
              <Switch
                id="browser-notifications"
                checked={preferences?.browserEnabled || false}
                onCheckedChange={handleBrowserNotifications}
                disabled={browserToggling}
                data-testid="switch-browser-notifications"
              />
            </div>
            
            {/* Test Notification Button */}
            {preferences?.browserEnabled && (
              <div className="ml-13 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testNotificationMutation.mutate()}
                  disabled={testNotificationMutation.isPending}
                  className="w-full sm:w-auto"
                  data-testid="button-test-notification"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {testNotificationMutation.isPending ? "Sending..." : "Send Test Notification"}
                </Button>
                <p className="text-xs text-white">
                  Test your notification settings - you should receive a notification within seconds
                </p>
              </div>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <Label htmlFor="sms-notifications" className="text-base font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-white">
                    Receive text messages on your phone
                  </p>
                </div>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences?.smsEnabled || false}
                onCheckedChange={handleSMSToggle}
                disabled={smsToggling}
                data-testid="switch-sms-notifications"
              />
            </div>

            {/* Phone Number Input */}
            <div className="ml-13 space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber || preferences?.phoneNumber || ""}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone-number"
                />
                <Button
                  onClick={handlePhoneNumberSave}
                  disabled={updatePreferencesMutation.isPending}
                  data-testid="button-save-phone"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-white">
                Include country code (e.g., +1 for US)
              </p>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-white">
                  Get updates via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences?.emailEnabled || false}
              onCheckedChange={handleEmailToggle}
              disabled={emailToggling}
              data-testid="switch-email-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <p className="text-sm text-white">
            
            
            What you'll receive:
            

        
          </p>
          <p className="text-sm text-white">


            Meditation prompts to recharge your spirit

            Aura check-in notifications for energy awareness

            Mindful moment reminders for spiritual growth

            Personalized insights and tips for your journey


          </p>
          <p className="text-sm text-white">
            💡 <strong>Tip:</strong> Enable notifications to stay connected with your spiritual journey.
            Get updates about your soul energy, aura insights, and special messages from your healers!

            

          </p>
        </CardContent>
      </Card>
    </div>
  );
}
