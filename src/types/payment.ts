export interface PaymentRequest {
  memberId: string;
  amount: number;
  subscription: {
    type: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  status: string;
}

export interface PaymentDetails {
  amount: number;
  planType: string;
  orderId: string;
  date: Date;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
}
