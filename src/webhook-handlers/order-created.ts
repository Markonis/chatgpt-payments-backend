import * as admin from 'firebase-admin';
import { Offer, Purchase, PurchaseStatus } from '../types';


export async function handleOrderCreated(data: any) {
  const productId = data.product_id;

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
    customerId: data.customer_id,
    userId: userId,
    orderId: data.order_id,
    offerId: offerSnapshot.docs[0].id,
    features: offerData.features,
    purchaseDate: Date.now(), // Current time in Unix milliseconds
    status: PurchaseStatus.Active,
  };

  try {
    await admin.firestore().collection('purchases').doc(data.order_id.toString()).set(purchaseDoc);
    console.log(`Purchase for order ${data.order_id} created/updated successfully.`);
  } catch (error) {
    throw new Error(`Error processing order created event: ${error}`);
  }
}
