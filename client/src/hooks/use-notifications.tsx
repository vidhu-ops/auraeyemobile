import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { useQuery } from "@tanstack/react-query";

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isEnabled: boolean;
}

interface NotificationPreferences {
  browserEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: !!user,
  });

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Periodic notification scheduler (every 5 hours)
  useEffect(() => {
    if (!user || !preferences?.browserEnabled || permission !== "granted") {
      return;
    }

    const FIVE_HOURS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    // For testing: const FIVE_HOURS = 30 * 1000; // 30 seconds

    const spiritualReminders = [
      {
        title: "Time to Breathe 🌬️",
        body: "Take a moment to breathe deeply and reconnect with your inner peace. Your soul energy awaits."
      },
      {
        title: "Meditation Reminder 🧘",
        body: "It's been 5 hours! Take a peaceful break and meditate for a few minutes to recharge your spirit."
      },
      {
        title: "Check Your Aura ✨",
        body: "Your energy field may have shifted. Take a moment to scan your aura and see how you're doing!"
      },
      {
        title: "Breathe & Center 💫",
        body: "Pause, breathe, and center yourself. Your spiritual journey needs these mindful moments."
      },
      {
        title: "Aura Check-In 🌈",
        body: "How is your energy today? Check your aura to see what colors are shining through!"
      },
      {
        title: "Mindful Moment 🕉️",
        body: "Take a 5-minute meditation break. Your mind and spirit will thank you!"
      }
    ];

    const sendRandomReminder = () => {
      const reminder = spiritualReminders[Math.floor(Math.random() * spiritualReminders.length)];
      
      try {
        new Notification(reminder.title, {
          body: reminder.body,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: "spiritual-reminder",
          requireInteraction: false,
        }).onclick = () => {
          window.focus();
        };
        
        // Store last notification time
        localStorage.setItem("lastNotificationTime", Date.now().toString());
      } catch (error) {
        console.error("Error sending periodic reminder:", error);
      }
    };

    // Check if we need to send a notification based on last notification time
    const lastNotificationTime = localStorage.getItem("lastNotificationTime");
    const now = Date.now();
    
    let nextNotificationDelay = FIVE_HOURS;
    
    if (lastNotificationTime) {
      const timeSinceLastNotification = now - parseInt(lastNotificationTime);
      if (timeSinceLastNotification < FIVE_HOURS) {
        // Schedule next notification for the remaining time
        nextNotificationDelay = FIVE_HOURS - timeSinceLastNotification;
      } else {
        // More than 5 hours have passed, send notification soon
        nextNotificationDelay = 1000; // 1 second
      }
    } else {
      // First time, set initial notification time and wait 5 hours
      localStorage.setItem("lastNotificationTime", now.toString());
    }

    // Single timeout that reschedules itself after firing
    let currentTimeoutId: NodeJS.Timeout;
    
    const scheduleNextReminder = (delay: number) => {
      currentTimeoutId = setTimeout(() => {
        sendRandomReminder();
        // Schedule the next one after another 5 hours
        scheduleNextReminder(FIVE_HOURS);
      }, delay);
    };

    // Start the scheduling
    scheduleNextReminder(nextNotificationDelay);

    return () => {
      clearTimeout(currentTimeoutId);
    };
  }, [user, preferences, permission]);

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
        isEnabled: preferences?.browserEnabled || false
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
