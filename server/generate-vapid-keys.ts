import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const webPush = require('web-push');

// Generate VAPID keys for web push notifications
const vapidKeys = webPush.generateVAPIDKeys();

console.log('='.repeat(60));
console.log('VAPID Keys Generated Successfully!');
console.log('='.repeat(60));
console.log('\nAdd these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:support@auraeye.com`);
console.log('\n' + '='.repeat(60));
console.log('Keep the private key secure and never commit it to git!');
console.log('='.repeat(60));
