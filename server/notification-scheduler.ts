import * as cron from 'node-cron';
import { sendPushNotification } from './push-service';
import { storage } from './storage';

let notificationCronJob: ReturnType<typeof cron.schedule> | null = null;

const healerNotifications = [
  {
    title: "New Client Check-Ins Available 🌟",
    body: "Log in to review energy readings and provide spiritual guidance to your clients.",
    url: "/dashboard"
  },
  {
    title: "Time to Connect 💫",
    body: "Your healing presence is needed. Check for new client requests and aura analyses.",
    url: "/dashboard"
  },
  {
    title: "Healer Reminder 🔮",
    body: "Take a moment to review pending client analyses and share your spiritual insights.",
    url: "/dashboard"
  }
];

const clientNotifications = [
  {
    title: "Breathe & Ground 🌬️",
    body: "Take a moment to breathe deeply and check your energy levels. Your aura awaits!",
    url: "/scan"
  },
  {
    title: "Energy Check-In Time ✨",
    body: "How is your spiritual energy today? Log your vibe and track your soul journey.",
    url: "/vibe"
  },
  {
    title: "Mindful Moment 🧘",
    body: "Pause and reconnect with your inner self. Take a meditation break now.",
    url: "/meditate"
  },
  {
    title: "Aura Scan Reminder 🌈",
    body: "Your energy field may have shifted. Scan your aura to see your colors today!",
    url: "/scan"
  }
];

export async function sendBiHourlyReminders() {
  try {
    console.log('⏰ Starting bi-hourly notification broadcast...');
    
    // Get all push subscriptions with user information
    const allSubscriptions = await storage.getAllPushSubscriptions();
    
    if (allSubscriptions.length === 0) {
      console.log('📭 No push subscriptions found');
      return { sent: 0, failed: 0 };
    }

    let totalSent = 0;
    let totalFailed = 0;
    
    // Group subscriptions by user to avoid duplicates
    const userSubscriptions = new Map<number, typeof allSubscriptions>();
    
    for (const sub of allSubscriptions) {
      if (!userSubscriptions.has(sub.userId)) {
        userSubscriptions.set(sub.userId, []);
      }
      userSubscriptions.get(sub.userId)!.push(sub);
    }

    console.log(`📤 Sending notifications to ${userSubscriptions.size} users...`);

    // Send notifications to each user based on their role
    for (const [userId, subs] of Array.from(userSubscriptions.entries())) {
      try {
        // Get user information to determine role
        const user = await storage.getUser(userId);
        
        if (!user) {
          console.log(`⚠️ User ${userId} not found, cleaning up orphaned subscriptions...`);
          
          // Delete all orphaned subscriptions for this missing user
          for (const sub of subs) {
            try {
              await storage.deletePushSubscription(sub.endpoint);
              console.log(`🗑️ Removed orphaned subscription for missing user ${userId}: ${sub.endpoint}`);
            } catch (cleanupError) {
              console.error(`Error cleaning up orphaned subscription ${sub.endpoint}:`, cleanupError);
            }
          }
          continue;
        }

        // Check if user has browser notifications enabled
        if (!user.browserNotificationsEnabled) {
          console.log(`🔕 User ${user.username} has notifications disabled, skipping...`);
          continue;
        }

        // Select appropriate notification based on user type
        const notifications = user.userType === 'healer' ? healerNotifications : clientNotifications;
        const notification = notifications[Math.floor(Math.random() * notifications.length)];

        // Send to all devices for this user with error isolation
        let userSent = 0;
        let userFailed = 0;

        for (const sub of subs) {
          try {
            const pushSubscription: PushSubscriptionJSON = {
              endpoint: sub.endpoint,
              keys: JSON.parse(sub.keys)
            };

            // sendPushNotification already handles 410 cleanup internally
            const success = await sendPushNotification(
              pushSubscription,
              notification.title,
              notification.body,
              notification.url
            );

            if (success) {
              userSent++;
            } else {
              userFailed++;
              // Don't delete here - sendPushNotification already handles 410 cleanup
              // Other failures (network issues, etc.) are transient and shouldn't delete subscriptions
            }
          } catch (subError: any) {
            console.error(`Error sending to subscription ${sub.endpoint}:`, subError);
            userFailed++;
            // Don't delete on catch - sendPushNotification handles cleanup internally
          }
        }

        totalSent += userSent;
        totalFailed += userFailed;

        if (userSent > 0) {
          console.log(`✅ Sent notification to ${user.userType}: ${user.username} (${userSent} devices)`);
        }
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        totalFailed += subs.length;
      }
    }

    console.log(`✅ Bi-hourly notifications complete: ${totalSent} sent, ${totalFailed} failed`);
    return { sent: totalSent, failed: totalFailed };
  } catch (error) {
    console.error('❌ Error in sendBiHourlyReminders:', error);
    return { sent: 0, failed: 0 };
  }
}

export function startNotificationScheduler() {
  // Stop existing cron job if running
  if (notificationCronJob) {
    notificationCronJob.stop();
  }

  // Schedule notifications every 2 hours (0 */2 * * *)
  // For testing, you can use: '*/30 * * * * *' for every 30 seconds
  // Or '*/5 * * * *' for every 5 minutes
  const cronExpression = '0 */2 * * *'; // Every 2 hours
  
  console.log('🔔 Starting bi-hourly notification scheduler...');
  console.log(`📅 Notifications will be sent every 2 hours to healers and clients`);
  
  notificationCronJob = cron.schedule(cronExpression, async () => {
    console.log('⏰ Bi-hourly notification time - sending role-based push notifications...');
    try {
      const result = await sendBiHourlyReminders();
      console.log(`✅ Bi-hourly notifications complete: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      console.error('❌ Error sending bi-hourly notifications:', error);
    }
  });

  console.log('✅ Bi-hourly notification scheduler initialized');
  
  return notificationCronJob;
}

export function stopNotificationScheduler() {
  if (notificationCronJob) {
    notificationCronJob.stop();
    notificationCronJob = null;
    console.log('🛑 Notification scheduler stopped');
  }
}
