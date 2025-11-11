import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const webPush = require('web-push');
import { storage } from './storage';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@auraeye.com';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('✅ Web Push configured with VAPID keys');
} else {
  console.warn('⚠️  VAPID keys not found. Push notifications will not work.');
}

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

export async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  title: string,
  body: string,
  url: string = '/'
) {
  try {
    const payload = JSON.stringify({
      title,
      body,
      url
    });

    await webPush.sendNotification(subscription, payload);
    return true;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // If the subscription is no longer valid (410 Gone), delete it
    if (error.statusCode === 410 && subscription.endpoint) {
      await storage.deletePushSubscription(subscription.endpoint);
      console.log('Deleted invalid push subscription');
    }
    
    return false;
  }
}

export async function sendPushToUser(userId: number) {
  try {
    const subscriptions = await storage.getPushSubscriptionsByUser(userId);
    
    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    // Pick a random reminder
    const reminder = spiritualReminders[Math.floor(Math.random() * spiritualReminders.length)];
    
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const pushSubscription: PushSubscriptionJSON = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      };

      const success = await sendPushNotification(
        pushSubscription,
        reminder.title,
        reminder.body,
        '/'
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error sending push to user:', error);
    return { sent: 0, failed: 0 };
  }
}

export async function sendPushToAllUsers() {
  try {
    const subscriptions = await storage.getAllPushSubscriptions();
    
    if (subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return { sent: 0, failed: 0 };
    }

    // Pick a random reminder
    const reminder = spiritualReminders[Math.floor(Math.random() * spiritualReminders.length)];
    
    let sent = 0;
    let failed = 0;

    console.log(`📤 Sending push notification to ${subscriptions.length} subscriptions...`);

    for (const sub of subscriptions) {
      const pushSubscription: PushSubscriptionJSON = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      };

      const success = await sendPushNotification(
        pushSubscription,
        reminder.title,
        reminder.body,
        '/'
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`✅ Push notifications sent: ${sent} successful, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('Error sending push to all users:', error);
    return { sent: 0, failed: 0 };
  }
}

export function getVapidPublicKey(): string | undefined {
  return vapidPublicKey;
}
