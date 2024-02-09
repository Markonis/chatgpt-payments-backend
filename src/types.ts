// Define TypeScript interfaces
export enum PurchaseStatus {
  OnTrial = 'on_trial',
  Active = 'active',
  Paused = 'paused',
  PastDue = 'past_due',
  Unpaid = 'unpaid',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Refunded = 'refunded'
}

export interface Feature {
  name: string;
  expirationDays?: number; // Optional expiration period in days
}

export interface Offer {
  productId: string;
  name: string;
  description: string;
  features: Feature[];
}

export interface Purchase {
  userId: string;
  customerId: string;
  orderId: string; // Used for both orders and subscriptions
  offerId: string;
  features: Feature[];
  created: number; // Unix milliseconds timestamp
  status: PurchaseStatus;
}

export type WithId<T> = T & {id: string};
