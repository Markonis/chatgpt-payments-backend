import * as admin from "firebase-admin"
import { handleOrderRefunded } from "./order-refunded";
import { PurchaseStatus } from "../types";

// Mock setup (same as in previous test)
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({
  get: () => Promise.resolve({ exists: true, data: () => ({ /* existing purchase data */ }) }),
  update: mockUpdate
}));

const mockCollection = jest.fn(() => ({ doc: mockDoc }));

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: mockCollection
  })),
  initializeApp: jest.fn(),
}));

describe('handleOrderRefunded', () => {
  it('should update the purchase status to refunded', async () => {
    const mockData = {
      order_id: 'order_123'
      // Include any other relevant data that might be in the payload
    };

    await handleOrderRefunded(mockData);

    expect(admin.firestore().collection).toHaveBeenCalledWith('purchases');
    expect(admin.firestore().collection('purchases').doc).toHaveBeenCalledWith(mockData.order_id.toString());
    expect(mockUpdate).toHaveBeenCalledWith({ status: PurchaseStatus.Refunded });
  });
});
