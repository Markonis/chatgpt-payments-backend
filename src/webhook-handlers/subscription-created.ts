import * as admin from 'firebase-admin';
import { Offer, PurchaseStatus, Purchase } from '../types';

export async function handleSubscriptionCreated(data: any) {
  const productId = data.product_id;
  const customerId = data.customer_id;
  const orderId = data.order_id;

  // Load the offer based on the Lemon Squeezy product ID
  const offerRef = admin.firestore().collection('offers').where('productId', '==', productId);
  const offerSnapshot = await offerRef.get();

  if (offerSnapshot.empty) {
    throw new Error(`No offer found for product ID: ${productId}`);
  }

  const customData = data.meta.custom_data;
  const userId = customData.userId; // Extract userId from custom data
  const offerData = offerSnapshot.docs[0].data() as Offer;


  const purchaseDoc: Purchase = {
    customerId: customerId,
    userId: userId,
    orderId: orderId,
    offerId: offerSnapshot.docs[0].id,
    features: offerData.features,
    purchaseDate: Date.now(),
    status: PurchaseStatus.Active,
  };

  try {
    await admin.firestore().collection('purchases').doc(orderId.toString()).set(purchaseDoc);
    console.log(`Subscription for ${orderId} created/updated successfully.`);
  } catch (error) {
    throw new Error(`Error processing subscription created event: ${error}`);
  }
}
