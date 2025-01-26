export interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  hasInsurance: boolean;
  membershipType: 'single' | 'couple' | 'corporate';
}

export interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'airtel' | 'halopesa' | 'tigopesa' | 'mix_by_yas';
  last4: string;
  phoneNumber?: string;
  provider?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'TZS';
  status: 'pending' | 'succeeded' | 'failed';
  orderId?: string;
  paymentMethod?: PaymentMethod['type'];
  customerName?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
}

export interface BillingFrequency {
  type: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  monthsInterval: number;
  discountPercentage: number;
  amount: number;
}

export interface BillingConfig {
  frequencies: BillingFrequency[];
  basePrice: {
    single: number;
    couple: number;
    corporate: number;
  };
  insuranceDiscount: number;
  dayPassPrice: number;
  tenDayPassPrice: number;
}