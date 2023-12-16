import * as admin from 'firebase-admin';
import { PurchaseStatus } from '../types';

export async function handleOrderRefunded(data: any) {
  const orderId = data.order_id;

  // Retrieve the corresponding purchase document
  const purchaseRef = admin.firestore().collection('purchases').doc(orderId.toString());
  const purchaseSnapshot = await purchaseRef.get();

  if (!purchaseSnapshot.exists) {
    throw new Error(`No purchase found for order ID: ${orderId}`);
  }

  try {
    // Update the status of the purchase to 'refunded'
    await purchaseRef.update({ status: PurchaseStatus.Refunded });
    console.log(`Purchase for order ${orderId} updated to refunded successfully.`);
  } catch (error) {
    throw new Error(`Error processing order refunded event: ${error}`);
  }
}
