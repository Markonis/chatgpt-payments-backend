import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import { handleOrderCreated } from './webhook-handlers/order-created';
import { handleOrderRefunded } from './webhook-handlers/order-refunded';
import { handleSubscriptionCreated } from './webhook-handlers/subscription-created';
import { handleSubscriptionUpdated } from './webhook-handlers/subscription-updated';


export const handleLemonSqueezyWebhook = functions.https.onRequest(async (request, response) => {
  // Verify Lemon Squeezy Signature for Security
  if (!verifyLemonSqueezySignature(request)) {
    response.status(403).send('Invalid signature');
    return;
  }

  const eventName = request.body.event_name;
  const eventData = request.body.data;

  switch (eventName) {
    case 'order_created':
      await handleOrderCreated(eventData);
      break;
    case 'order_refunded':
      await handleOrderRefunded(eventData);
      break;
    case 'subscription_created':
      await handleSubscriptionCreated(eventData);
      break;
    case 'subscription_updated':
      await handleSubscriptionUpdated(eventData);
      break;
    default:
      console.log(`Unhandled event name: ${eventName}`);
  }

  response.status(200).send('Webhook processed');
});




function verifyLemonSqueezySignature(request: functions.https.Request): boolean {
  const secret = functions.config().lemonsqueezy.secret;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(request.rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(request.get('X-Signature') || '', 'utf8');
  return crypto.timingSafeEqual(digest, signature);
}
