import { InsuranceClaim, UserInsurance } from '../../types/insurance.types';

export const insuranceService = {
  verifyInsurance: async (providerId: string, membershipNumber: string): Promise<UserInsurance> => {
    const response = await fetch('/api/insurance/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, membershipNumber }),
    });
    return response.json();
  },

  submitClaim: async (userId: string, visitDate: Date, serviceType: string): Promise<InsuranceClaim> => {
    const response = await fetch('/api/insurance/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, visitDate, serviceType }),
    });
    return response.json();
  },

  getClaimHistory: async (userId: string): Promise<InsuranceClaim[]> => {
    const response = await fetch(`/api/insurance/claims/${userId}`);
    return response.json();
  }
};