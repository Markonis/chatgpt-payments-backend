import * as admin from 'firebase-admin';
admin.initializeApp();

export { handleLemonSqueezyWebhook } from './webhook-handler';
export { getActiveFeaturesForUser } from './get-active-features';

