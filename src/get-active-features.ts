import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Feature, Purchase, PurchaseStatus } from './types';

const activeStatuses = [
  PurchaseStatus.OnTrial,
  PurchaseStatus.Active,
  PurchaseStatus.PastDue,
  PurchaseStatus.Cancelled
];

export const getActiveFeaturesForUser = functions.https.onRequest(async (req, res) => {
  const userId = req.params.userId;
  try {
    // Query purchases with specific active statuses
    const purchasesSnapshot = await admin.firestore().collection('purchases')
      .where('userId', '==', userId)
      .where('status', 'in', activeStatuses)
      .get();

    // Compile a list of active features
    const activeFeatures = compileActiveFeatures(purchasesSnapshot);
    res.send(activeFeatures);
  } catch (error) {
    throw new functions.https.HttpsError(
      'unknown', `Error retrieving active features: ${error}`);
  }
});

function compileActiveFeatures(purchasesSnapshot: admin.firestore.QuerySnapshot): string[] {
  let activeFeatures = new Set<string>();
  purchasesSnapshot.forEach(doc => {
    const purchase = doc.data() as Purchase;
    purchase.features.forEach(feature => {
      const isActive = checkFeatureActive(feature, purchase.created);
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
