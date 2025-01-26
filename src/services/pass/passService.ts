import { Pass, PassUsage } from '../../types/pass.types';
import { addDays } from 'date-fns';

export const passService = {
  purchasePass: async (userId: string, type: PassType): Promise<Pass> => {
    const today = new Date();
    const expiryDate = type === 'day' 
      ? addDays(today, 1)
      : addDays(today, 30);

    const response = await fetch('/api/passes/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type,
        purchaseDate: today,
        expiryDate,
        totalVisits: type === 'day' ? 1 : 10,
        remainingVisits: type === 'day' ? 1 : 10,
        status: 'active'
      }),
    });
    return response.json();
  },

  validatePass: async (passId: string): Promise<boolean> => {
    const response = await fetch(`/api/passes/${passId}/validate`);
    const data = await response.json();
    return data.valid;
  },

  usePass: async (passId: string): Promise<PassUsage> => {
    const response = await fetch(`/api/passes/${passId}/use`, {
      method: 'POST',
    });
    return response.json();
  },

  getUserPasses: async (userId: string): Promise<Pass[]> => {
    const response = await fetch(`/api/passes/user/${userId}`);
    return response.json();
  }
};