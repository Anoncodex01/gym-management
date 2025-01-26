import { ClassAttendance, ClassBillingConfig } from '../../types/classAttendance.types';

export const classAttendanceService = {
  checkInToClass: async (
    userId: string,
    classId: string,
    useInsurance: boolean
  ): Promise<ClassAttendance> => {
    const response = await fetch('/api/class-attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, classId, useInsurance }),
    });
    return response.json();
  },

  checkOutFromClass: async (attendanceId: string): Promise<ClassAttendance> => {
    const response = await fetch(`/api/class-attendance/${attendanceId}/check-out`, {
      method: 'POST',
    });
    return response.json();
  },

  getClassAttendance: async (classId: string): Promise<ClassAttendance[]> => {
    const response = await fetch(`/api/class-attendance/${classId}`);
    return response.json();
  },

  processAttendanceBilling: async (attendanceId: string): Promise<void> => {
    await fetch(`/api/class-attendance/${attendanceId}/process-billing`, {
      method: 'POST',
    });
  }
};