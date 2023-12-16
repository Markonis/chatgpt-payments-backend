// In your test file
import * as admin from "firebase-admin"
import { handleSubscriptionCreated } from './subscription-created'; // Adjust the import based on your file structure
import { PurchaseStatus } from "../types";

// Define mock functions
const mockOfferData = {
  productId: 'mock_product_id',
  name: 'Mock Offer',
  description: 'This is a mock offer description',
  features: [
    { name: 'Feature1', expirationDays: 30 },
    { name: 'Feature2' } // Lifetime feature
  ]
};

const mockGet = jest.fn(() => Promise.resolve({
  empty: false,
  docs: [{
    id: 'some_offer_id',
    data: () => mockOfferData
  }]
}));

const mockWhere = jest.fn(() => ({ get: mockGet }));
const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc, where: mockWhere }));

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: mockCollection
  })),
  initializeApp: jest.fn(),
}));

describe('handleSubscriptionCreated', () => {
  it('should create a subscription purchase', async () => {
    const mockData = {
      product_id: '123',
      customer_id: 'user_123',
      order_id: 'order_123',
      subscription_id: 'sub_123',
      meta: { custom_data: { userId: 'user_123' } },
    };

    await handleSubscriptionCreated(mockData);

    expect(admin.firestore().collection).toHaveBeenCalledWith('purchases');
    expect(admin.firestore().collection("purchases").doc).toHaveBeenCalledWith(mockData.order_id.toString());

    const expectedPurchaseDoc = {
      userId: mockData.meta.custom_data.userId,
      customerId: mockData.customer_id,
      orderId: mockData.order_id,
      offerId: expect.any(String),
      features: expect.any(Array),
      purchaseDate: expect.any(Number),
      status: PurchaseStatus.Active
    };

    expect(admin.firestore().collection("purchases").doc().set)
      .toHaveBeenCalledWith(expectedPurchaseDoc);
  });
});
