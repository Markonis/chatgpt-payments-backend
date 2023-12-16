import * as admin from "firebase-admin"
import { handleOrderCreated } from "./order-created";
import { PurchaseStatus } from "../types";

// Mock setup (same as in previous test)
const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockOfferData = {
  productId: '123',
  features: [
    { name: 'Feature1', expirationDays: 30 },
    { name: 'Feature2' } // Lifetime feature
  ]
};
const mockGet = jest.fn(() => Promise.resolve({
  empty: false,
  docs: [{ id: 'some_offer_id', data: () => mockOfferData }]
}));
const mockWhere = jest.fn(() => ({ get: mockGet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc, where: mockWhere }));

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: mockCollection
  })),
  initializeApp: jest.fn(),
}));

describe('handleOrderCreated', () => {
  it('should create an order purchase', async () => {
    const mockData = {
      order_id: 'order_123',
      product_id: '123',
      customer_id: 'cust_123',
      // Add other necessary fields from the webhook payload
      meta: { custom_data: { userId: 'user_123' } },
    };

    await handleOrderCreated(mockData);

    expect(admin.firestore().collection).toHaveBeenCalledWith('offers');
    expect(mockWhere).toHaveBeenCalledWith('productId', '==', '123');
    expect(mockGet).toHaveBeenCalled();

    const expectedPurchaseDoc = {
      userId: 'user_123',
      customerId: 'cust_123',
      orderId: 'order_123',
      offerId: 'some_offer_id',
      features: mockOfferData.features,
      purchaseDate: expect.any(Number),
      status: PurchaseStatus.Active
    };

    expect(admin.firestore().collection("purchases").doc().set)
      .toHaveBeenCalledWith(expectedPurchaseDoc);
  });
});
