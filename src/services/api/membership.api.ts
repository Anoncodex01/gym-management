import axios from 'axios';
import { MembershipPlan } from '../../types/membership.types';

const API_URL = process.env.REACT_APP_API_URL;

export const membershipApi = {
  getPlans: async () => {
    const response = await axios.get(`${API_URL}/membership/plans`);
    return response.data;
  },
  
  subscribeToPlan: async (planId: string, userId: string, insuranceDetails?: any) => {
    const response = await axios.post(`${API_URL}/membership/subscribe`, {
      planId,
      userId,
      insuranceDetails
    });
    return response.data;
  }
};