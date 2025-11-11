import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Smartphone, Mail } from "lucide-react";
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
  const { permission, requestPermission } = useNotifications();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: !!user,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return apiRequest("/api/notification-preferences", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const handleBrowserNotifications = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const granted = await requestPermission();
      if (granted) {
        await updatePreferencesMutation.mutateAsync({ browserEnabled: true });
      }
    } else {
      await updatePreferencesMutation.mutateAsync({ browserEnabled: enabled });
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

    await updatePreferencesMutation.mutateAsync({
      smsEnabled: enabled,
      phoneNumber: phoneNumber || preferences?.phoneNumber,
    });
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <Label htmlFor="browser-notifications" className="text-base font-medium">
                  Browser Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get instant updates in your browser
                </p>
              </div>
            </div>
            <Switch
              id="browser-notifications"
              checked={preferences?.browserEnabled || false}
              onCheckedChange={handleBrowserNotifications}
              data-testid="switch-browser-notifications"
            />
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
                  <p className="text-sm text-muted-foreground">
                    Receive text messages on your phone
                  </p>
                </div>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences?.smsEnabled || false}
                onCheckedChange={handleSMSToggle}
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
              <p className="text-xs text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
                  Get updates via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences?.emailEnabled || false}
              onCheckedChange={(enabled) =>
                updatePreferencesMutation.mutate({ emailEnabled: enabled })
              }
              data-testid="switch-email-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Enable notifications to stay connected with your spiritual journey.
            Get updates about your soul energy, aura insights, and special messages from your healers!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
