// Import necessary libraries and functions
import * as admin from 'firebase-admin';
import { handleSubscriptionUpdated } from './subscription-updated'; // Adjust the import path
import { PurchaseStatus } from '../types';

// Mock Firestore setup
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({
  get: () => Promise.resolve({ exists: true, data: () => ({ /* existing purchase data */ }) }),
  update: mockUpdate
}));
const mockCollection = jest.fn(() => ({
  doc: mockDoc
}));

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: mockCollection
  }))
}));

// Tests for handleSubscriptionUpdated
describe('handleSubscriptionUpdated', () => {
  it('should update the purchase status based on subscription status', async () => {
    const mockData = {
      order_id: 'sub_123',
      status: PurchaseStatus.Active,
      // Add other fields from the Lemon Squeezy subscription object as needed
    };

    await handleSubscriptionUpdated(mockData);

    expect(admin.firestore().collection).toHaveBeenCalledWith('purchases');
    expect(admin.firestore().collection('purchases').doc).toHaveBeenCalledWith(mockData.order_id.toString());
    expect(mockUpdate).toHaveBeenCalledWith({ status: mockData.status });
  });

  // Add more test cases as needed, for example, testing different subscription statuses
});

