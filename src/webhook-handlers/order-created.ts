import { PurchaseStatus } from '../types';
import { createPurchase, getOfferByProductId } from './helpers';

export async function handleOrderCreated(data: any) {
  try {
    const offer = await getOfferByProductId(data.product_id);
    await createPurchase(data.order_id, {
      customerId: data.customer_id,
      userId: data.meta.custom_data.userId,
      orderId: data.order_id,
      offerId: offer.id,
      features: offer.features,
      created: Date.now(),
      status: PurchaseStatus.Active,
    });
    console.log(`Purchase for order ${data.order_id} created/updated successfully.`);
  } catch (error) {
    throw new Error(`Error processing order created event: ${error}`);
  }
}
