export interface ClassAttendance {
  id: string;
  userId: string;
  classId: string;
  status: 'registered' | 'checked_in' | 'checked_out' | 'no_show';
  checkInTime?: Date;
  checkOutTime?: Date;
  insuranceUsed: boolean;
  billingStatus: 'pending' | 'processed' | 'claimed' | 'failed';
  billingAmount?: number;
  claimId?: string;
}

export interface ClassBillingConfig {
  standardRate: number;
  insuranceRate: number;
  autoSubmitClaim: boolean;
  requireCheckout: boolean;
}