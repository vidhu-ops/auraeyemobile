import cron from 'node-cron';
import { sendPushToAllUsers } from './push-service';

let notificationCronJob: cron.ScheduledTask | null = null;

export function startNotificationScheduler() {
  // Stop existing cron job if running
  if (notificationCronJob) {
    notificationCronJob.stop();
  }

  // Schedule notifications every 5 hours (0 */5 * * *)
  // For testing, you can use: '*/30 * * * * *' for every 30 seconds
  // Or '*/5 * * * *' for every 5 minutes
  const cronExpression = '0 */5 * * *'; // Every 5 hours
  
  console.log('🔔 Starting notification scheduler...');
  console.log(`📅 Notifications will be sent every 5 hours`);
  
  notificationCronJob = cron.schedule(cronExpression, async () => {
    console.log('⏰ Scheduled notification time - sending push notifications...');
    try {
      const result = await sendPushToAllUsers();
      console.log(`✅ Scheduled notifications complete: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      console.error('❌ Error sending scheduled notifications:', error);
    }
  });

  console.log('✅ Notification scheduler initialized');
  
  return notificationCronJob;
}

export function stopNotificationScheduler() {
  if (notificationCronJob) {
    notificationCronJob.stop();
    notificationCronJob = null;
    console.log('🛑 Notification scheduler stopped');
  }
}
