import * as admin from 'firebase-admin';

export async function handleSubscriptionUpdated(data: any) {
  const orderId = data.order_id;
  const status = data.status; // e.g., 'active', 'paused', 'cancelled'

  // Retrieve the corresponding purchase
  const purchaseRef = admin.firestore().collection('purchases').doc(orderId);
  const purchase = await purchaseRef.get();

  if (!purchase.exists) {
    throw new Error(`No purchase found for order ID: ${orderId}`);
  }

  try {
    await purchaseRef.update({ status });
    console.log(`Purchase for order ${orderId} updated successfully.`);
  } catch (error) {
    throw new Error(`Error processing subscription updated event: ${error}`);
  }
}
