export interface InsuranceProvider {
  id: string;
  name: 'Assemble' | 'Ragis' | string;
  apiKey?: string;
  baseUrl: string;
}

export interface InsuranceClaim {
  id: string;
  userId: string;
  providerId: string;
  visitDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  serviceType: 'gym_visit' | 'class_attendance';
  response?: any;
}

export interface UserInsurance {
  id: string;
  userId: string;
  providerId: string;
  membershipNumber: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
  coverageDetails: {
    visitsPerMonth?: number;
    maxAmountPerVisit?: number;
    classesIncluded: boolean;
  };
}