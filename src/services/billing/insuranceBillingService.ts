import { InsuranceClaim } from '../../types/insurance.types';
import { Attendance } from '../../types/attendance.types';

export const insuranceBillingService = {
  submitAttendanceClaim: async (attendance: Attendance): Promise<InsuranceClaim> => {
    const response = await fetch('/api/insurance/submit-attendance-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance }),
    });
    return response.json();
  },

  processUnclaimedAttendance: async (): Promise<void> => {
    await fetch('/api/insurance/process-unclaimed', { method: 'POST' });
  }
};