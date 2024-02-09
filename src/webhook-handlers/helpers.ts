import * as admin from 'firebase-admin';
import { Offer, Purchase, WithId } from '../types';

export async function getOfferByProductId(productId: any): Promise<WithId<Offer>> {
  const offers = await admin.firestore()
    .collection('offers')
    .where('productId', '==', productId)
    .get();

  if (offers.empty) {
    throw new Error(`No offer found for product ID: ${productId}`);
  }

  const offer: WithId<Offer> = {
    id: offers.docs[0].id,
    ...offers.docs[0].data()
  } as any;

  return offer;
}


export function createPurchase(orderId: string, purchaseDoc: Purchase) {
  return admin.firestore().collection('purchases').doc(orderId).set(purchaseDoc);
}
