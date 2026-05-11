import { Timestamp } from 'firebase/firestore';

export type UserRole = 'client' | 'restaurant' | 'admin';
export type CouponStatus = 'saved' | 'requested' | 'accepted' | 'redeemed' | 'expired';
export type BillStatus = 'open' | 'waiting_client_feedback' | 'closed' | 'reported' | 'cancelled';
export type FeedbackType = 'pending' | 'positive' | 'negative';
export type ReportType = 'discount_not_applied' | 'tip_issue' | 'staff_issue' | 'bad_experience' | 'other';
export type RedemptionStatus = 'confirmed' | 'cancelled';

export interface UserProfile {
  uid: string;
  code: string;
  name: string;
  email: string;
  role: UserRole;
  frequentLevel: string;
  completedVisits: number;
  totalSavings: number;
  positiveInteractions: number;
  openReports: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  ownerUid: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  id: string;
  venueId: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Coupon {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'two_for_one';
  discountValue: number;
  imageUrl: string;
  combinable: boolean;
  active: boolean;
  validFrom: Timestamp;
  validUntil: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SavedCoupon {
  id: string;
  userId: string;
  couponId: string;
  venueId: string;
  status: CouponStatus;
  selectedForNextBill: boolean;
  savedAt: Timestamp;
  requestedAt?: Timestamp;
  acceptedAt?: Timestamp;
  redeemedAt?: Timestamp;
}

export interface BillItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AppliedCoupon {
  couponId: string;
  title: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

export interface ActiveBill {
  id: string;
  userId: string;
  userCode: string;
  userName: string;
  venueId: string;
  venueName: string;
  status: BillStatus;
  items: BillItem[];
  appliedCoupons: AppliedCoupon[];
  originalTotal: number;
  discountTotal: number;
  finalTotal: number;
  suggestedTip10: number;
  suggestedTip12: number;
  suggestedTip15: number;
  savings: number;
  restaurantFeedback: FeedbackType;
  clientFeedback: FeedbackType;
  hasReport: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  closedAt?: Timestamp;
}

export interface Redemption {
  id: string;
  billId?: string;
  userId: string;
  userName?: string;
  venueId: string;
  venueName?: string;
  couponId?: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  suggestedTip10: number;
  suggestedTip12: number;
  suggestedTip15: number;
  savings: number;
  status: RedemptionStatus;
  createdAt: Timestamp;
  confirmedAt?: Timestamp;
}

export interface Report {
  id: string;
  billId: string;
  userId: string;
  userName?: string;
  venueId: string;
  venueName?: string;
  origin: 'client' | 'restaurant' | 'admin';
  type: ReportType;
  description: string;
  adminNotes?: string;
  status: 'open' | 'resolved';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  resolvedAt?: Timestamp;
}
