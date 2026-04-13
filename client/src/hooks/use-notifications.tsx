import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  showInAppNotification: (title: string, message: string) => void;
  isEnabled: boolean;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

interface NotificationPreferences {
  browserEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: !!user,
  });

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Register service worker for Push API
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = async (): Promise<boolean> => {
    console.log('🔔 Starting push subscription process...');
    
    if (!swRegistration) {
      console.error('❌ Service worker not registered');
      return false;
    }
    
    if (!user) {
      console.error('❌ User not authenticated');
      return false;
    }

    try {
      console.log('📡 Fetching VAPID public key...');
      // Get VAPID public key from server
      const response = await apiRequest("GET", "/api/push/vapid-public-key");
      
      if (!response.ok) {
        console.error(`❌ Failed to get VAPID key: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const data = await response.json();
      const { publicKey } = data;
      
      console.log('🔑 VAPID key received:', publicKey ? 'Yes' : 'No');
      
      if (!publicKey) {
        console.error('❌ No VAPID public key available');
        return false;
      }

      console.log('🔐 Subscribing to push manager...');
      // Check if already subscribed on this device
      let existingSubscription = await swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('📱 Device already has an active subscription');
        // Check if we need to update it on the server (multi-device support)
        const p256dhKey = existingSubscription.getKey('p256dh');
        const authKey = existingSubscription.getKey('auth');
        if (p256dhKey && authKey) {
          try {
            await apiRequest("POST", "/api/push/subscribe", {
              endpoint: existingSubscription.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(p256dhKey),
                auth: arrayBufferToBase64(authKey)
              }
            });
            console.log('✅ Existing subscription confirmed with server');
            return true;
          } catch (error) {
            console.warn('⚠️ Could not confirm existing subscription:', error);
          }
        }
      }

      // Create new subscription
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log('📮 New subscription created:', subscription.endpoint.substring(0, 50) + '...');

      console.log('💾 Saving subscription to server...');
      // Send subscription to server
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      
      if (!p256dh || !auth) {
        console.error('❌ Failed to get subscription keys');
        return false;
      }

      const saveResponse = await apiRequest("POST", "/api/push/subscribe", {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dh),
          auth: arrayBufferToBase64(auth)
        }
      });

      if (!saveResponse.ok) {
        console.error(`❌ Failed to save subscription: ${saveResponse.status}`);
        return false;
      }

      const saveData = await saveResponse.json();
      console.log('✅ Server response:', saveData);

      console.log('✅ Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!swRegistration) {
      console.error('Service worker not registered');
      return false;
    }

    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();
        
        // Tell server to remove subscription
        await apiRequest("POST", "/api/push/unsubscribe", {
          endpoint: subscription.endpoint
        });
      }

      console.log('✅ Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log("Notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        // Store permission status
        localStorage.setItem("notificationPermission", "granted");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    // Check if notifications are enabled in preferences
    if (!preferences?.browserEnabled) {
      console.log("Browser notifications are disabled in preferences");
      return;
    }

    if (!isSupported || permission !== "granted") {
      console.log("Cannot send notification: permission not granted");
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: "/logo.png",
        badge: "/logo.png",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const showInAppNotification = (title: string, message: string) => {
    window.dispatchEvent(new CustomEvent("app-notification", { detail: { title, message } }));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        isSupported, 
        permission, 
        requestPermission, 
        sendNotification,
        showInAppNotification,
        isEnabled: preferences?.browserEnabled || false,
        subscribeToPush,
        unsubscribeFromPush
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Helper functions for converting between formats
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
