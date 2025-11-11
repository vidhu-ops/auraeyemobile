import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
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
    if (!swRegistration || !user) {
      console.error('Service worker not registered or user not authenticated');
      return false;
    }

    try {
      // Get VAPID public key from server
      const response = await apiRequest("GET", "/api/push/vapid-public-key");
      const { publicKey } = await response.json();
      
      if (!publicKey) {
        console.error('No VAPID public key available');
        return false;
      }

      // Subscribe to push notifications
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      await apiRequest("POST", "/api/push/subscribe", {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      });

      console.log('✅ Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
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

  return (
    <NotificationContext.Provider 
      value={{ 
        isSupported, 
        permission, 
        requestPermission, 
        sendNotification,
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
