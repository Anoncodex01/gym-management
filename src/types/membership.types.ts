export interface MembershipPlan {
  id: string;
  type: 'single' | 'couple' | 'corporate';
  name: string;
  price: number;
  billingFrequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  features: string[];
  description: string;
}

export interface InsuranceProvider {
  id: string;
  name: 'Assemble' | 'Ragis' | string;
  description: string;
}