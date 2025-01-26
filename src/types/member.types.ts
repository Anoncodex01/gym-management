export interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  membershipType: 'single' | 'couple' | 'corporate';
  hasInsurance: boolean;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  companyName?: string;
  profileImage?: File;
  profileImageUrl?: string | null;
  subscription?: {
    type: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
    startDate: string;
    endDate: string;
    status: 'active' | 'pending' | 'expired';
    amount: number;
  };
  registrationDate: string;
  status: 'active' | 'inactive';
}