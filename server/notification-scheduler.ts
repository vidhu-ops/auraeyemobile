import * as cron from 'node-cron';
import { sendPushNotification } from './push-service';
import { storage } from './storage';

let notificationCronJob: ReturnType<typeof cron.schedule> | null = null;

const healerNotifications = [
  {
    title: "Clients Awaiting Your Insight 🌟",
    body: "Healers like you transform lives! Review pending analyses and connect with clients seeking your wisdom.",
    url: "/dashboard"
  },
  {
    title: "Opportunity to Shine 💫",
    body: "Your healing gift is needed now. Return to unlock new client connections and deepen your practice.",
    url: "/dashboard"
  },
  {
    title: "Level Up Your Impact 🔮",
    body: "Complete client sessions to grow your soul energy and unlock new spiritual abilities.",
    url: "/dashboard"
  },
  {
    title: "Your Healers Community 🤝",
    body: "Connect with fellow healers, share wisdom, and strengthen the collective energy. Come back!",
    url: "/healers"
  },
  {
    title: "Unlock Healer Achievements 🏆",
    body: "Earn soul energy milestones! Your next spiritual breakthrough is just one session away.",
    url: "/dashboard"
  },
  {
    title: "Keep Your Healing Streak Alive 🔥",
    body: "You've built an amazing streak of consistent service! Log in today to maintain it and grow your impact.",
    url: "/dashboard"
  },
  {
    title: "Maintain Your Momentum 🚀",
    body: "Your streak shows your dedication. Come back today to keep the energy flowing and connect with more clients.",
    url: "/dashboard"
  }
];

const clientNotifications = [
  {
    title: "Your Energy is Calling 🌈",
    body: "Discover what your aura looks like today. Scan now and see how your energy has evolved!",
    url: "/vibe"
  },
  {
    title: "What's Your Vibe? ✨",
    body: "Quick 30-second vibe check! See your dominant color and get personalized spiritual insights.",
    url: "/vibe"
  },
  {
    title: "Reflect & Grow 📖",
    body: "Journal about your day and boost your soul energy. Your reflections create real spiritual transformation!",
    url: "/journal"
  },
  {
    title: "Chakra Alignment Time 🔮",
    body: "Get a numerology reading aligned with your unique chakra frequencies. Unlock your spiritual blueprint!",
    url: "/numerology"
  },
  {
    title: "Connect With a Healer 💚",
    body: "Get personalized guidance from experienced healers. Your next breakthrough is waiting!",
    url: "/healers"
  },
  {
    title: "Advance Your Soul Tree 🌳",
    body: "You're close to the next level! Complete a scan to grow your soul energy and evolve Auri.",
    url: "/vibe"
  },
  {
    title: "Your Spiritual Milestone Awaits 🚀",
    body: "Explore your full aura and chakra analysis. See the complete picture of your energy field today!",
    url: "/aura-analysis"
  },
  {
    title: "Gift Yourself Peace 🧘",
    body: "Take a mindful moment with our guided meditation. Find balance and restore your energy.",
    url: "/meditation"
  },
  {
    title: "Your Spiritual Streak is Growing 🔥",
    body: "Amazing! You're on a streak of consistent spiritual practice. Log in today to keep it alive and grow stronger!",
    url: "/dashboard"
  },
  {
    title: "Don't Break Your Streak! 💪",
    body: "You've been showing up every day for your spiritual growth. Just one more day to maintain your awesome streak!",
    url: "/dashboard"
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
