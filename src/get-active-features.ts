import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Feature, Purchase, PurchaseStatus } from './types';

export const getActiveFeaturesForUser = functions.https.onCall(async (data, context) => {
  // Ensure that the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;

  try {
    // Query purchases with specific active statuses
    const activeStatuses = [PurchaseStatus.OnTrial, PurchaseStatus.Active, PurchaseStatus.PastDue, PurchaseStatus.Cancelled];
    const purchasesSnapshot = await admin.firestore().collection('purchases')
      .where('userId', '==', userId)
      .where('status', 'in', activeStatuses)
      .get();

    // Compile a list of active features
    const activeFeatures = compileActiveFeatures(purchasesSnapshot);

    return activeFeatures;
  } catch (error) {
    throw new functions.https.HttpsError('unknown', `Error retrieving active features: ${error}`);
  }
});

function compileActiveFeatures(purchasesSnapshot: admin.firestore.QuerySnapshot): string[] {
  let activeFeatures = new Set<string>();
  purchasesSnapshot.forEach(doc => {
    const purchase = doc.data() as Purchase;
    purchase.features.forEach(feature => {
      const isActive = checkFeatureActive(feature, purchase.purchaseDate);
      if (isActive) {
        activeFeatures.add(feature.name);
      }
    });
  });
  return Array.from(activeFeatures);
}


function checkFeatureActive(feature: Feature, purchaseDate: number): boolean {
  if (feature.expirationDays) {
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + feature.expirationDays);
    return expirationDate.getTime() > Date.now();
  }
  return true; // Lifetime access if no expirationDays is set
}
