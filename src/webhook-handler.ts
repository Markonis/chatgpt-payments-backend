import * as crypto from 'crypto';
import * as functions from 'firebase-functions';
import { handleOrderCreated } from './webhook-handlers/order-created';
import { handleOrderRefunded } from './webhook-handlers/order-refunded';
import { handleSubscriptionUpdated } from './webhook-handlers/subscription-updated';

export const handleLemonSqueezyWebhook = functions.https.onRequest(async (req, res) => {
  // Verify Lemon Squeezy Signature for Security
  if (!verifyLemonSqueezySignature(req)) {
    res.sendStatus(403);
    return;
  }

  const eventName = req.body.event_name;
  const eventData = req.body.data;

  switch (eventName) {
    case 'order_created':
      await handleOrderCreated(eventData);
      break;
    case 'order_refunded':
      await handleOrderRefunded(eventData);
      break;
    case 'subscription_created':
      await handleOrderCreated(eventData);
      break;
    case 'subscription_updated':
      await handleSubscriptionUpdated(eventData);
      break;
    default:
      console.log(`Unhandled event name: ${eventName}`);
  }

  res.sendStatus(204);
});

function verifyLemonSqueezySignature(request: functions.https.Request): boolean {
  const secret = functions.config().lemonsqueezy.secret;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(request.rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(request.get('X-Signature') || '', 'utf8');
  return crypto.timingSafeEqual(digest, signature);
}
