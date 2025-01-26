export type PassType = 'day' | 'ten_day';

export interface Pass {
  id: string;
  type: PassType;
  userId: string;
  purchaseDate: Date;
  expiryDate: Date;
  totalVisits: number;
  remainingVisits: number;
  status: 'active' | 'expired' | 'fully_used';
  price: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export interface PassUsage {
  id: string;
  passId: string;
  userId: string;
  usageDate: Date;
  checkInTime: Date;
  checkOutTime?: Date;
}